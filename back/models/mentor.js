import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema(
  {
    mentorName: {
      type: String,
      required: true,
    },
    students: [
      {
        type: String,
        ref: "Student",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("mentor", mentorSchema);
// module.exports = mongoose.model("User", UserSchema);
