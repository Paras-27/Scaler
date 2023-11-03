import express from "express";
import student from "../models/student.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const newStudent = new student({
    studentName: "Student 10",
    mentor: null,
  });
  try {
    const savedPost = await newStudent.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/unassigned", async (req, res) => {
  try {
    const data = await student.find({ mentor: null });
    // console.log(data);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/", async (req, res) => {
  try {
    const cats = await student.find();
    res.status(200).json(cats);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:stud", async (req, res) => {
  const name = req.params.stud; // Get the studentName from the query parameters

  try {
    const students = await student.findOne({ studentName: name });

    if (students) {
      res.status(200).json(students);
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const studentId = req.params.id;
    const updatedData = req.body;
    const updatedStudent = await student.findByIdAndUpdate(
      { _id: studentId },
      {
        $set: {
          "marks.Ideation": updatedData.ideation,
          "marks.Execution": updatedData.execution,
          "marks.Viva": updatedData.vivaPitch,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedStudent);
  } catch (err) {
    res.status(500).json(err);
  }
});
router.put("/updateMentor/:stname", async (req, res) => {
  try {
    const studName = req.params.stname;
    const updatedData = req.body;
    console.log(updatedData.mentor);
    const updatedStudent = await student.findOneAndUpdate(
      { studentName: studName },
      {
        $set: {
          mentor: updatedData.mentor,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedStudent);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
