import jwt from "jsonwebtoken";
import User from "../models/user.js";

const protect = async (req, res, next) => {

    try {

        let token;

        // Check authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {

            token = req.headers.authorization.split(" ")[1];
        }

        // No token
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, no token provided"
            });
        }

        // Token expired 4
        // if (Date.now() - token > 8 * 60 * 1000)
        // {
        //     return res.status(401).json({
        //         success: false,
        //         message: "Token has already expired"
        //     })
        // }



        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.TOKEN_SECRET
        );

        // Find user
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User belonging to this token no longer exists"
            });
        }

        // Attach user to request
        req.user = user;

        next();

    } catch (error) {

        console.error(error);

        // Token expired
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired"
            });
        }

        return res.status(401).json({
            success: false,
            message: "Not authorized, invalid token"
        });
    }
};

export default protect;