import React, { useEffect, useState } from "react";
import "./home.css";
import axios from "axios";

const Home = () => {
  const [studentsWithMarks, setStudentsWithMarks] = useState([]);
  const [updateMode, setUpdateMode] = useState(false);
  const [lock, setLock] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudentName, setSelectedStudentName] = useState(null);
  const [ideation, setIdeation] = useState(0);
  const [execution, setExecution] = useState(0);
  const [vivaPitch, setVivaPitch] = useState(0);
  const [filter, setFilter] = useState("all");
  const [studentsWithAssignedMarks, setStudentsWithAssignedMarks] = useState(
    []
  );
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [checkedStudentsId, setCheckedStudentsId] = useState([]);

  useEffect(() => {
    if (selectedStudentId !== null && selectedStudentName !== null) {
      removeStudent();
    }
    // eslint-disable-next-line
  }, [selectedStudentId, selectedStudentName]);

  //function to get the students data for a mentor
  const getStudentsData = async () => {
    const mentorResponse = await axios.get(
      `${process.env.REACT_APP_API}/mentor`
    );
    const mentorData = mentorResponse.data;

    const students = mentorData.students;

    console.log(mentorData);

    const studentPromises = students.map((studentName) =>
      getStudentMarks(studentName)
    );

    const studentsWithMarksData = await Promise.all(studentPromises);
    setStudentsWithMarks(studentsWithMarksData);

    const studentsWithMarksAssigned = studentsWithMarksData.filter(
      (student) =>
        student.marks.Ideation !== 0 ||
        student.marks.Execution !== 0 ||
        student.marks.Viva !== 0
    );
    // console.log(studentsWithMarksAssigned);
    setStudentsWithAssignedMarks(studentsWithMarksAssigned);
  };
  useEffect(() => {
    getStudentsData();
    // eslint-disable-next-line
  }, []);

  // function to lock the students data
  const handleLockClick = () => {
    console.log(studentsWithMarks);
    console.log(studentsWithAssignedMarks);
    if (studentsWithMarks.length === studentsWithAssignedMarks.length) {
      setLock(true);
      console.log(lock);
      alert("Data Submitted Succesfully");
    } else {
      alert("Cannot submit. There are students with unassigned marks.");
    }
  };

  //fetch marks of all the students
  const getStudentMarks = async (studentName) => {
    const studentResponse = await axios.get(
      `${process.env.REACT_APP_API}/student/${studentName}`
    );
    return studentResponse.data;
  };

  //remove a student from mentor's list
  const removeStudent = async () => {
    // console.log(selectedStudentName);
    // console.log(selectedStudentId);
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
          await axios.delete(
            `${process.env.REACT_APP_API}/mentor/${selectedStudentName}`
          );

          await axios.put(
            `${process.env.REACT_APP_API}/student/updateMentor/${selectedStudentName}`,
            { mentor: null }
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
              `${process.env.REACT_APP_API}/student/${selectedStudentId}`,
              updatedStudent
            );
            console.log("Student marks updated:", response.data);

            setSelectedStudentId(null);
            setSelectedStudentName(null);
          } catch (error) {
            console.error("Error updating student marks:", error);
          }

          getStudentsData();
          fetchUnassignedStudents();
        } catch (error) {
          console.error("Error removing student:", error);
        }
      }
    } else {
      console.error("No student selected for removal.");
    }
  };

  //Update the students marks
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

  // get the total marks of a single student
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

  // filter for student having marks assingned and not asiigned
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

  const fetchUnassignedStudents = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_API}/student/unassigned/`
    );
    setUnassignedStudents(response.data);
    //   console.log(response.data);
  };
  useEffect(() => {
    fetchUnassignedStudents();
  }, []);

  const handleStudentSelect = (studentId) => {
    // Toggle the selection of a student
    if (checkedStudentsId.includes(studentId)) {
      setCheckedStudentsId(checkedStudentsId.filter((id) => id !== studentId));
    } else {
      setCheckedStudentsId([...checkedStudentsId, studentId]);
    }
  };

  const handleAddStudents = async () => {
    // Create an array of student names for the selected students
    const studentNamesToAdd = unassignedStudents
      .filter((student) => checkedStudentsId.includes(student._id))
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
    } else {
      // Handle the case where the selected number of students is outside the allowed range
      await alert("You cannot add more than four students");
    }
    fetchUnassignedStudents();
    getStudentsData();
  };

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
                  {!lock && (
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
                  )}
                  <button
                    onClick={() => {
                      // Select this student for removal
                      setSelectedStudentId(student._id);
                      setSelectedStudentName(student.studentName);
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
      <div className="submit-button">
        <button onClick={handleLockClick}>Submit Marks</button>
      </div>
      <div>
        <h1 className="add-main-heading">Add Students to Mentor 1</h1>
        <p className="add-main-heading-2">Select students to add:</p>
        <ul>
          {unassignedStudents.map((student) => (
            <li key={student._id}>
              <div class="student-container">
                <span class="student-name">{student.studentName}</span>
                <input
                  type="checkbox"
                  class="checkbox"
                  checked={checkedStudentsId.includes(student._id)}
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
    </div>
  );
};

export default Home;
