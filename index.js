import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRouter from "./src/routes/auth.js";
import imageRouter from "./src/routes/image.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/auth", authRouter);
app.use("/images", imageRouter);

mongoose
    .connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`)
    .then(async () => {
        console.log("MongoDB connected");

        // try {
        //     await redisClient.connect();
        //     console.log("Redis connected");
        // } catch (err) {
        //     console.error("Redis connection error:", err);
        // }

        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server running on PORT: ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });
