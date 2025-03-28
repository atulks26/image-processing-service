import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
    user: { type: String, required: true },
    url: { type: String, required: true },
    key: { type: String, required: true },
    metadata: { type: Object },
});

export default mongoose.model("Image", imageSchema);
