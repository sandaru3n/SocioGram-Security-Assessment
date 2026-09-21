import express from "express";
import { login } from "../controllers/auth.js";

// allow to identify that this routes will all be configured and to have this in a separate file
const router = express.Router();

// prefix to login
router.post("/login", login);

export default router;