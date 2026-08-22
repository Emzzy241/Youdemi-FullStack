// utils/generateToken.js
import jwt from "jsonwebtoken";

export const generateAuthToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            roles: user.roles,
            email: user.email,
            verified: user.verified
        },
        process.env.TOKEN_SECRET,   // same secret protect.js uses
        { expiresIn: "8h" }
    );
};


// import jwt from "jsonwebtoken";

// export const generateAuthToken = (user) => {
//     return jwt.sign(
//         { id: user._id, email: user.email, roles: user.roles },
//         process.env.JWT_SECRET,
//         { expiresIn: "7d" }
//     );
// };