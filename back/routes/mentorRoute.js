import express from "express";
import mentor from "../models/mentor.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const newMentor = new mentor({
    mentorName: "Mentor 2",
    students: ["student 7", "student 8"],
  });
  try {
    const savedPost = await newMentor.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/addStudents", async (req, res) => {
  try {
    const name = "Mentor 1";
    console.log(req.body.studentNamesToAdd);
    const mentors = await mentor.findOneAndUpdate(
      { mentorName: name },
      {
        $push: {
          students: req.body.studentNamesToAdd,
        },
      },
      { new: true }
    );
    console.log(mentors);
    res.status(200).json(mentors);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

router.get("/", async (req, res) => {
  try {
    const name = "Mentor 1";
    const mentors = await mentor.findOne({ mentorName: name });
    res.status(200).json(mentors);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/count", async (req, res) => {
  try {
    const name = "Mentor 1"; // Change this to the mentor's name you want to find
    const mentors = await mentor.findOne({ mentorName: name });
    // console.log(mentors.students.length);
    res.status(200).json(mentors.students.length);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/:stname", async (req, res) => {
  try {
    const name = "Mentor 1";
    console.log(req.params.stname);
    const updatedMentor = await mentor.findOneAndUpdate(
      { mentorName: name },
      {
        $pull: {
          students: req.params.stname,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedMentor);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
