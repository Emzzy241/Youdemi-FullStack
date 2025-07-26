import express from "express";
import courseController from "../controllers/courseController.js"

const router = express.Router()

router.get("/", async (req, res) => {
    res.send("Welcome to the Course Routes")
})

router.get("/courses", courseController.getAllCourses)

router.post("/courses/new", courseController.CreateCourse)

export default router