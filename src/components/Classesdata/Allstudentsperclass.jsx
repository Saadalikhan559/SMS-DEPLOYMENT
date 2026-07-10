import React, { useContext, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { fetchStudentYearLevelByClass } from "../../services/api/Api";
import { Link } from "react-router-dom";
import { Loader } from "../../global/Loader";
import { AuthContext } from "../../context/AuthContext";

const AllStudentsPerClass = () => {
  const { id } = useParams();
  const location = useLocation();

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userRole, axiosInstance } = useContext(AuthContext);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const levelName = location.state?.level_name || "Unknown";

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const getStudents = async () => {
    try {
      const data = await fetchStudentYearLevelByClass(id);
      const sortedData = [...data].sort((a, b) =>
        (a.student_name || "").localeCompare(b.student_name || "", "en", { sensitivity: "base" })
      );

      setStudents(sortedData);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentPromotion = async () => {
    if (selectedStudents.length === 0) {
      setAlertMessage("Please select at least one student.");
      setShowAlert(true);
      return;
    }

    const payload = {
      student_ids: selectedStudents,
    };

    try {
      const response = await axiosInstance.post(
        `/d/student-promotion/promote/`,
        payload,
      );

      const data = response.data;
      let message = `Promotion Results:\n`;
      message += `Total: ${data.summary.total} | Promoted: ${data.summary.promoted} | Failed: ${data.summary.failed}\n\n`;
      message += `Details:\n`;

      data.results.forEach((result) => {
        const statusText =
          result.status === "success" ? "[PROMOTED]" : "[FAILED]";
        message += `${statusText} ${result.student_name}: ${result.reason}\n`;
      });
      setAlertMessage(message);
      setShowAlert(true);
      await getStudents();
      if (data.summary.total > 0) {
        setSelectedStudents([]);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.results) {
          let errorMessage = `Promotion Failed:\n`;
          errorData.results.forEach((result) => {
            const statusText =
              result.status === "success" ? "[PROMOTED]" : "[FAILED]";
            errorMessage += `${statusText} ${result.student_name}: ${result.reason}\n`;
          });
          setAlertMessage(errorMessage);
        } else {
          setAlertMessage(errorData.message || "Failed to promote students.");
        }
      } else {
        setAlertMessage("Failed to promote students. Please try again.");
      }
      setShowAlert(true);
    }
  };

  const handleSelectStudent = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((s) => s.student_id));
    }
  };

  useEffect(() => {
    getStudents();
  }, [id]);

  const filteredStudents = students.filter((student) =>
    student.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce [animation-delay:-0.2s]"></div>
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce [animation-delay:-0.4s]"></div>
        </div>
        <p className="mt-2 text-gray-500 text-sm">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
        <i className="fa-solid fa-triangle-exclamation text-5xl text-red-400 mb-4"></i>
        <p className="text-lg text-red-400 font-medium">Failed to load data, Try Again</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 bg-gray-50 dark:bg-gray-900 mb-24 md:mb-10">
      <div className="bg-white dark:bg-gray-800 max-w-7xl p-6 rounded-lg shadow-lg mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            <i className="fa-solid fa-graduation-cap mr-2" />
            Students in {levelName}
          </h1>
        </div>

        {/* Search & Error */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
          <input
            type="text"
            placeholder="Search Student Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.trimStart())}
            className="border px-3 py-2 rounded w-full sm:w-64 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />

          {error && (
            <div className="text-red-600 font-medium text-sm text-center sm:text-right w-full sm:w-auto">
              {error}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="min-w-full text-sm text-left">
              {/* Header */}
              <thead className="bgTheme text-white sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 cursor-pointer accent-indigo-700"
                        checked={
                          selectedStudents.length === filteredStudents.length &&
                          filteredStudents.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                      <span className="font-semibold">Select All</span>
                    </div>
                  </th>

                  <th className="px-6 py-4 font-semibold">S.No</th>

                  <th className="px-6 py-4 font-semibold">Student Name</th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No students found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((record, index) => (
                    <tr
                      key={record.id || index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      {/* Checkbox */}
                      <td className="px-6 py-4">
                        <input
                          id={`promote-${record.student_id}`}
                          type="checkbox"
                          className="w-4 h-4 cursor-pointer accent-indigo-700"
                          checked={selectedStudents.includes(record.student_id)}
                          onChange={() =>
                            handleSelectStudent(record.student_id)
                          }
                        />
                      </td>

                      {/* Serial Number */}
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {index + 1}
                      </td>

                      {/* Student Name */}
                      <td className="px-6 py-4 font-medium capitalize">
                        <Link
                          to={`/Studentdetails/${record.student_id}`}
                          className="textTheme hover:underline"
                        >
                          {record.student_name || "Unnamed"}
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {(userRole === "director" || userRole === "teacher") && (
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedStudents.length} student(s) selected
              </p>

              <button
                onClick={handleStudentPromotion}
                disabled={selectedStudents.length === 0}
                className={`bgTheme text-white btn`}
              >
                Promote Students
              </button>
            </div>
          )}
        </div>
      </div>

      {showAlert && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 max-w-2xl">
            <h3 className="font-bold text-lg">Student Promotion Results</h3>

            <div className="py-4 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-sm">
              {alertMessage}
            </div>

            <div className="modal-action">
              <button
                className="btn bgTheme text-white w-30"
                onClick={() => setShowAlert(false)}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default AllStudentsPerClass;