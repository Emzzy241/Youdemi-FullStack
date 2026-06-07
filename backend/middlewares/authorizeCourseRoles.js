import Enrollment from "../models/enrollment.js"

const authorizeCourseRoles = (...allowedRoles) => {

    return async (req, res, next) => {

        try {

            const { courseId } = req.params;

            // Find enrollment
            const enrollment = await Enrollment.findOne({
                user: req.user._id,
                course: courseId
            });

            // No enrollment found
            if (!enrollment) {
                return res.status(403).json({
                    success: false,
                    message: "You are not enrolled in this course"
                });
            }

            // Check role permission
            if (!allowedRoles.includes(enrollment.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Insufficient course permissions"
                });
            }

            // Attach enrollment if needed later
            req.enrollment = enrollment;

            next();

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    };
};

export default authorizeCourseRoles;