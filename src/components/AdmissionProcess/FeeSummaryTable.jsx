import React, { useEffect, useState, useContext } from "react";
import { fetchSchoolYear, fetchYearLevels } from "../../services/api/Api";
import { allRouterLink } from "../../router/AllRouterLinks";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const FeeSummaryTable = () => {
  const { axiosInstance } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSchoolYear, setSelectedSchoolYear] = useState("");
  const [yearLevels, setYearLevels] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);

  const getSchoolYear = async () => {
    try {
      const data = await fetchSchoolYear();
      setSchoolYears(data);
    } catch (err) {
      console.error("Error fetching school years:", err);
    }
  };

  const getYearLevels = async () => {
    try {
      const data = await fetchYearLevels();
      setYearLevels(data);
    } catch (err) {
      console.error("Error fetching year levels:", err);
    }
  };

  useEffect(() => {
    getYearLevels();
    getSchoolYear();
  }, []);

  const getMonthsFromFees = (feesObj) => {
    if (!feesObj || typeof feesObj !== "object") return [];
    return Object.keys(feesObj);
  };

  const getFeeData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(
        "/d/studentfees/grouped_receipts/",
      );
      const data = response.data;

      if (
        data &&
        typeof data === "object" &&
        data.detail === "No records found."
      ) {
        setAllStudents([]);
        setStudents([]);
      } else if (Array.isArray(data)) {
        setAllStudents(data);
        setStudents(data);
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    getFeeData();
  }, [selectedMonth, selectedClass, selectedSchoolYear]);

  const resetFilters = () => {
    setSelectedMonth("");
    setSelectedClass("");
    setSelectedSchoolYear("");
    setSearchTerm("");
  };

  const filteredStudents = allStudents
    .filter((item) => {
      const term = searchTerm.toLowerCase();

      const name = item.student?.name?.toLowerCase() || "";
      const receipt = item.receipt_number?.toLowerCase() || "";
      const className = item.student?.class_name?.toLowerCase() || "";
      const section = item.student?.class_section?.toLowerCase() || "";
      const amount = item.total_amount_paid?.toString().toLowerCase() || "";
      const scholar = item.student?.scholar_number?.toString() || "";

      const monthsPaid = getMonthsFromFees(item.fees_submitted);

      const matchSearch =
        name.includes(term) ||
        receipt.includes(term) ||
        className.includes(term) ||
        section.includes(term) ||
        amount.includes(term) ||
        scholar.includes(term);

      const matchClass =
        !selectedClass ||
        item.student?.class_name?.toLowerCase() === selectedClass.toLowerCase();

      const matchMonth = !selectedMonth || monthsPaid.includes(selectedMonth);

      return matchSearch && matchClass && matchMonth;
    })
    .sort((a, b) => {
      const nameA = a.student?.name || "";
      const nameB = b.student?.name || "";
      return nameA.localeCompare(nameB);
    });

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

  return (
    <div className="min-h-screen p-5 bg-gray-50 dark:bg-gray-900 mb-24 md:mb-10">
      <div className="bg-white dark:bg-gray-800 max-w-7xl p-6 rounded-lg shadow-lg mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 text-center">
            <i className="fa-solid fa-graduation-cap mr-2"></i> Students Fee
            Record
          </h1>
        </div>

        {/* Filter Section */}
        <div className="w-full px-5">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-2 w-full border-b pb-4 border-gray-200 dark:border-gray-700">
            {/* Filters */}
            <div className="flex flex-wrap items-end gap-4 w-full sm:w-auto">
              {/* Class Filter */}
              <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Class
                </label>
                <select
                  className="select select-bordered w-full focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">All Classes</option>
                  {yearLevels.map((level) => (
                    <option key={level.id} value={level.level_name}>
                      {level.level_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Filter */}
              <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Month
                </label>
                <select
                  className="select select-bordered w-full focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="">All Months</option>
                  {[
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ].map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Year
                </label>
                <select
                  className="select select-bordered w-full focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  value={selectedSchoolYear}
                  onChange={(e) => setSelectedSchoolYear(e.target.value)}
                >
                  <option value="">All Years</option>
                  {schoolYears.map((year) => (
                    <option key={year.id} value={year.year_name}>
                      {year.year_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset */}
              <div className="mt-1 w-full sm:w-auto">
                <button
                  onClick={resetFilters}
                  className="bgTheme text-white text-sm px-5 py-2 rounded font-semibold h-10 w-full sm:w-auto"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Search + Dashboard */}
            <div className="flex flex-col w-full sm:flex-row sm:items-end gap-4 sm:w-auto">
              <input
                type="text"
                placeholder="Enter name, receipt no, class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.trimStart())}
                className="border px-3 py-2 rounded w-full sm:w-64 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 focus:outline-none"
              />

              <Link
                to={allRouterLink.feeDashboard}
                className="bgTheme text-white text-sm px-5 py-2 rounded font-semibold h-10 w-full sm:w-auto text-center"
              >
                Fee Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="w-full overflow-x-auto no-scrollbar max-h-[70vh] rounded-lg">
          <table className="min-w-full rounded-lg">
            <thead className="bgTheme text-white sticky top-0">
              <tr>
                <th className="px-4 py-3">S.No</th>
                <th className="px-4 py-3">Receipt No</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Scholar No</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Months Paid</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-nowrap">Paid Amount</th>
                <th className="px-4 py-3">View</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center py-6 text-gray-500 dark:text-gray-400"
                  >
                    No data found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((record, index) => {
                  const monthsPaid = getMonthsFromFees(record.fees_submitted);

                  return (
                    <tr
                      key={record.receipt_number || index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-100 text-nowrap">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3 text-gray-800 dark:text-gray-100 text-nowrap">
                        {record.receipt_number}
                      </td>

                      <td className="px-4 py-3 text-gray-800 dark:text-gray-100 text-nowrap">
                        {record.student?.name}
                      </td>

                      <td className="px-4 py-3 text-gray-800 dark:text-gray-100 text-nowrap">
                        {record.student?.scholar_number}
                      </td>

                      <td className="px-4 py-3 text-gray-800 dark:text-gray-100 text-nowrap">
                        {record.student?.class_name}{" "}
                        {record.student?.class_section}
                      </td>

                      {/* ⭐ MONTHS PAID */}
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-100 text-nowrap">
                        {monthsPaid.length > 0 ? monthsPaid.join(", ") : "—"}
                      </td>

                      <td className="px-4 py-3 text-gray-800 dark:text-gray-100 text-nowrap">
                        {record.payment_date}
                      </td>

                      <td className="px-4 py-3 text-gray-800 dark:text-gray-100 text-nowrap">
                        ₹{record.total_amount_paid}
                      </td>

                      <td className="px-4 underline textTheme hover:text-blue-800 dark:hover:text-blue-200 cursor-pointer text-center text-nowrap">
                        <Link
                          to={allRouterLink.viewFeesDetails
                            .replace(":id", record.student.student_year_id)
                            .replace(":receipt_number", record.receipt_number)}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeeSummaryTable;
