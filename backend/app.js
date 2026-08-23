// const mongoose = require("mongoose")
// const express = require('express')
// const cookieParser = require("cookie-parser")

import mongoose from "mongoose"
import express from "express"
import cookieParser from "cookie-parser"
// import authRoutes from "./routers/authRouter.js"
// import courseRoutes from "./routers/courseRouter.js"
import cors from "cors"
// import { identifier } from "./middlewares/identification.js"
import google from "googleapis";
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import morgan from "morgan"
import setupMorganSanitization from "./utils/morganSanitizationUtility.js"
import privateRouter from "./routers/privateRouter.js"
import publicRouter from "./routers/publicRouter.js"

const app = express()

const PORT = process.env.PORT

setupMorganSanitization();


if (process.env.NODE_ENV === 'production') {
    app.use(morgan(':method :safe-url :status - :response-time ms'));
} else {
    app.use(morgan('dev')); // Keep 'dev' logs active for local development
}

// Middleware to parse JSON bodies
app.use(express.json())

// Enable CORS for all origins
// app.use(cors());
app.use(cors({
    origin: true,
    // origin: process.env.FRONTEND_URL,
    credentials: true
}));

// Middleware to parse URL-encoded bodies (for form data)
// The 'extended: true' option allows for rich objects and arrays to be encoded into the URL-encoded format
app.use(express.urlencoded({ extended: true }));

try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connected!!!");
} catch (error) {
    console.log(error);
}
app.use(cookieParser())

// Test Log 1: Right before public router
// app.use("/api/v1", (req, res, next) => {
//     console.log(`---> 1. Request reached App.js Public Layer: ${req.url}`);
//     next();
// });
app.use("/api/v1", publicRouter)

// Test Log 2: Right before identifier
// app.use("/api/v1", (req, res, next) => {
//     console.log(`---> 2. Request reached App.js Identifier Gate: ${req.url}`);
//     next();
// });
// app.use("/api/v1", identifier);

// Test Log 3: Right before private router
// app.use("/api/v1", (req, res, next) => {
//     console.log(`---> 3. Request reached App.js Private Layer: ${req.url}`);
//     next();
// });
app.use("/api/v1", privateRouter)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})