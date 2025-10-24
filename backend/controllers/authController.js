// import authRoutes from "./../routers/authRouter"
import jwt from "jsonwebtoken"
import { signInSchema, signUpSchema, acceptCodeSchema, acceptForgotPasswordCodeSchema } from "../middlewares/validator.js"
import { doHash, doHashValidation, hmacProcess } from "../utils/hashing.js"
import { getVerificationEmailTemplate, getForgotPasswordEmailTemplate } from "../utils/emailTemplates.js"
import User from "../models/user.js"
import { transport } from "./../middlewares/sendMail.js"

const signUp = async (req, res) => {
    const { fullName, email, password } = req.body

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
            fullName,
            email,
            password: hashedPassword,
        })
        const result = await newUser.save();
        result.password = undefined;
        res.status(201).json({
            success: true,
            message: "Your account has been created successfully",
            result
        })

    } catch (error) {
        res.send(error.message)
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

        // A Data Transfer Object for exposing only what is needed at the frontend
        const userSafeData = {
            _id: existingUser._id,
            email: existingUser.email,
            name: existingUser.fullName,
            verified: existingUser.verified
        }

        res.cookie("Authorization", "Bearer", + token, {
            expires: new Date(Date.now() + 8
                * 3600000), httpOnly: process.env.NODE_ENV === 'production', secure: process.env.NODE_ENV
        }).json({
            success: true,
            token,
            user: userSafeData,
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
            return res.status(404).json({ success: false, message: "You do not have an account on our platform" })
        }

        if (existingUser.verified === true) {
            return res.status(400).json({ success: false, message: "User has already been verified" })
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
            return res.status(200).json({ success: true, message: "Code to verify User's account code has been sent" })
        }
        return res.status(400).json({ success: true, message: "Code sent failed" })
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
        // console.log(existingUser)

        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User does not exist" })
        }

        if (existingUser.verified) {
            return res.status(400).json({ success: false, message: "User has already verified their account" })
        }

        if (!existingUser.verificationCode || !existingUser.verificationCodeValidation) {
            return res.status(400).json({ success: false, message: "Something is wrong with the code" })
        }

        if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
            return res.status(400).json({ success: false, message: "Code has expired!" })
        }

        const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)

        if (hashedCodeValue === existingUser.verificationCode) {
            existingUser.verified = true
            existingUser.verificationCode = undefined
            existingUser.verificationCodeValidation = undefined

            try {
                await existingUser.save()
                return res.status(200).json({ success: true, message: "Your account has been verified" })
            } catch (error) {
                console.log("There was an error with saving the User: ")
                console.log(error)
            }
        }

        return res.status(400).json({ success: false, message: "AN Unexpected error occured" })

    } catch (error) {
        console.log(error)
    }
}

const sendForgotPasswordCode = async (req, res) => {
    const { email } = req.body

    try {
        const existingUser = await User.findOne({ email })

        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User does not exist. You do not have an account on our platform" })
        }

        const codeValue = Math.floor(Math.random() * 1000000).toString()
        const userName = existingUser.fullName || existingUser.email.split('@')[0]
        const expiryTimeInMinutes = 15
        const htmlContent = getForgotPasswordEmailTemplate(userName, codeValue, expiryTimeInMinutes)

        // 1. Send the response immediately to prevent Render timeout.
        res.status(200).json({ success: true, message: "If a valid account exists, a password reset code has been sent to the email." });

        // 2. DETACH THE EMAIL/DB PROMISE: We call the async function but DO NOT await it.
        // This moves the execution to a background task, allowing the main thread to continue.
        (async () => {
            try {
                // The potentially slow network call
                let info = await transport.sendMail({
                    from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
                    to: existingUser.email,
                    subject: "Forgot Password - Action Required",
                    html: htmlContent
                })

                if (info.accepted && info.accepted[0] === existingUser.email) {
                    // Update user only if the email was successfully accepted by the SMTP server
                    const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
                    existingUser.forgotPasswordCode = hashedCodeValue
                    existingUser.forgotPasswordCodeValidation = Date.now()
                    await existingUser.save()
                    console.log(`Password reset code successfully saved for user: ${existingUser.email}`)
                } else {
                    // Log failure for server-side monitoring
                    console.error("Email failed to be accepted by SMTP server:", info);
                }
            } catch (backgroundError) {
                // Log any errors that occur during the background process
                console.error("Background email sending or database update failed:", backgroundError.message)
            }
        })() // Immediately invoke the detached async function

        // Note: The rest of the original code (the two 'return' statements after sendMail) 
        // has been moved inside the background promise or removed, as the HTTP response is 
        // already sent.

    } catch (error) {
        // This catch block only handles errors *before* the HTTP response is sent (e.g., DB lookup failure).
        // If the response hasn't been sent, return an error.
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: "An unexpected server error occurred." })
        }
        console.error("Critical error before response sent:", error.message)
    }
}


// OLD CODE SNIPPET BEFORE FIXING RENDER TIMEOUT ISSUES
// const sendForgotPasswordCode = async (req, res) => {
//     const { email } = req.body

//     try {
//         const existingUser = await User.findOne({ email })

//         if (!existingUser) {
//             return res.status(404).json({ success: false, message: "User does not exist. You do not have an account on our platform" })
//         }

//         const codeValue = Math.floor(Math.random() * 1000000).toString()
//         const userName = existingUser.fullName || existingUser.email.split('@')[0]
//         const expiryTimeInMinutes = 15
//         const htmlContent = getForgotPasswordEmailTemplate(userName, codeValue, expiryTimeInMinutes)

//         res.status(200).json({ success: true, message: "Code sending initiated" });

//         let info = await transport.sendMail({
//             from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
//             to: existingUser.email,
//             subject: "Forgot Password - Action Required",
//             html: htmlContent
//         })

//         if (info.accepted[0] === existingUser.email) {
//             const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
//             existingUser.forgotPasswordCode = hashedCodeValue
//             existingUser.forgotPasswordCodeValidation = Date.now()
//             await existingUser.save()
//             return res.status(200).json({ success: true, message: "Code to reset User's password has been sent to email" })
//         }
//         return res.status(400).json({ success: true, message: "The Reset Password Code failed to send" })
//     } catch (error) {
//         console.log(error.message)
//     }
// }

const verifyForgotPasswordCode = async (req, res) => {
    const { fullName, email, providedCode, newPassword } = req.body

    try {
        const { error, value } = acceptForgotPasswordCodeSchema.validate({ fullName, email, providedCode, newPassword })

        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message })
        }

        const codeValue = providedCode.toString()
        const existingUser = await User.findOne({ email }).select("+forgotPasswordCode +forgotPasswordCodeValidation")
        // console.log(existingUser)

        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User does not exist" })
        }

        if (!existingUser.forgotPasswordCode || !existingUser.forgotPasswordCodeValidation) {
            return res.status(400).json({ success: false, message: "Something is wrong with the code" })
        }

        if (Date.now() - existingUser.forgotPasswordCodeValidation > 5 * 60 * 1000) {
            return res.status(400).json({ success: false, message: "Code has expired!" })
        }

        const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)

        if (hashedCodeValue === existingUser.forgotPasswordCode) {
            const hashedPassword = await doHash(newPassword, 12)
            existingUser.password = hashedPassword
            existingUser.forgotPasswordCode = undefined
            existingUser.forgotPasswordCodeValidation = undefined

            try {
                await existingUser.save()
                return res.status(200).json({ success: true, message: `Password has been updated for: ${existingUser.fullName}` })
            } catch (error) {
                console.log("There was an error with saving the User after password was changed." + error)
            }
        }

        return res.status(400).json({ success: false, message: "An Unexpected error occurred" })

    } catch (error) {
        console.log(error)
    }
}

export default {
    signUp,
    signIn,
    signOut,
    sendVerificationCode,
    verifyVerificationCode,
    sendForgotPasswordCode,
    verifyForgotPasswordCode
}