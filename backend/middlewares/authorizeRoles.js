const authorizeRoles = (...allowedRoles) => {

    return (req, res, next) => {

        // Ensure user exists
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Check roles
        const hasPermission = req.user.roles.some(
            role => allowedRoles.includes(role)
        );
        // with this, ['admin'].some(role => ['admin'].includes(role)) now evaluates to true 
        // Or with this, router.patch(
        //     "/courses/:id/approve",
        //     protect,
        //     authorizeRoles("admin"),
        //     approveCourse
        // );

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: insufficient permissions"
            });

        }

        next();
    };
};

export default authorizeRoles;