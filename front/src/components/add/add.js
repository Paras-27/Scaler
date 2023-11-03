import React, { useState, useEffect } from "react";
import "./add.css";
import axios from "axios";

const Addpage = () => {
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [selectedStudentsId, setSelectedStudentsId] = useState([]);
  //   const [selectedStudentsName, setSelectedStudentsName] = useState([]);

  const fetchUnassignedStudents = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_API}/student/unassigned/`
    );
    setUnassignedStudents(response.data);
    //   console.log(response.data);
  };
  useEffect(() => {
    // Fetch a list of students who are not assigned to "Mentor 1"

    fetchUnassignedStudents();
  }, []);

  const handleStudentSelect = (studentId) => {
    // Toggle the selection of a student
    if (selectedStudentsId.includes(studentId)) {
      setSelectedStudentsId(
        selectedStudentsId.filter((id) => id !== studentId)
      );
    } else {
      setSelectedStudentsId([...selectedStudentsId, studentId]);
    }
  };

  const handleAddStudents = async () => {
    // Create an array of student names for the selected students
    const studentNamesToAdd = unassignedStudents
      .filter((student) => selectedStudentsId.includes(student._id))
      .map((student) => student.studentName);

    // Check the count of students assigned to "Mentor 1"
    const countResponse = await axios.get(
      `${process.env.REACT_APP_API}/mentor/count`
    );
    const studentCount = countResponse.data;

    // Check if the number of selected students is within the allowed range
    if (
      studentCount + studentNamesToAdd.length >= 3 &&
      studentCount + studentNamesToAdd.length <= 4
    ) {
      // Send a POST request to add the selected students to "Mentor 1"
      try {
        console.log(studentNamesToAdd);
        await axios.put(`${process.env.REACT_APP_API}/mentor/addStudents`, {
          studentNamesToAdd,
        });
        // Handle successful addition (you can show a success message, etc.)
        console.log("Students added to Mentor 1.");
      } catch (error) {
        console.error("Error adding students to Mentor 1:", error);
      }

      for (const studentName of studentNamesToAdd) {
        try {
          await axios.put(
            `${process.env.REACT_APP_API}/student/updateMentor/${studentName}`,
            { mentor: "Mentor 1" }
          );
          console.log("added mentor");
        } catch (error) {
          console.error(`Error updating mentor for ${studentName}:`, error);
        }
      }
      fetchUnassignedStudents();
    } else {
      // Handle the case where the selected number of students is outside the allowed range
      await alert("You cannot add more than four students");
    }
  };

  return (
    <div>
      <h1 className="main-heading">Add Students to Mentor 1</h1>
      <p className="main-heading-2">Select students to add:</p>
      <ul>
        {unassignedStudents.map((student) => (
          <li key={student._id}>
            <div class="student-container">
              <span class="student-name">{student.studentName}</span>
              <input
                type="checkbox"
                class="checkbox"
                checked={selectedStudentsId.includes(student._id)}
                onChange={() => handleStudentSelect(student._id)}
              />
            </div>
          </li>
        ))}
      </ul>
      <button className="add-button" onClick={handleAddStudents}>
        Add Selected Students
      </button>
    </div>
  );
};

export default Addpage;
