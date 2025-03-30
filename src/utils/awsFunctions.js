import {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";
import sharp from "sharp";

dotenv.config();

const s3client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export const generateFileHash = (filePath) => {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(fileBuffer).digest("hex");
};

export const s3Upload = async (files) => {
    try {
        const uploadImages = files.map(async (file) => {
            let key;
            let body;
            let imageBuffer;

            if (file.path) {
                key = generateFileHash(file.path);
                imageBuffer = await fs.promises.readFile(file.path);
                body = fs.createReadStream(file.path);
            } else if (file.buffer) {
                key = generateFileHash(file.buffer);
                imageBuffer = file.buffer;
                body = file.buffer;
            } else {
                throw new Error("File object must have either path or buffer");
            }

            const metadata = await sharp(imageBuffer).metadata();

            const customMetadata = {};
            for (const [metaKey, metaValue] of Object.entries(metadata)) {
                customMetadata[metaKey.toLowerCase()] = String(metaValue);
            }

            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
                Body: body,
                ContentType: file.mimetype,
                ACL: "public-read",
                Metadata: customMetadata,
            };

            const cmd = new PutObjectCommand(params);
            await s3client.send(cmd);

            return {
                message: "File uploaded successfully",
                key: key,
                url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
            };
        });

        const results = await Promise.all(uploadImages);
        console.log("Files uploaded successfully", results);
        return results;
    } catch (err) {
        console.error(
            "Error uploading files",
            err,
            process.env.AWS_BUCKET_NAME
        );
        return null;
    }
};

export const s3Get = async (keys) => {
    try {
        const fetchImages = keys.map(async (key) => {
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
            };

            const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

            /*can exclude fetching from the bucket if only the public url is required*/
            const cmd = new GetObjectCommand(params);
            const data = await s3client.send(cmd);

            return {
                message: "File fetched successfully",
                key,
                metadata: data.Metadata,
                url: publicUrl,
            };
        });

        const results = await Promise.all(fetchImages);
        console.log("Files fetched successfully", results);
        return results;
    } catch (err) {
        console.error("Error fetching files", err);
        return null;
    }
};

export const s3Delete = async (keys) => {
    try {
        const deleteImages = keys.map(async (key) => {
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
            };

            const cmd = new DeleteObjectCommand(params);
            await s3client.send(cmd);

            return { message: `File ${key} deleted successfully` };
        });

        const results = await Promise.all(deleteImages);
        console.log("Files deleted successfully", results);
        return results;
    } catch (err) {
        console.error("Error deleting files", err);
        return null;
    }
};
