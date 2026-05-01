import mongoose from "mongoose";
import { Schema } from "mongoose";

const catalogSchema = mongoose.Schema({
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
        type: [String],
        required: false,
        default: [],
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
    imageUrl: {
        type: String,
        required: true,
        trim: true
    },
    publicId: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true })

const Catalog = mongoose.model('catalog', catalogSchema);

export default Catalog;