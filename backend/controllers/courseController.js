import cloudinary from "../utils/cloudinaryConfig.js";
import { CreateCourseSchema } from "../middlewares/validator.js"
import Course from "../models/course.js";
import Enrollment from "../models/enrollment.js";

const courseGreeting = async (req, res) => {
    res.send("Welcome to the Course Routes");
}

const getAllCatalogCourses = async (req, res) => {
    try {
        const result = await Course.find();
        console.log(result);
        res.status(200).json({ success: true, message: "All Catalog Courses returned", data: result })
    } catch (error) {
        console.log(error.message);
    }
}

const getAllCourses = async (req, res) => {
    try {
        const result = await Course.find()
        res.status(200).json({ success: true, message: 'Courses', data: result })
    } catch (error) {
        console.log(error.message)
    }
}

// const createCourse = async (req, res) => {
//     // console.log(req.body)
//     const { title, category, description, oldPrice, newPrice, isBestSeller, tags, instructor, rating, reviewsCount, imageUrl, publicId } = req.body;
//     const { userId } = req.user;

//     try {
//         // if (!req.file) return res.status(400).json({ message: "Image is required" });

//         // const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
//         //     folder: "courses", // Optional: organizes images in Cloudinary folders
//         // });

//         const { error, value } = CreateCourseSchema.validate({
//             title, category, description, oldPrice, newPrice, isBestSeller, tags, instructor, rating, reviewsCount, imageUrl, publicId, userId
//         })

//         if (error) {
//             return res.status(401).json({ success: false, error: error.details[0].message })
//         }

//         const newCourse = await Course.create({
//             title, category, description, oldPrice, newPrice, isBestSeller, tags, instructor, rating, reviewsCount, userId, imageUrl, publicId
//         })
//         res.status(201).json({ success: true, message: "Course Created", data: newCourse })
//     } catch (error) {
//         console.log(error)
//     }
// }

const createCourse = async (req, res) => {

    const {
        title,
        category,
        description,
        oldPrice,
        price,
        tags,
        imageUrl,
        publicId
    } = req.body;

    try {

        const { error } = CreateCourseSchema.validate({
            title,
            category,
            description,
            oldPrice,
            price,
            tags,
            imageUrl,
            publicId
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const newCourse = await Course.create({
            title,
            category,
            description,
            oldPrice,
            price,
            tags,
            imageUrl,
            publicId,
            createdBy: req.user._id,
            status: "draft"
        });

        return res.status(201).json({
            success: true,
            message: "Course draft created successfully",
            data: newCourse
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const submitCourseForReview = async (req, res) => {

    const { courseId } = req.params;

    try {

        // Find course
        const course = await Course.findById(courseId);

        // Course not found
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Ensure ownership
        if (course.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to modify this course"
            });
        }

        // Ensure course is still draft
        if (course.status !== "draft") {
            return res.status(400).json({
                success: false,
                message: `Course cannot be submitted because it is already ${course.status}`
            });
        }

        // Update status
        course.status = "pending";

        await course.save();

        return res.status(200).json({
            success: true,
            message: "Course submitted for review successfully",
            data: course
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const approveCourse = async (req, res) => {

    const { courseId } = req.params;

    try {

        // Find course
        const course = await Course.findById(courseId);

        console.log(course)
        console.log(courseId)

        // Course not found
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Ensure course is pending
        if (course.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: `Only pending courses can be approved`
            });
        }

        // Approve course
        course.status = "approved";

        await course.save();

        // Prevent duplicate instructor enrollment
        const existingEnrollment = await Enrollment.findOne({
            user: course.createdBy,
            course: course._id,
            role: "instructor"
        });

        // Create instructor enrollment
        if (!existingEnrollment) {

            await Enrollment.create({
                user: course.createdBy,
                course: course._id,
                role: "instructor"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Course approved successfully",
            data: course
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const enrollInCourse = async (req, res) => {

    const { courseId } = req.params;

    try {

        // Find course
        const course = await Course.findById(courseId);

        // Course not found
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Only approved courses can be enrolled into
        if (course.status !== "approved") {
            return res.status(400).json({
                success: false,
                message: "You can only enroll in approved courses"
            });
        }

        // Check existing enrollment
        const existingEnrollment = await Enrollment.findOne({
            user: req.user._id,
            course: course._id
        });

        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: "You are already enrolled in this course"
            });
        }

        // Create student enrollment
        const enrollment = await Enrollment.create({
            user: req.user._id,
            course: course._id,
            role: "student"
        });

        return res.status(201).json({
            success: true,
            message: "Successfully enrolled in course",
            data: enrollment
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        // console.log(courseId)
        const courseData = await Course.findById(courseId)

        // console.log(courseId)
        // console.log(courseData)

        if (!courseId) {
            console.log("No course ID was inputted")
            return res.status(400).json({ status: false, message: "No course ID was inputted" });
        }


        if (!courseData) {
            return res.json({ status: false, message: "Could not find a course with that ID" })
        }

        return res.status(200).json({ status: true, message: "Specific Course has been gotten successfully", data: courseData })
    } catch (error) {
        console.error('Error fetching single course:', error);
        // Check for invalid ID format (Mongoose CastError)
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'Invalid Course ID format' });
        }
        res.status(500).json({ status: false, error: 'Server Error: Could not fetch course.' });
    }
}

const updateCourse = async (req, res) => {
    const courseId = req.params.id

    // console.log(req.user)
    const userId = req.user.userId
    const { title, category, description, oldPrice, newPrice, isBestSeller, tags, instructor, rating, reviewsCount } = req.body

    try {
        const { error, value } = CreateCourseSchema.validate({
            title, category, description, oldPrice, newPrice, isBestSeller, tags, instructor, rating, reviewsCount, userId
        })

        if (error) {
            return res.status(401).json({ success: false, error: error.details[0].message })
        }

        const existingCourse = await Course.findById(courseId)
        // console.log(existingCourse)

        if (!existingCourse) {
            return res.status(404).json({ status: false, message: "Failed to find the particular course" })
        }

        if (existingCourse.createdBy.toString() !== userId) {
            return res.status(401).json({ status: false, message: "User is UnAuthorized to update this course" })
        }

        if (req.body.title != null) {
            existingCourse.title = req.body.title;
        }

        if (req.body.category != null) {
            existingCourse.category = req.body.category;
        }

        if (req.body.description != null) {
            existingCourse.description = req.body.description;
        }

        if (req.body.oldPrice != null) {
            existingCourse.oldPrice = req.body.oldPrice;
        }

        if (req.body.newPrice != null) {
            existingCourse.newPrice = req.body.newPrice;
        }

        if (req.body.isBestSeller != null) {
            existingCourse.isBestSeller = req.body.isBestSeller;
        }

        if (req.body.tags != null) {
            existingCourse.tags = req.body.tags;
        }

        if (req.body.instructor != null) {
            existingCourse.instructor = req.body.instructor;
        }

        if (req.body.rating != null) {
            existingCourse.rating = req.body.rating;
        }

        if (req.body.reviewsCount != null) {
            existingCourse.reviewsCount = req.body.reviewsCount;
        }

        const updatedCourse = await existingCourse.save()
        return res.json({ status: true, message: "Course has been updated successfully", data: updatedCourse })

    } catch (error) {
        console.log(error.message)
    }
}

const deleteCourse = async (req, res) => {
    try {
        const userId = req.user.userId
        // console.log(userId)
        const courseId = req.params.id
        const existingCourse = await Course.findById(courseId)
        // console.log(existingCourse)

        if (!existingCourse) {
            return res.status(401).json({ status: false, message: "The Course you want to delete cannot be found" })
        }

        if (existingCourse.createdBy.toString() !== userId) {
            return res.status(401).json({ status: false, message: "User is UnAuthorized to delete this course" })
        }

        // Delete from Cloudinary first
        await cloudinary.uploader.destroy(course.publicId);

        await existingCourse.deleteOne({ courseId })
        return res.status(201).json({ status: false, message: "Course has been deleted successfully" })
    } catch (error) {
        console.log(error.message)
    }
}

export default {
    getAllCatalogCourses,
    courseGreeting,
    getAllCourses,
    createCourse,
    submitCourseForReview,
    enrollInCourse,
    approveCourse,
    getCourse,
    updateCourse,
    deleteCourse
}
// exports.getCourse = async (req, res) 