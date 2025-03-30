import {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import crypto from "crypto";

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
            const key = generateFileHash(file.path);
            const stream = fs.createReadStream(file.path);

            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
                Body: stream,
                ContentType: file.mimetype,
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
        console.error("Error uploading files", err);
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

            const cmd = new GetObjectCommand(params);
            const data = await s3client.send(cmd);

            return {
                message: "File fetched successfully",
                key,
                data,
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
