import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from './middleware/middlewareAuth.js';
import { uploadImage, serveAsset } from "./middleware/upload.js";
// import User from './models/User.js';
// import Post from "./models/Post.js";
// import { users, posts } from "./data/index.js";

/* CONFIGURATIONS */
dotenv.config();
const app = express();

app.use(cors(
  {
    origin: ["http://localhost:3000", "https://sociogram-aryant10.vercel.app", "http://sociogram-api.vercel.app"],
    "preflightContinue": false,
    "optionsSuccessStatus": 204,
  }
));
app.use(express.json());

// app.use(cors({
//   origin: "https://sociogram-aryant10.vercel.app",
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   credentials: true,
// }));


app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.get("/assets/:filename", serveAsset);
app.options("*", cors());

/* ROUTES WITH FILES */
app.post("/auth/register", uploadImage, register);
app.post("/posts", verifyToken, uploadImage, createPost);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    /* ADD DATA ONE TIME */
    // User.insertMany(users);
    // Post.insertMany(posts);
  })
  .catch((error) => console.log(`${error} did not connect`));
