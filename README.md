# Image Processing Service

A Node.js-based service for uploading and transforming images. Images are stored in AWS S3 and their metadata in MongoDB. Transformations include resizing, rotating and compressing using Sharp.

## Features

-   User authentication using JWT
-   Upload, Fetch, Delete and Share images using AWS S3
-   Apply transformations: **resize, rotate, crop, compress, flip, mirror, convert, watermark**, using [Sharp](https://www.npmjs.com/package/sharp) library
-   Cache images using Redis

## Local Development

-   Clone the repository

```bash
npm install
```

-   Create a `.env` file (refer to `.env.example`) using your credentials

```bash
npm run dev
```

## API Endpoints

### Auth

**Login**\
`POST /auth/login`\
Form data: `username` and `password`\

**Signup**\
`POST /auth/signup`\
Form data: `username` and `password`\

### Images

**Fetch Image by Key**\
`GET /images/:key`\

**Fetch Image by User**\
`GET /images`\
Authorization: Required\
Form data: `userId`\

**Upload Image**\
`POST /images/upload`\  
Authorization: Required\  
Form data:
| Field | Type | Description |
|----------|-----------|--------------------------|
| `files` | `array` | Array of image files to upload (multipart/form-data) |
| `userId` | `string` | ID of the user uploading the images |\

**Transform Image**\
`POST /images/transform/:key`\
Authorization: Required\
Example:

```json
{
    "transformations": {
        "resize": {
            "width": 100,
            "height": 100,
            "fit": "cover",
            "position": "center"
        },
        "rotate": 90,
        "flip": true,
        "mirror": true,
        "crop": {
            "left": 30,
            "top": 30,
            "width": 80,
            "height": 80
        },
        "watermark": "image_url",
        "compress": {
            "compressionLevel": 5
        },
        "convert": "png"
    }
}
```

Refer to the [Sharp Documentation](https://sharp.pixelplumbing.com/) for further clarification\

**Delete Image**\
`DELETE /images/:key`\
Authorization: Required\
