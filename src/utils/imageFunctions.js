import sharp from "sharp";
import { s3Upload, s3Delete, s3Get } from "../utils/awsFunctions.js";
import Image from "../models/image.model.js";
import redisClient from "../config/redis.js";
import fs from "fs";
import axios from "axios";

export const uploadImage = async (files, userId) => {
    const data = await s3Upload(files);

    const imageDocuments = await Promise.all(
        files.map(async (file, index) => {
            const imageBuffer = await fs.promises.readFile(file.path);
            const metadata = await sharp(imageBuffer).metadata();

            return {
                user: userId,
                key: data[index].key,
                url: data[index].url,
                metadata: metadata,
            };
        })
    );

    await Image.insertMany(imageDocuments);

    for (const doc of imageDocuments) {
        const imageData = {
            key: doc.key,
            url: doc.url,
            user: doc.user,
        };

        await redisClient.setEx(doc.key, 3600, JSON.stringify(imageData));
    }

    return data;
};

export const transformImage = async (key, transformations) => {
    let imageData;
    let fetchImage;

    const checkCache = await redisClient.getAsync(key);
    if (checkCache) {
        imageData = JSON.parse(checkCache);
    } else {
        fetchImage = await Image.findOne({ key: key });
        if (!fetchImage) {
            console.log("Image not found");

            return;
        }

        const newImageData = {
            key: fetchImage.key,
            url: fetchImage.url,
            user: fetchImage.user,
        };

        await redisClient.setEx(key, 3600, JSON.stringify(newImageData));

        imageData = fetchImage.url;
    }

    if (!transformations) return;

    try {
        const response = await axios.get(imageData, {
            responseType: "arraybuffer",
        });

        let image = sharp(response.data);

        if (transformations.resize) {
            image = image.resize(transformations.resize);
        }

        if (transformations.rotate) {
            image = image.rotate(transformations.rotate);
        }

        if (transformations.flip) {
            image = image.flip();
        }

        if (transformations.mirror) {
            image = image.flop();
        }

        if (transformations.crop) {
            image = image.extract(transformations.crop);
        }

        if (transformations.watermark) {
            const watermarkResponse = await axios.get(
                transformations.watermark,
                { responseType: "arraybuffer" }
            );
            const watermarkBuffer = Buffer.from(watermarkResponse.data);

            image = image.composite([
                {
                    input: watermarkBuffer,
                    gravity: "center",
                    blend: "multiply",
                },
            ]);
        }

        if (transformations.compress) {
            const origMetadata =
                fetchImage && fetchImage.metadata
                    ? fetchImage.metadata
                    : await image.metadata();
            const compression = transformations.compress.compressionLevel;
            const quality = 100 - compression * 10;

            if (origMetadata.format == "jpeg") {
                image.jpeg({ quality: quality });
            } else if (origMetadata.format == "webp") {
                image.webp({ quality: quality });
            } else if (origMetadata.format == "png") {
                image.png({ compressionLevel: compression });
            } else {
                return console.error("Invalid file type");
            }
        }

        if (transformations.convert) {
            image = image.toFormat(transformations.convert);
        }

        const newImageBuffer = await image.toBuffer();
        const newMetadata = await sharp(newImageBuffer).metadata();

        const fileObject = {
            buffer: newImageBuffer,
            mimetype: `image/${newMetadata.format}`,
        };

        const data = await s3Upload([fileObject]);

        await Image.create({
            user: fetchImage,
            key: data[0].key,
            url: data[0].url,
            metadata: newMetadata,
        });

        return {
            message: "Image transformed successfully",
            url: data[0].url,
            key: data[0].key,
            metadata: image.metadata,
        };
    } catch (err) {
        return console.log("Error occured while applying transformations", err);
    }
};

export const getImageByKey = async (key) => {
    const data = await s3Get([key]);

    return data;
};

export const getImagesByUser = async (userId) => {
    console.log(userId);
    const data = await Image.find({ user: userId });
    const keys = [];

    await data.map(async (image) => {
        keys.push(image.key);
    });

    console.log(keys);
    const result = await s3Get(keys);

    return result;
};

export const deleteImages = async (keys) => {
    const result = await s3Delete(keys);

    return result;
};
