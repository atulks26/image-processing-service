import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRouter from "./src/routes/auth.js";
import imageRouter from "./src/routes/image.js";

//add redis

dotenv.config();

const app = express();

app.use(express.json());

app.use("/auth", authRouter);
app.use("/images", imageRouter);

mongoose
    .connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`)
    .then(() => {
        console.log("MongoDB connected");

        //add redis

        app.listen(process.env.PORT, () => {
            console.log(`Server running on PORT: ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });
