import mongoose from "mongoose";

const oAuthTokenSchema = mongoose.Schema({
    accessToken: {
        type: String,
        required: true,
        trim: true
    },
    refreshToken: {
        type: String,
        required: true,
        trim: true
    },
    provider: {
        type: String,
        required: true,
        trim: true,
        enum: ["google", "github", "microsoft"]
    },
    expiryDate: {
        type: Date,
        required: true,
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {timestamps: true})

oAuthTokenSchema.index({ userId: 1, provider: 1 }, { unique: true });

const oAuthToken = mongoose.model("OAthToken", oAuthTokenSchema);

export default oAuthToken;