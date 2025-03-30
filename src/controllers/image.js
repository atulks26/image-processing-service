import {
    uploadImage,
    getImageByKey,
    getImagesByUser,
    transformImage,
    deleteImages,
} from "../utils/imageFunctions.js";

export const uploadImageController = async (req, res) => {
    //modify for mutiple images?
    try {
        const { file } = req;
        const userId = req.userId;

        if (!file || !userId) {
            res.status(400).json({ message: "File and userId are required" });
        }

        const data = await uploadImage(file, userId);
        const url = data.url;

        return res
            .status(201)
            .json({ url, message: "Image uploaded successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Error uploading image", err });
    }
};

export const transformImageController = async (req, res) => {
    try {
        const { file } = req;
        const { transformations } = req.body;

        if (!file) {
            res.status(400).json({ message: "File is required" });
        }

        const data = await transformImage(file, transformations);

        return res.status(201).json(data);
    } catch (err) {
        return res.status(500).json(err);
    }
};

export const getImageKeyController = async (req, res) => {
    try {
        const { key } = req.body;

        const data = await getImageByKey(key);

        res.status(201).json(data);
    } catch (err) {
        return res.status(500).json(err);
    }
};

export const getImageUserController = async (req, res) => {
    try {
        const { userId } = req.body;

        const data = await getImagesByUser(userId);

        res.status(201).json(data);
    } catch (err) {
        return res.status(500).json(err);
    }
};

export const deleteImagesController = async (req, res) => {
    try {
        const { key } = req.body;

        const data = await deleteImages(key);

        res.status(201).json(data);
    } catch (err) {
        return res.status(500).json(err);
    }
};
