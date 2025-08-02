// import authRoutes from "./../routers/authRouter"
import { signUpSchema } from "../middlewares/validator.js"
import { doHash, doHashValidation, hmacProcess } from "../utils/hashing.js"
import User from "../models/user.js"

const signUp = async (req, res) => {
    const { email, password } = req.body

    try {
        const { error, value } = signUpSchema.validate({ email, password })
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message})
        }

        const existingUser = await User.findOne({ email })

        if (existingUser) { 
            res.status(401).json({ success: false, message: "User already exists, sign in instead" })
        }

        const hashedPassword = await doHash(password, 12)
        const newUser = new User({
            email,
            password: hashedPassword
        })
        const result = await newUser.save();
        result.password = undefined;
        res.status(201).json({
            success: true,
            message: "Your account has been created successfully",
            result
        })

    } catch (error) {
        console.log(error.message)
    }
}

const signIn = async (req, res) => {

}

const signOut = async (req, res) => {

}

const sendVerificationCode = async (req, res) => {

}

const verifyVerificationCode = async (req, res) => {

}

const changePassword = async (req, res) => {

}

const sendForgotPasswordCode = async (req, res) => {

}

const verifyForgotPasswordCode = async (req, res) => {

}

export default {
    signUp,
    signIn,
    signOut,
    sendVerificationCode,
    verifyVerificationCode,
    changePassword,
    sendForgotPasswordCode,
    verifyForgotPasswordCode
}