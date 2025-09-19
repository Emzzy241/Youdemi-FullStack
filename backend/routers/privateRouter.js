import express from "express"
import authController from "./../controllers/authController.js"
import { identifier } from "./../middlewares/identification.js"

console.log("Reading the auth privateRouter file")


const privateRouter = express()

// Apply the identifier middleware to all routes in this router
privateRouter.use(identifier)

// Private routes for authentication
privateRouter.patch("/send-verification-code", authController.sendVerificationCode)
privateRouter.patch("/verify-verification-code", authController.verifyVerificationCode)

// Private routes for course
privateRouter.get("/courses", courseController.getAllCourses)
privateRouter.post("/courses/new", courseController.createCourse)
privateRouter.get("/courses/:id", courseController.getCourse)
privateRouter.patch("/courses/:id", courseController.updateCourse)
privateRouter.delete("/courses/:id", courseController.deleteCourse)

export default privateRouter