// const mongoose = require("mongoose")
// const express = require('express')
// const cookieParser = require("cookie-parser")

import mongoose from "mongoose"
import express from "express"
import cookieParser from "cookie-parser"
import courseRoutes from "./routers/courseRouter.js"

const app = express()

const PORT = process.env.PORT

// mongoose
//     .connect(process.env.MONGOURI).then(()=>{
//         console.log("Database connected!!!")
//     }).catch(err => {
//         console.log(err)
//     })

// Middleware to parse JSON bodies
app.use(express.json());

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.use("/api/v1/course", courseRoutes)

app.get("/", async (req, res) => {
    res.send("App Has successfully started")
    console.log("Welcome to the Youdemi App")
})
