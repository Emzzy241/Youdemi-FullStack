import jwt from "jsonwebtoken";
import User from "../models/user.js";

const protect = async (req, res, next) => {

    try {

        // let token;

        // if (
        //     req.headers.authorization &&
        //     req.headers.authorization.startsWith("Bearer")
        // ) {

        //     token = req.headers.authorization.split(" ")[1];
        // }

        // if (!token) {
        //     return res.status(401).json({
        //         success: false,
        //         message: "Not authorized, no token provided"
        //     });
        // }

        // const decoded = jwt.verify(
        //     token,
        //     process.env.TOKEN_SECRET
        // );

        // const user = await User.findById(decoded.userId);

        let token = req.cookies?.token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // optional: still allow header-based auth for non-browser clients
        if (!token && req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
        }

        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User belonging to this token no longer exists"
            });
        }

        req.user = user;

        next();

    } catch (error) {

        console.error(error);

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