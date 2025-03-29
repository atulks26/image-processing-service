import express from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth";
import {
    uploadImageController,
    deleteImagesController,
    getImageKeyController,
    getImageUserController,
    transformImageController,
} from "../controllers/image";

const imageRouter = express.Router();
const upload = multer({ dest: "uploads/" });

imageRouter.get("/", authMiddleware, getImageUserController);
imageRouter.get("/:key", getImageKeyController);
imageRouter.post(
    "/upload",
    authMiddleware,
    upload.array("images", 6), //change to increase upload limit in one operation
    uploadImageController
);
imageRouter.post("/transform/:key", authMiddleware, transformImageController);
imageRouter.delete("/:key", authMiddleware, deleteImagesController);

export default imageRouter;
