import mongoose from "mongoose";
import { Schema } from "mongoose";

const courseSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    status: {
        type: String,
        enum: ["draft", "pending", "approved", "rejected"],
        default: "draft"
    },
    oldPrice: {
        type: Schema.Types.Decimal128,
        trim: true
    },
    price: {
        type: Schema.Types.Decimal128,
        required: true,
        trim: true
    },
    tags: {
        type: [String],
        required: false,
        default: [],
        trim: true
    },
    imageUrl: {
        type: String,
        required: true,
        trim: true
    },
    publicId: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true })

const Course = mongoose.model('Course', courseSchema);

export default Course;

// Staring to upload images and use cloudinary for storign media (image, and video)