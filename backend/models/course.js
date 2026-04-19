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
    oldPrice: {
        type: Schema.Types.Decimal128,
        trim: true
    },
    newPrice: {
        type: Schema.Types.Decimal128,
        required: true,
        trim: true
    },
    isBestSeller: {
        type: Boolean,
        required: false,
        trim: true
    },
    tags: {
        type: Array,
        required: false,
        trim: true
    },
    instructor: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Schema.Types.Double,
        required: true,
        trim: true
    },
    reviewsCount: {
        type: Schema.Types.Int32,
        required: false,
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true })

const Course = mongoose.model('Course', courseSchema);

export default Course;

// Staring to upload images and use cloudinary for storign media (image, and video)