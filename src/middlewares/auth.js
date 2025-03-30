import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token not found" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decoded.userId;

        if (!req.userId) {
            return res.status(401).json({ message: "Invalid token" });
        }

        next();
    } catch (err) {
        return res
            .status(401)
            .json({
                message: "Error during authorization",
                error: err.message,
            });
    }
};
