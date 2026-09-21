import express from "express";
import { getUserPost, likePost, getFeedPost } from "../controllers/posts.js";
import { verifyToken } from "../middleware/middlewareAuth.js";

const router = express.Router();

/* READ */
router.get("/", verifyToken, getFeedPost);
router.get("/:userId/posts", verifyToken, getUserPost);

/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);

export default router;