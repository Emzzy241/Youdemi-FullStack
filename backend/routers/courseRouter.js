import express from "express";
import courseController from "../controllers/courseController.js"
import { identifier } from "../middlewares/identification.js";

const router = express.Router()

router.get("/", async (req, res) => {
    res.send("Welcome to the Course Routes")
})

router.get("/courses", courseController.getAllCourses)

router.post("/courses/new", identifier, courseController.createCourse)

router.get("/courses/:id", courseController.getCourse)

router.patch("/courses/:id", identifier, courseController.updateCourse)

router.delete("/courses/:id", courseController.deleteCourse)

export default router