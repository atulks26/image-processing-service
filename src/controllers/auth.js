import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const signup = async (req, res) => {
    const { username, password } = req.body;

    try {
        const userCheck = await User.findOne({ username: username });

        if (userCheck) {
            return res.status(400).json({ message: "Username taken" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            password: passwordHash,
        });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        res.status(201).json({ token, message: "Registration successful" });
    } catch (err) {
        res.stats(500).json({ message: "Registration failed", error: err });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username: username });

        if (!user) {
            return res
                .status(404)
                .json({ message: "No user found with that username" });
        }

        const checkPass = await bcrypt.compare(password, user.password);

        if (!checkPass) {
            return res
                .status(403)
                .json({ messageL: "Invalid username password combination" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        res.status(200).json({
            message: "Logged in successfully",
            user: username,
        });
    } catch (err) {
        res.status(500).json({ message: "Login failed", error: err });
    }
};

export { login, signup };
