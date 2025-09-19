// const mongoose = require("mongoose")
// const express = require('express')
// const cookieParser = require("cookie-parser")

import mongoose from "mongoose"
import express from "express"
import cookieParser from "cookie-parser"
// import authRoutes from "./routers/authRouter.js"
// import courseRoutes from "./routers/courseRouter.js"
import cors from "cors"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import privateRouter from "./routers/privateRouter.js"
import publicRouter from "./routers/publicRouter.js"

const app = express()

const PORT = process.env.PORT

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename)

// Whitelisting the frontend's url
// const corsOptions = {
//     origin: ["http://127.0.0.1:5500", "http://localhost:5000/", "http://localhost:3000/"]
// };

// app.use(cors(corsOptions))
// app.use(express.static(path.join(__dirname, "../frontend")))

// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "frontend", "index.html"))
// })


// mongoose
//     .connect(process.env.MONGOURI).then(()=>{
//         console.log("Database connected!!!")
//     }).catch(err => {
//         console.log(err)
//     })

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for all origins
app.use(cors());

// Middleware to parse URL-encoded bodies (for form data)
// The 'extended: true' option allows for rich objects and arrays to be encoded into the URL-encoded format
app.use(express.urlencoded({ extended: true }));

try {
    mongoose.connect(process.env.MONGO_URI)
    console.log("Database Connected!!!")
} catch (error) {
    console.log(process.env.MONGO_URI)
    console.log(error)
}

app.use(cookieParser())
app.use("/api/v1", privateRouter)
app.use("/api/v1", publicRouter)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// app.use("/api/v1", authRoutes)
// app.use("/api/v1/course", courseRoutes)

// app.get("/", async (req, res) => {
//     // res.send("App Has successfully started")
//     console.log("Welcome to the Youdemi App")
//     res.sendFile(path.join(__dirname, "frontend", "index.html"))
// })
