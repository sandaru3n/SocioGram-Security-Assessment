import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const assetsDir = path.resolve(__dirname, "../public/assets");

const ALLOWED_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const IMAGE_CONTENT_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const SAFE_FILENAME = /^(?!.*\.\.)[A-Za-z0-9 ._()\-]+$/;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function hasImageSignature(buffer, mimetype) {
  if (mimetype === "image/jpeg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimetype === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }
  if (mimetype === "image/webp") {
    return (
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    );
  }
  return false;
}

fs.mkdirSync(assetsDir, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, assetsDir);
  },
  filename(req, file, cb) {
    const ext = ALLOWED_TYPES[file.mimetype];
    if (!ext) {
      cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
      return;
    }
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
  fileFilter(req, file, cb) {
    if (!ALLOWED_TYPES[file.mimetype]) {
      cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
      return;
    }
    cb(null, true);
  },
});

export function uploadImage(req, res, next) {
  upload.single("picture")(req, res, async (err) => {
    if (err) {
      if (req.file?.path) {
        await fs.promises.unlink(req.file.path).catch(() => {});
      }
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Image must be 2MB or smaller"
          : err.message || "Upload rejected";
      return res.status(400).json({ error: message });
    }

    if (!req.file) return next();

    try {
      const handle = await fs.promises.open(req.file.path, "r");
      const buffer = Buffer.alloc(12);
      await handle.read(buffer, 0, 12, 0);
      await handle.close();

      if (!hasImageSignature(buffer, req.file.mimetype)) {
        await fs.promises.unlink(req.file.path).catch(() => {});
        return res.status(400).json({
          error: "File content does not match an allowed image type",
        });
      }

      return next();
    } catch {
      if (req.file?.path) {
        await fs.promises.unlink(req.file.path).catch(() => {});
      }
      return res.status(400).json({ error: "Could not validate uploaded file" });
    }
  });
}

export function serveAsset(req, res) {
  let filename = req.params.filename || "";
  try {
    filename = decodeURIComponent(filename);
  } catch {
    return res.status(400).json({ error: "Invalid filename" });
  }

  if (filename !== path.basename(filename) || !SAFE_FILENAME.test(filename)) {
    return res.status(400).json({ error: "Invalid filename" });
  }

  const filePath = path.resolve(assetsDir, filename);
  const relative = path.relative(assetsDir, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return res.status(400).json({ error: "Invalid filename" });
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = IMAGE_CONTENT_TYPES[ext];

  res.setHeader("X-Content-Type-Options", "nosniff");
  if (contentType) {
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", "inline");
  } else {
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
  }

  return res.sendFile(filePath, (err) => {
    if (!err || res.headersSent) return;
    const status = err.code === "ENOENT" ? 404 : 500;
    res.status(status).json({ error: status === 404 ? "File not found" : "Could not read file" });
  });
}
