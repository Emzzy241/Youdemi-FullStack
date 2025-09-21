import express from "express"
import authController from "./../controllers/authController.js"
import courseController from "../controllers/courseController.js"

console.log("Reading the publicRouter file")


const publicRouter = express()

// Public routes for  authentication
publicRouter.post("/signup", authController.signUp)
publicRouter.post("/signin", authController.signIn)
publicRouter.post("/signout", authController.signOut)
publicRouter.patch("/send-forgot-password-code", authController.sendForgotPasswordCode)
publicRouter.patch("/verify-forgot-password-code", authController.verifyForgotPasswordCode)

// Public routes for  course
publicRouter.get("/course", courseController.courseGreeting)

export default publicRouter