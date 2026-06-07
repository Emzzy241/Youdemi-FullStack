import express from "express"
import authController from "./../controllers/authController.js"
import courseController from "../controllers/courseController.js"
// import restrict from "../middlewares/authMiddleware.js"
import { identifier } from "./../middlewares/identification.js"
import { ensureAdmin } from "../middlewares/authMiddleware.js"
import protect from "../middlewares/protect.js"
import authorizeRoles from "../middlewares/authorizeRoles.js"
import authorizeCourseRoles from "../middlewares/authorizeCourseRoles.js"
// import restrict from "../middlewares/authMiddleware.js";

// console.log("Reading the auth privateRouter file")


const privateRouter = express()

// Apply the identifier middleware to all routes in this router
privateRouter.use(identifier)

// privateRouter.get('/admin', restrict(admin), (req, res) => {
//     // for handling admin route
// })

// privateRouter.get('/student', restrict(admin), (req, res) => {
//     // For handling student route
// })

// Router.get('/student', restrict(admin), (req, res) => {

// })

privateRouter.get('/admin-dashboard', ensureAdmin, (req, res) => {
    console.log("Welcome to the admin dashboard, say no more :)");
})

privateRouter.get("/profile", protect, authController.getProfile);

// Private routes for authentication
privateRouter.patch("/send-verification-code", authController.sendVerificationCode)
privateRouter.patch("/verify-verification-code", authController.verifyVerificationCode)

// Private routes for course

privateRouter.patch(
    "/courses/:courseId/submit",
    protect,
    courseController.submitCourseForReview
)
privateRouter.patch(
    "/courses/:courseId/approve",
    protect,
    authorizeCourseRoles("admin"),
    courseController.approveCourse
)

privateRouter.get(
   "/courses/:courseId/content",
   protect,
   authorizeCourseRoles(
      "student",
      "instructor"
   ),
   (req,res)=>{
      res.send("allowed");
   }
);
privateRouter.post("/courses/:courseId/enroll", protect, courseController.enrollInCourse)
privateRouter.get("/courses", courseController.getAllCourses)
privateRouter.post("/courses/new", protect, courseController.createCourse)
privateRouter.get("/courses/:id", courseController.getCourse)
privateRouter.patch("/courses/:id", courseController.updateCourse)
privateRouter.delete("/courses/:id", courseController.deleteCourse)

export default privateRouter