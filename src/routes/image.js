import express from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.js";
import {
    uploadImageController,
    deleteImagesController,
    getImageKeyController,
    getImageUserController,
    transformImageController,
} from "../controllers/image.js";

const imageRouter = express.Router();
const uploadImg = multer({ dest: "uploads/" }).array("files", 6); //change to increase upload limit in one operation

imageRouter.get("/", authMiddleware, getImageUserController);
imageRouter.get("/:key", getImageKeyController);
imageRouter.post("/upload", authMiddleware, uploadImg, uploadImageController);
imageRouter.post("/transform/:key", authMiddleware, transformImageController);
imageRouter.delete("/:key", authMiddleware, deleteImagesController);

export default imageRouter;
