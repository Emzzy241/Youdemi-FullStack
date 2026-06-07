import express from "express"
import authController from "./../controllers/authController.js"
import catalogController from "../controllers/catalogController.js"
import courseController from "../controllers/courseController.js"
import protect from "../middlewares/protect.js"
import authorizeRoles from "../middlewares/authorizeRoles.js"
// console.log("Reading the publicRouter file")


const publicRouter = express()

// Public routes for  authentication
publicRouter.get("/", authController.authGreeting)
publicRouter.get("/course", courseController.courseGreeting)
publicRouter.get("/catalog/greeting", catalogController.catalogGreeting)
publicRouter.get("/catalog", catalogController.getAllCatalogs)
publicRouter.post("/catalog/new", catalogController.createCatalog)
publicRouter.get("/catalog/:id", catalogController.getCatalog)
publicRouter.get(
    "/me",
    protect,
    (req, res) => {
        res.json(req.user);
    }
);

publicRouter.get(
   "/admin-test",
   protect,
   authorizeRoles("admin"),
   (req,res)=>{
      res.send("success");
   }
);

publicRouter.patch("/catalog/:id", catalogController.updateCatalog)
publicRouter.delete("/catalog/:id", catalogController.deleteCatalog)
publicRouter.post("/signup", authController.signUp)
publicRouter.post("/signin", authController.signIn)
publicRouter.post("/signout", authController.signOut)
publicRouter.patch("/send-forgot-password-code", authController.sendForgotPasswordCode)
publicRouter.patch("/verify-forgot-password-code", authController.verifyForgotPasswordCode)

export default publicRouter