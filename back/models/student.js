import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
  },
  marks: {
    Ideation: {
      type: Number,
      default: null,
    },
    Execution: {
      type: Number,
      default: null,
    },
    Viva: {
      type: Number,
      default: null,
    },
  },
  mentor: {
    type: String, // Assuming mentor's name is stored as a string
    ref: "Mentor", // Reference to the Mentor collection
  },
});

export default mongoose.model("Student", studentSchema);
// module.exports = mongoose.model("Post", PostSchema);
