import sharp from "sharp";
import { s3Upload, s3Delete, s3Get } from "../utils/awsFunctions";
import Image from "../models/image.model.js";

//add redis

export const uploadImage = async (file, userId) => {
    //modify upload for multiple files
    const data = await s3Upload(file);
    const imageBuffer = file.readFileSync(file.path);
    const metadata = await sharp(imageBuffer).metadata();

    await Image.create({
        user: userId,
        key: data.key,
        url: data.url,
        metadata: metadata,
    });

    return data;
};

export const transformImage = async (key, transformations) => {
    //check cache here
    if (!transformations) return;

    try {
        const imageData = Image.findOne({ key: key });

        if (!imageData) {
            return console.log("Image not found");
        }

        let image = await sharp(imageData.url);

        if (transformations.resize) {
            image = await image.resize(transformations.resize);
        }

        if (transformations.rotate) {
            image = await image.rotate(transformations.rotate);
        }

        if (transformations.flip) {
            image = await image.flip();
        }

        if (transformations.mirror) {
            image = await image.flop();
        }

        if (transformations.crop) {
            image = await image.extract(transformations.crop);
        }

        if (transformations.watermark) {
            image = await image.composite([transformations.watermark]);
        }

        if (transformations.compress) {
            const format = imageData.metadata.format;
            const compression = transformations.compress.compressionLevel;
            const quality = 100 - compression * 10;

            if (format == "jpeg") {
                image.jpeg({ quality: quality });
            } else if (format == "webp") {
                image.webp({ quality: quality });
            } else if (format == "png") {
                image.png({ compressionLevel: compression });
            } else {
                return console.error("Invalid file type");
            }
        }

        if (transformations.convert) {
            image = image.toFormat(transformations.convert);
        }

        const newImageBuffer = image.toBuffer();

        const data = await s3Upload([newImageBuffer]);

        await Image.create({
            user: userId,
            key: data.key,
            url: data.url,
            metadata: image.metadata,
        });

        return {
            message: "Image transformed successfully",
            url: data.url,
            key: data.key,
            metadata: image.metadata,
        };

        //add to cache
    } catch (err) {
        return console.log("Error occured while applying transformations", err);
    }
};

export const getImageByKey = async (key) => {
    const data = await s3Get([key]);
    return data;
};

export const getImagesByUser = async (userId) => {
    const data = Image.find({ user: userId });
    const keys = [];

    await data.map(async (image) => {
        keys.push(image.key);
    });

    const result = await s3Get(keys);
    return result;
};

export const deleteImages = async (keys) => {
    //modify delete for multiple files
    const result = await s3Delete(keys);
    return result;
};
