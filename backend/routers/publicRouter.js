import express from "express"
import authController from "./../controllers/authController.js"
import catalogController from "../controllers/catalogController.js"
import courseController from "../controllers/courseController.js"

console.log("Reading the publicRouter file")


const publicRouter = express()

// Public routes for  authentication
publicRouter.get("/", authController.authGreeting)
publicRouter.get("/course", courseController.courseGreeting)
publicRouter.get("/courses/catalog/greeting", catalogController.catalogGreeting)
publicRouter.get("/courses/catalog", catalogController.getAllCatalogs)
publicRouter.post("/courses/catalog/new", catalogController.createCatalog)
publicRouter.get("/courses/catalog/:id", catalogController.getCatalog)
publicRouter.patch("/courses/catalog/:id", catalogController.updateCatalog)
publicRouter.delete("/courses/catalog/:id", catalogController.deleteCatalog)
publicRouter.post("/signup", authController.signUp)
publicRouter.post("/signin", authController.signIn)
publicRouter.post("/signout", authController.signOut)
publicRouter.patch("/send-forgot-password-code", authController.sendForgotPasswordCode)
publicRouter.patch("/verify-forgot-password-code", authController.verifyForgotPasswordCode)

export default publicRouter