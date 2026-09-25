import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";

// Google OAuth2 client — used to verify ID tokens issued by Google Sign-In
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


/* REGISTER USER */
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      friends,
      location,
      occupation,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "A profile image is required" });
    }

    // Prevent NoSQL Injection by ensuring email is strictly a string
    const safeEmail = String(email);
    const existingUser = await User.findOne({ email: safeEmail });
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    const picturePath = req.file.filename;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const AUTH_FAILURE_MSG = "Invalid email or password.";


const DUMMY_PASSWORD_HASH =
  "$2b$10$1evgTw.k1pTqPlRnOZYwL.1BZagbFkQqOQXPWwHByQirO.Szw04By";

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Prevent NoSQL Injection by ensuring inputs are strictly strings
    const safeEmail = String(email);
    const safePassword = String(password);

    const user = await User.findOne({ email: safeEmail });

    const hash = user?.password ?? DUMMY_PASSWORD_HASH;
    const isMatch = await bcrypt.compare(safePassword, hash);

    if (!user || !isMatch) {
      return res.status(400).json({ msg: AUTH_FAILURE_MSG });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const userObj = user.toObject();
    delete userObj.password;

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1 hour — matches JWT expiry
      path: "/",
    });

    return res.status(200).json({ user: userObj });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* LOGGING OUT */
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return res.status(200).json({ msg: "Logged out successfully" });
};

/* GOOGLE OAUTH — OpenID Connect (Authorization Code / ID-token grant)
 *
 * Flow:
 *  1. Frontend uses @react-oauth/google to obtain a Google ID token (credential).
 *  2. Frontend POSTs that credential to this endpoint.
 *  3. We verify the token server-side using google-auth-library (OAuth2Client.verifyIdToken).
 *  4. We extract the verified payload: sub (Google UID), email, given_name, family_name, picture.
 *  5. We look up the user by googleId OR email.
 *     - Found  → log them in (issue JWT cookie).
 *     - Not found → auto-create account from Google profile, then issue JWT cookie.
 *  6. The JWT cookie issued here is identical to the one from email/password login,
 *     so all downstream verifyToken middleware works without any changes.
 */
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: "Google credential token is required." });
    }

    // Verify the ID token issued by Google (OpenID Connect)
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name: firstName, family_name: lastName, picture } = payload;

    if (!email) {
      return res.status(400).json({ error: "Google account does not have a verified email." });
    }

    // Try to find an existing user — first by googleId, then by email (for account linking)
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email: String(email) });
    }

    if (!user) {
      // First-time Google sign-in → auto-create account from Google profile data
      user = new User({
        firstName: firstName || "Google",
        lastName: lastName || "User",
        email: String(email),
        googleId,
        // Google profile picture URL used as picturePath; no local upload required
        picturePath: picture || "",
        friends: [],
        location: "",
        occupation: "",
        viewedProfile: Math.floor(Math.random() * 10000),
        impressions: Math.floor(Math.random() * 10000),
      });
      await user.save();
    } else if (!user.googleId) {
      // Existing email/password account — link it to Google on first OAuth sign-in
      user.googleId = googleId;
      await user.save();
    }

    // Issue the same JWT cookie as the standard email/password login flow
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const userObj = user.toObject();
    delete userObj.password;

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1 hour — matches JWT expiry
      path: "/",
    });

    return res.status(200).json({ user: userObj });
  } catch (err) {
    console.error("Google OAuth error:", err);
    return res.status(401).json({ error: "Google authentication failed. Please try again." });
  }
};
