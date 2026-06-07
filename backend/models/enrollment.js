import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },

    role: {
        type: String,
        enum: ["student", "instructor"],
        required: true
    }
}, {
  timestamps: true  
});

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;