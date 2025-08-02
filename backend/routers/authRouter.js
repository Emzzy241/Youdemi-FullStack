import express from "express"
import authController from "./../controllers/authController"

const router = express()

router.post("/signup", authController.signUp)
router.post("/signin", authController.signIn)
router.post("/signout", authController.signOut)

router.patch("/send-verification-code", identifier, authController.sendVerificationCode)
router.patch("/verify-verification-code", identifier, authController.verifyVerificationCode)
router.patch("/change-password", identifier, authController.changePassword)
router.patch("/send-forgot-password-code", identifier, authController.sendForgotPasswordCode)
router.patch("verify-forgot-password-code", identifier, authController.verifyForgotPasswordCode)

export default router