// import authRoutes from "./../routers/authRouter"
import jwt from "jsonwebtoken"
import { signInSchema, signUpSchema, acceptCodeSchema, changePasswordSchema } from "../middlewares/validator.js"
import { doHash, doHashValidation, hmacProcess } from "../utils/hashing.js"
import { getVerificationEmailTemplate } from "../utils/emailTemplates.js"
import { getForgotPasswordTemplate } from "../utils/forgotPasswordTemplate.js"
import User from "../models/user.js"
import {transport} from "./../middlewares/sendMail.js"

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
    res.clearCookie("Authorization").status(200).json({
        success: true,
        message: "Logged out successful"
    })    
}

const sendVerificationCode = async (req, res) => {
    const { email } = req.body
    
    try {
        const existingUser = await User.findOne({ email })

        if (!existingUser) {
            return res.status(404).json({ success: false, message: "You do not have an account on our platform"})
        }

        if (existingUser.verified === true) {
            return res.status(400).json({ success: false, message: "User has already been verified"})
        }
        const codeValue = Math.floor(Math.random() * 1000000).toString()
        
        const userName = existingUser.name || existingUser.email.split('@')[0]
        const expiryTimeInMinutes = 15

        const htmlContent = getVerificationEmailTemplate(userName, codeValue, expiryTimeInMinutes)

        let info = await transport.sendMail({
            from: `${process.env.NODE_CODE_SENDING_EMAIL_ADDRESS}`,
            to: existingUser.email,
            subject: "Verify Your Account - Action Required",
            html: htmlContent
        })

        if (info.accepted[0] === existingUser.email) {
            const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
            existingUser.verificationCode = hashedCodeValue
            existingUser.verificationCodeValidation = Date.now()
            await existingUser.save()
            return res.status(200).json({ success: true, message: "Code to verify User's account code has been sent"})
        }
        return res.status(400).json({ success: true, message: "Code sent failed"})
    } catch (error) {
        console.log(error)        
    }
}

const verifyVerificationCode = async (req, res) => {
    const { email, providedCode } = req.body

    try {
        const { error, value } = acceptCodeSchema.validate({ email, providedCode })

        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message })
        }

        const codeValue = providedCode.toString()
        const existingUser = await User.findOne({ email }).select("+verificationCode +verificationCodeValidation ")
        console.log(existingUser)

        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User does not exist"})
        }

        if (existingUser.verified) {
            return res.status(400).json({ success: false, message: "User has already verified their account"})
        }

        if (!existingUser.verificationCode || !existingUser.verificationCodeValidation) {
            return res.status(400).json({ success: false, message: "Something is wrong with the code"})
        }

        if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
            return res.status(400).json({ success: false, message: "Code has expired!"})
        }

        const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)

        if (hashedCodeValue === existingUser.verificationCode) {
            existingUser.verified = true
            existingUser.verificationCode = undefined
            existingUser.verificationCodeValidation = undefined

            try {
                await existingUser.save()
            return res.status(200).json({ success: true, message: "Your account has been verified"})
            } catch (error) {
                console.log("There was an error with saving the User: ")
                console.log(error)
            }
        }

        return res.status(400).json({ status: false, message: "AN Unexpected error occured"})

    } catch (error) {
        console.log(error)
    }
}

const changePassword = async (req, res) => {
    const { userId, verified } = req.user
    const { oldPassword, newPassword } = req.body

    try {
        const { error, value } = changePasswordSchema.validate({ oldPassword, newPassword })
        if (error)
        {
            return res.status(401).json({ success: false, message: error.details[0].message })
        }
        if (!verified) {
            return res.status(401).json({ success: false, message: "You are not a verified User, so you are unable to change your password" })
        }

        const existingUser = await User.findOne({ _id: userId}).select("+password")
        
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "The User does not exist, hence the User's password cannot be changed"})
        }

        const result = await doHashValidation(oldPassword, existingUser.password)
        if (!result) {
            return res.status(401).json({ success: false, message: "Invalid credentials"})
        }

        const hashedPassword = await doHash(newPassword, 12)
        existingUser.password = hashedPassword
        await existingUser.save()
        return res.status(201).json({status: true, message: "User's Password has been updated successfully"})

    } catch (error) {
        console.log(error)        
    }
}

const sendForgotPasswordCode = async (req, res) => {
    const { email } = req.body

    try {
        const existingUser = await User.findOne({ email })

        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User does not exist. You do not have an account on our platform"})
        }

        const codeValue = Math.floor(Math.random() * 1000000).toString()
        const userName = existingUser.name || existingUser.email.split('@')[0]
        const expiryTimeInMinutes = 15
        const htmlContent = getForgotPasswordTemplate(userName, codeValue, expiryTimeInMinutes)

        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: "Forgot Password - Action Required",
            html: htmlContent
        })

        if (info.accepted[0] === existingUser.email) {
            const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
            existingUser.forgotPasswordCode = hashedCodeValue
            existingUser.forgotPasswordCodeValidation = Date.now()
            await existingUser.save()
            return res.status(200).json({ success: true, message: "Code to reset User's password has been sent to email"})
        }
        return res.status(400).json({ success: true, message: "The Reset Password Code failed to send"})
    } catch (error) {
        console.log(error.message)
    }
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