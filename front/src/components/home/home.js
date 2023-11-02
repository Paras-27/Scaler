import React, { useEffect, useState } from "react";
import "./home.css";
import axios from "axios";
import Addpage from "../add/add.js";
// import { FaTrash } from "react-icons/fa";

const Home = () => {
  const [studentsWithMarks, setStudentsWithMarks] = useState([]);
  const [updateMode, setUpdateMode] = useState(false); // State to control update mode
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudentName, setSelectedStudentName] = useState(null);
  const [ideation, setIdeation] = useState(0);
  const [execution, setExecution] = useState(0);
  const [vivaPitch, setVivaPitch] = useState(0);
  const [filter, setFilter] = useState("all");

  const getStudentsData = async () => {
    const mentorResponse = await axios.get(
      `${process.env.REACT_APP_API}/mentor`
    );
    const mentorData = mentorResponse.data;

    // Extract the students associated with "Mentor 1"

    const students = mentorData.students;

    console.log(mentorData);

    // Fetch marks information for each student
    const studentPromises = students.map((studentName) =>
      getStudentMarks(studentName)
    );

    // Use Promise.all to wait for all requests to complete
    const studentsWithMarksData = await Promise.all(studentPromises);
    console.log(studentsWithMarksData);
    setStudentsWithMarks(studentsWithMarksData);
  };
  useEffect(() => {
    getStudentsData();
    // eslint-disable-next-line
  }, []);

  const getStudentMarks = async (studentName) => {
    const studentResponse = await axios.get(
      `${process.env.REACT_APP_API}/student/${studentName}`
    );
    return studentResponse.data;
  };

  const removeStudent = async () => {
    console.log(selectedStudentName);
    console.log(selectedStudentId);
    if (selectedStudentName) {
      const count = await axios.get(
        `${process.env.REACT_APP_API}/mentor/count`
      );
      console.log(count.data);
      if (count.data === 3) {
        alert(
          "You cannot remove the student. The mentor already has 3 students."
        );
      } else {
        try {
          // Send a request to remove the student from the mentor
          await axios.delete(
            `${process.env.REACT_APP_API}/mentor/${selectedStudentName}`
          );

          // Clear the marks
          setIdeation(0);
          setExecution(0);
          setVivaPitch(0);

          const updatedStudent = {
            ideation,
            execution,
            vivaPitch,
          };

          try {
            const response = await axios.put(
              `${process.env.REACT_APP_API}/student/${selectedStudentId}`, // Use the selected student's ID
              updatedStudent
            );
            console.log("Student marks updated:", response.data);

            setSelectedStudentId(null);
            setSelectedStudentName(null);
          } catch (error) {
            console.error("Error updating student marks:", error);
          }

          // Update the UI by re-fetching the students' data
          getStudentsData();
        } catch (error) {
          console.error("Error removing student:", error);
        }
      }
    } else {
      console.error("No student selected for removal.");
    }
  };

  const updateStudentMarks = async () => {
    if (selectedStudentId) {
      const updatedStudent = {
        ideation,
        execution,
        vivaPitch,
      };

      try {
        const response = await axios.put(
          `${process.env.REACT_APP_API}/student/${selectedStudentId}`,
          updatedStudent
        );

        console.log("Student marks updated:", response.data);
        setUpdateMode(false);
        setSelectedStudentId(null);

        setIdeation(0);
        setExecution(0);
        setVivaPitch(0);

        getStudentsData();
      } catch (error) {
        console.error("Error updating student marks:", error);
      }
    } else {
      console.error("No student selected for update.");
    }
  };

  function getTotalMarks(marks) {
    if (
      marks &&
      marks.Ideation != null &&
      marks.Execution != null &&
      marks.Viva != null
    ) {
      return marks.Ideation + marks.Execution + marks.Viva;
    } else {
      return 0;
    }
  }

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const filteredStudents = studentsWithMarks.filter((student) => {
    if (filter === "assigned") {
      return (
        student.marks.Ideation !== 0 &&
        student.marks.Execution !== 0 &&
        student.marks.Viva !== 0
      );
    } else if (filter === "notAssigned") {
      return (
        student.marks.Ideation === 0 ||
        student.marks.Execution === 0 ||
        student.marks.Viva === 0
      );
    }
    return true;
  });

  return (
    <div className="home">
      <h1 className="main-heading">Students assigned under mentor 1</h1>
      <h1 className="main-heading-2">Filter by :-</h1>
      <div className="main-filter">
        <button onClick={() => handleFilterChange("all")}>All Students</button>
        <button
          className="filter"
          onClick={() => handleFilterChange("assigned")}
        >
          Assigned Marks
        </button>
        <button onClick={() => handleFilterChange("notAssigned")}>
          Unassigned Marks
        </button>
      </div>
      <ul className="data">
        {filteredStudents.map((student) => (
          <li key={student._id} className="student-entry">
            {updateMode && student._id === selectedStudentId ? (
              <div className="main-data">
                <p className="Name">Name: {student.studentName}</p>
                <label>Ideation: </label>
                <input
                  type="number"
                  value={ideation}
                  onChange={(e) => setIdeation(e.target.value)}
                />
                <br />
                <label>Execution: </label>
                <input
                  type="number"
                  value={execution}
                  onChange={(e) => setExecution(e.target.value)}
                />
                <br />
                <label>Viva/Pitch: </label>
                <input
                  type="number"
                  value={vivaPitch}
                  onChange={(e) => setVivaPitch(e.target.value)}
                />
                <br />
                <button onClick={updateStudentMarks}>Update</button>
              </div>
            ) : (
              <div className="main-data">
                <div>
                  <p className="Name">Name: {student.studentName}</p>
                  <p>
                    Ideation:{" "}
                    {student.marks.Ideation
                      ? student.marks.Ideation
                      : "Not Assigned"}
                  </p>
                  <p>
                    Execution:{" "}
                    {student.marks.Execution
                      ? student.marks.Execution
                      : "Not Assigned"}
                  </p>
                  <p>
                    Viva/Pitch:{" "}
                    {student.marks.Viva ? student.marks.Viva : "Not Assigned"}
                  </p>
                  <p>Total-Marks: {getTotalMarks(student.marks)}</p>
                </div>
                <div className="edit-icon">
                  <button
                    className="edit-button"
                    onClick={() => {
                      // Select this student for update
                      setUpdateMode(true);
                      setSelectedStudentId(student._id);
                    }}
                  >
                    Edit Marks
                  </button>
                  <button
                    onClick={() => {
                      // Select this student for update
                      setSelectedStudentId(student._id);
                      setSelectedStudentName(student.studentName);
                      removeStudent();
                    }}
                  >
                    Remove Student
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <Addpage />
    </div>
  );
};

export default Home;
