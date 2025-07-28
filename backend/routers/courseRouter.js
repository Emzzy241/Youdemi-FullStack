import express from "express";
import courseController from "../controllers/courseController.js"

const router = express.Router()

router.get("/", async (req, res) => {
    res.send("Welcome to the Course Routes")
})

router.get("/courses", courseController.getAllCourses)

router.post("/courses/new", courseController.CreateCourse)

router.get("/courses/:id", courseController.getCourse)

router.patch("/courses/:id", courseController.updateCourse)

router.delete("/courses/:id", courseController.deleteCourse)

export default router