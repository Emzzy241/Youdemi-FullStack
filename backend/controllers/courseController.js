import Course from "../models/course.js"

const getAllCourses = async (req, res) => {
    try {
        const result = await Course.find()
        res.status(200).json({ success: true, message: 'Courses', data: result})
    } catch (error) {
        console.log(error.message)
    }
}

const CreateCourse = async (req, res) => {
    console.log(req.body)
    
    try {
        const { title, description } = req.body
        const result = await Course.create({
            title, description
        })
        res.status(201).json({ success: true, message: "Course Created", data: result})
    } catch (error) {
        console.log(error)
    }
}

export default {
    getAllCourses,
    CreateCourse
}
// exports.getCourse = async (req, res) 