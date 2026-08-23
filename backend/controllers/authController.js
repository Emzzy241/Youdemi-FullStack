// import authRoutes from "./../routers/authRouter"
import jwt from "jsonwebtoken"
import { signInSchema, signUpSchema, acceptCodeSchema, acceptForgotPasswordCodeSchema } from "../middlewares/validator.js"
import { doHash, doHashValidation, hmacProcess } from "../utils/hashing.js"
import { getVerificationEmailTemplate, getForgotPasswordEmailTemplate } from "../utils/emailTemplates.js"
import { generateAuthToken } from "../utils/generateToken.js";
import User from "../models/user.js"
import { Resend } from "resend";
import { transport } from "./../middlewares/sendMail.js"
import { google } from "googleapis"
import oAuthToken from "../models/oAuthToken.js"
import oauth2Client from "../config/google.config.js"
const authGreeting = async (req, res) => {
    res.send("Welcome to the root route of the Youdemi Application.")
}



// const oauth2Client = new google.auth.OAuth2(
//     process.env.GOOGLE_CLIENT_ID,
//     process.env.GOOGLE_CLIENT_SECRET,
//     process.env.GOOGLE_CLIENT_REDIRECT_URI,
// );

const SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
]

const resend = new Resend(process.env.RESEND_API_KEY);

const googleAuthUrl = (req, res) => {
    try {
        const url = oauth2Client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: SCOPES
        });
        console.log(url);

        res.redirect(url);
    } catch (error) {
        console.log(error);
    }
};


const googleCallback = async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).json({
            success: false,
            message: "Authorization code missing"
        });
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
        const userInfo = await oauth2.userinfo.get();
        const email = userInfo.data.email;
        const googleId = userInfo.data.id;

        let user = await User.findOne({ email });
        let isNewUser = false;

        if (!user) {
            const newUser = new User({
                fullName: userInfo.data.name,
                email,
                roles: "user",
                googleId,
            });
            user = await newUser.save();
            isNewUser = true;
        }

        // Store Google tokens server-side only — never sent to client
        const updateFields = {
            accessToken: tokens.access_token,
            expiryDate: tokens.expiry_date,
            provider: "google",
            userId: user.id
        };
        if (tokens.refresh_token) {
            updateFields.refreshToken = tokens.refresh_token;
        }

        await oAuthToken.findOneAndUpdate(
            { userId: user.id, provider: "google" },
            updateFields,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Issue your OWN session token — this is what the client actually gets
        const sessionToken = generateAuthToken(user);

        // res.cookie("token", sessionToken, {
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: "none", // cross-site redirect from accounts.google.com needs "lax", not "strict"
        //     maxAge: 8 * 60 * 60 * 1000
        // });

        res.cookie("token", sessionToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 8 * 60 * 60 * 1000
        });

        // secure: process.env.NODE_ENV === "production",

        if (!process.env.FRONTEND_URL) {
            console.error("FRONTEND_URL is not set");
            return res.redirect("/"); // fallback, avoid the literal "undefined" bug
        }
        return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const signUp = async (req, res) => {
    // const { fullName, email, password } = req.body

    let { fullName, email, password, confirmPassword } = req.body;

    email = email.toLowerCase().trim();

    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Passwords do not match"
        });
    } // Recently just added the confirmPassword feature.


    try {
        const { error, value } = signUpSchema.validate({ email, password })
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message })
        }

        const existingUser = await User.findOne({ email })

        if (existingUser) {
            return res.status(401).json({ success: false, message: "User already exists, sign in instead" })
        }

        const hashedPassword = await doHash(password, 12)
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            roles: ["user"]
        })
        const result = await newUser.save();
        result.password = undefined;
        res.status(201).json({
            success: true,
            message: "Your account has been created successfully",
            result
        })

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

const signIn = async (req, res) => {
    let { email, password } = req.body

    email = email.toLowerCase().trim();

    try {
        const { error, value } = signInSchema.validate({ email, password })
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message })
        }

        const existingUser = await User.findOne({ email }).select("+password")

        if (!existingUser) {
            return res.status(401).json({ success: false, message: "Invalid credentials, sign up for an account today if you don't have an account yet." })
        }

        const result = await doHashValidation(password, existingUser.password)

        if (!result) {
            return res.status(401).json({ success: false, message: "Invalid credentials" })
        }

        const token = jwt.sign({
            userId: existingUser._id,
            roles: existingUser.roles,
            email: existingUser.email,
            verified: existingUser.verified
        },
            process.env.TOKEN_SECRET,
            {
                expiresIn: "8h"
            }
        );

        // A Data Transfer Object for exposing only what is needed at the frontend, it won't ever expose User's password and other details.
        const userSafeData = {
            _id: existingUser._id,
            email: existingUser.email,
            fullName: existingUser.fullName,
            verified: existingUser.verified
        }

        // res.cookie("Authorization", `Bearer ${token}`, {
        //     expires: new Date(Date.now() + 8
        //         * 3600000),
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === "production",
        //     sameSite: "strict"
        // }).json({
        //     success: true,
        //     token,
        //     user: userSafeData,
        //     message: "Logged in successfully"
        // });

        const sessionToken = generateAuthToken(existingUser);

        // res.cookie("token", sessionToken, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === "production",
        //     sameSite: "none", // fine here since it's a same-site fetch, not a redirect
        //     maxAge: 8 * 60 * 60 * 1000
        // }).json({

        res.cookie("token", sessionToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 8 * 60 * 60 * 1000
        }).json({
            success: true,
            user: userSafeData,
            message: "Logged in successfully"
        });

    } catch (error) {
        console.log(error.message)
    }
}

const signOut = async (req, res) => {
    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" }).status(200).json({ success: true, message: "Logged out successful" });
}

const getMe = async (req, res) => {
    // protect middleware already verified the cookie and attached req.user
    res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            fullName: req.user.fullName,
            email: req.user.email,
            roles: req.user.roles,
            verified: req.user.verified
        }
    });
};

const getProfile = async (req, res) => {
    // jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    //     if (err && err.name === "TokenExpiredError") {
    //         return res.status(401).json({ success: false, message: "Token has expired" });
    //     }
    // })

    res.json({
        user: req.user
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

        const userName = existingUser.fullName || existingUser.email.split('@')[0]
        const expiryTimeInMinutes = 15

        const htmlContent = getVerificationEmailTemplate(userName, codeValue, expiryTimeInMinutes)


        const { data, error } = await resend.emails.send({
            from: "Youdemi <onboarding@resend.dev>", // swap for your verified domain later
            to: existingUser.email,
            subject: "Verify Your Account - Action Required",
            html: htmlContent,
        });

        if (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: "Failed to send verification email" });
        }

        const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);
        existingUser.verificationCode = hashedCodeValue;
        existingUser.verificationCodeValidation = Date.now();
        await existingUser.save();
        return res.status(200).json({ success: true, message: "Code to verify User's account has been sent" });

    } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: "Internal server error" })
}
}

    // try {
    //     const existingUser = await User.findOne({ email })

    //     if (!existingUser) {
    //         return res.status(404).json({ success: false, message: "You do not have an account on our platform" })
    //     }

    //     if (existingUser.verified === true) {
    //         return res.status(400).json({ success: false, message: "User has already been verified" })
    //     }
    //     const codeValue = Math.floor(Math.random() * 1000000).toString()

    //     const userName = existingUser.fullName || existingUser.email.split('@')[0]
    //     const expiryTimeInMinutes = 15

    //     const htmlContent = getVerificationEmailTemplate(userName, codeValue, expiryTimeInMinutes)

    //     let info = await transport.sendMail({
    //         from: `${process.env.NODE_CODE_SENDING_EMAIL_ADDRESS}`,
    //         to: existingUser.email,
    //         subject: "Verify Your Account - Action Required",
    //         html: htmlContent
    //     })

    //     if (info.accepted[0] === existingUser.email) {
    //         const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
    //         existingUser.verificationCode = hashedCodeValue
    //         existingUser.verificationCodeValidation = Date.now()
    //         await existingUser.save()
    //         return res.status(200).json({ success: true, message: "Code to verify User's account code has been sent" })
    //     }
    //     return res.status(400).json({ success: true, message: "Code sent failed" })
    // } catch (error) {
    //      console.error(error)   
    //     return res.status(500).json({ success: false, message: "Internal server error" })    }
// }


const verifyVerificationCode = async (req, res) => {
    const { email, verificationCode: providedCode } = req.body

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
        console.error(error)
        return res.status(500).json({ success: false, message: "Internal server error" })
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
    authGreeting,
    signUp,
    signIn,
    googleAuthUrl,
    googleCallback,
    signOut,
    getMe,
    getProfile,
    sendVerificationCode,
    verifyVerificationCode,
    sendForgotPasswordCode,
    verifyForgotPasswordCode
}