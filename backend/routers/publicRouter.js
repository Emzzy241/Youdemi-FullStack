import express from "express"
import authController from "./../controllers/authController.js"

console.log("Reading the publicRouter file")


const publicRouter = express()

// Public routes for  authentication
publicRouter.post("/signup", authController.signUp)
publicRouter.post("/signin", authController.signIn)
publicRouter.post("/signout", authController.signOut)

// Public routes for  course
publicRouter.get("/", async (req, res) => {
    res.send("Welcome to the Course Routes")
})

export default publicRouter