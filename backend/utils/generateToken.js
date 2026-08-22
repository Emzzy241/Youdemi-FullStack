import jwt from "jsonwebtoken";

export const generateAuthToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, roles: user.roles },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};