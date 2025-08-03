// import authRoutes from "./../routers/authRouter"
import jwt from "jsonwebtoken"
import { signInSchema, signUpSchema } from "../middlewares/validator.js"
import { doHash, doHashValidation, hmacProcess } from "../utils/hashing.js"
import User from "../models/user.js"

const signUp = async (req, res) => {
    const { email, password } = req.body

    try {
        const { error, value } = signUpSchema.validate({ email, password })
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message })
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
    const { email, password } = req.body
    try {
        const { error, value } = signInSchema.validate({ email, password })
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message })
        }

        const existingUser = await User.findOne({ email }).select("+password")

        if (!existingUser) {
            return res.status(401).json({ success: false, message: "User does not exist, sign up for an account today" })
        }

        const result = await doHashValidation(password, existingUser.password)

        if (!result) {
            return res.status(401).json({ success: false, message: "Invalid credentials" })
        }

        const token = jwt.sign({
            userId: existingUser._id,
            email: existingUser.email,
            verified: existingUser.verified
        },
            process.env.TOKEN_SECRET,
            {
                expiresIn: "8h"
            }
        );

        res.cookie("Authorization", "Bearer", + token, {
            expires: new Date(Date.now() + 8
                * 3600000), httpOnly: process.env.NODE_ENV === 'production', secure: process.env.NODE_ENV
        }).json({
            success: true,
            token,
            message: "logged in successfully"
        });

    } catch (error) {
        console.log(error.message)
    }
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