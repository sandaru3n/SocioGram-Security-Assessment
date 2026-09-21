import express from "express";
import {
	getUser, getUserFriends, addRemoveFriends,
} from "../controllers/users.js";
import { verifyToken } from "../middleware/middlewareAuth.js";


const router = express.Router();

// READ

router.get("/:id", verifyToken, getUser);
router.get("/:id/friends", verifyToken, getUserFriends);

// UPDATE
// in this one
router.patch("/:id/:friendId", verifyToken, addRemoveFriends);

export default router;