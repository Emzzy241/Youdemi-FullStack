import jwt from "jsonwebtoken";

export const identifier = async (req, res, next) => {
    let token

    if (req.headers.client === "not-browser") {
        token = req.headers.authorization
    } else {
        token = req.cookies['Authorization']
    }

    if (!token) {
        return res.status(403).json({ success: false, message: "Unauthorized"})
    }
    console.log(token)

    try {
        const userToken = token.split(' ')[1]
        const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET)
        if (jwtVerified) {
            req.user = jwtVerified
            console.log("Decoded JWT Payload (req.user): ", req.user)
            next()
        } else {
            throw new Error("Error in the token")
        } 
    }

    catch (error)
    {
        console.log(error.message)
    }
}