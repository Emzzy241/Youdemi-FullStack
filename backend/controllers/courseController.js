import Course from "../models/course.js"

const getAllCourses = async (req, res) => {
    try {
        const result = await Course.find()
        res.status(200).json({ success: true, message: 'Courses', data: result })
    } catch (error) {
        console.log(error.message)
    }
}

const CreateCourse = async (req, res) => {
    console.log(req.body)

    try {
        // const { error, value } = CreateCourse.validate({
        //     title, description, userId
        // })
        const { title, description } = req.body
        const userId = req.user
        const newCourse = await Course.create({
            // title, description, userId
        })
        res.status(201).json({ success: true, message: "Course Created", data: newCourse })
    } catch (error) {
        console.log(error)
    }
}

const getCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        console.log(courseId)
        const courseData = await Course.findById(courseId)

        console.log(courseId)
        console.log(courseData)

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
    try {
        const courseId = req.params.id
        const course = await Course.findById(courseId)
        console.log(course)

        if (!course)
        {
            return res.status(404).json({ status: false, message: "Failed to find the particular course"})
        }
        
        if (req.body.title != null)
        {
            course.title = req.body.title
        }

        if (req.body.description != null) 
        {
            course.description = req.body.description
        }

        const updatedCourse = await course.save()
        return res.json({status: true, message: "Course has been updated successfully", data: updatedCourse})

    } catch (error) {
        console.log(error.message)
    }
}

const deleteCourse = async (req, res) => {
    try {
        const courseId = req.params.id
        const course = await Course.findById(courseId)

        if (!course) {
            return res.status(401).json({ status: false, message: "The Course you want to delete cannot be found"})
        }

        await course.deleteOne({courseId})
        return res.status(201).json({ status: false, message: "Course has been deleted successfully"})
    } catch (error)
    {
        console.log(error.message)
    }
}

export default {
    getAllCourses,
    CreateCourse,
    getCourse,
    updateCourse,
    deleteCourse
}
// exports.getCourse = async (req, res) 