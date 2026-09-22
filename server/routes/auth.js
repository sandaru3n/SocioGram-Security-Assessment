import express from "express";
import { login, logout } from "../controllers/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";

// allow to identify that this routes will all be configured and to have this in a separate file
const router = express.Router();

// prefix to login
router.post("/login", authLimiter, login);
router.post("/logout", logout);

export default router;