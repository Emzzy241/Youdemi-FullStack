// const unAuthorizedError = require("./errors/unAuthorizedError")

const restrict = (...roles) => {
    return (req, res, next) => {
        const userRoles = req.user.role;
        if (!userRoles.some((r) => roles.includes(r))) {
            // throw new unAuthorizedError("Your roles are not allowed to access this route")
            console.log("Your roles are not allowed to access this route");
        }
    };
    next();
}

function ensureAdmin(req, res, next) {
    if (req.user && req.user.role === "admin") {
        return next();
    }
    res.status(403).send("Access denied. Admins only.");
}

export {
    restrict,
    ensureAdmin,
} ;
    