import {
    uploadImage,
    getImageByKey,
    getImagesByUser,
    transformImage,
    deleteImages,
} from "../utils/imageFunctions.js";

export const uploadImageController = async (req, res) => {
    try {
        const { userId } = req.body;
        const files = req.files;

        if (!files || files.length === 0 || !userId) {
            return res
                .status(400)
                .json({ message: "File and userId are required" });
        }

        const data = await uploadImage(files, userId);
        return res
            .status(201)
            .json({ data, message: "Image uploaded successfully" });
    } catch (err) {
        return res
            .status(500)
            .json({ message: "Error uploading image", error: err.message });
    }
};

export const transformImageController = async (req, res) => {
    try {
        const files = req.files;
        const { transformations } = req.body;

        if (!files) {
            res.status(400).json({ message: "File is required" });
        }

        const data = await transformImage(files, transformations);
        return res.status(201).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const getImageKeyController = async (req, res) => {
    try {
        const { key } = req.params;

        const data = await getImageByKey(key);
        res.status(201).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const getImageUserController = async (req, res) => {
    try {
        const { userId } = req.body;

        const data = await getImagesByUser(userId);
        res.status(201).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const deleteImagesController = async (req, res) => {
    try {
        const { key } = req.body;

        const data = await deleteImages(key);
        res.status(201).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
