import express from "express";
import { login, logout, googleAuth } from "../controllers/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";

// allow to identify that this routes will all be configured and to have this in a separate file
const router = express.Router();

// prefix to login
router.post("/login", authLimiter, login);
router.post("/logout", logout);

// Google OAuth / OpenID Connect — receives the Google ID token from the frontend,
// verifies it server-side, then issues the same JWT session cookie as regular login
router.post("/google", authLimiter, googleAuth);

export default router;
