import jwt from 'jsonwebtoken';

export const verifyToken = async (req, res, next) => {
	try {
		const token = req.cookies?.token;

		if (!token) {
			return res.status(403).send("Access Denied");
		}

		const verified = jwt.verify(token, process.env.JWT_SECRET);
		req.user = verified;
		next();
	}
	catch(err) {
		console.error(err);
		res.status(401).json({ error: "Unauthorized" });
	}
}

