import Post from "../models/Post.js";
import User from "../models/User.js";
// CREATE

const createPost = async (req, res) => {
	try {
		const { userId, description } = req.body;
		const picturePath = req.file ? req.file.filename : "";
		const user = await User.findById(userId);
		const newPost = new Post({
			userId,
			firstName: user.firstName,
			lastName: user.lastName,
			location: user.location,
			description,
			userPicturePath: user.picturePath,
			picturePath,
			likes: {},
			comments: []
		})
		await newPost.save();

		const post = await Post.find();
		res.status(201).json(post);
	}
	catch (err) {
		console.error(err);
		res.status(500).json({ message: "Internal server error" });
	}
}

// READ
// 201 means created something , 200 means the request is successful
const getFeedPost = async (req, res) => {
	try {
		const post = await Post.find();
		res.status(200).json(post);
	}
	catch (err) {
		console.error(err);
		res.status(500).json({ message: "Internal server error" });
	}
}

const getUserPost = async (req, res) => {
	try {
		const { userId } = req.params;
		const post = await Post.find({ userId });
		res.status(200).json(post);
	}
	catch (err) {
		console.error(err);
		res.status(500).json({ message: "Internal server error" });
	}
}

// UPDATE

const likePost = async (req, res) => {
	try {
		const { id } = req.params;
		const { userId } = req.body;
		const post = await Post.findById(id);
		const isLiked = post.likes.get(userId);

		if (isLiked) {
			post.likes.delete(userId);
		}
		else {
			post.likes.set(userId, true);
		}

		const updatedPost = await Post.findByIdAndUpdate(
			id,
			{ likes: post.likes },
			{ new: true },
		);
		res.status(200).json(updatedPost);
	}
	catch (err) {
		console.error(err);
		res.status(500).json({ message: "Internal server error" });
	}
}

export {
	createPost,
	getFeedPost,
	getUserPost,
	likePost,
}
