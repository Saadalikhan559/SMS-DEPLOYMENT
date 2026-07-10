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
  const [selectedFeeType, setSelectedFeeType] = useState("");
  const [yearLevels, setYearLevels] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);

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

  // Extract unique months from payments
  const getMonthsFromPayments = (payments) => {
    if (!payments || !Array.isArray(payments)) return [];
    const months = payments
      .filter(p => p.month)
      .map(p => p.month)
      .filter(month => month !== null && month !== undefined);
    return [...new Set(months)]; // Remove duplicates
  };

  // Get all fee types from payments
  const getFeeTypesFromPayments = (payments) => {
    if (!payments || !Array.isArray(payments)) return [];
    const feeTypes = payments
      .filter(p => p.fee_type)
      .map(p => p.fee_type)
      .filter(type => type !== null && type !== undefined);
    return [...new Set(feeTypes)]; // Remove duplicates
  };

  // Build query parameters for search API
  const buildSearchParams = (page = 1) => {
    const params = new URLSearchParams();
    const offset = (page - 1) * pageSize;
    params.append("limit", pageSize);
    params.append("offset", offset);

    // Add filters if selected
    if (selectedMonth) {
      params.append("month", selectedMonth);
    }
    if (selectedClass) {
      // Find class ID from yearLevels
      const classItem = yearLevels.find(
        (level) => level.level_name === selectedClass
      );
      if (classItem) {
        params.append("class_id", classItem.id);
      }
    }
    if (selectedSchoolYear) {
      // Find school year ID
      const yearItem = schoolYears.find(
        (year) => year.year_name === selectedSchoolYear
      );
      if (yearItem) {
        params.append("school_year_id", yearItem.id);
      }
    }
    if (selectedFeeType) {
      params.append("fee_type", selectedFeeType);
    }
    if (searchTerm.trim()) {
      // Check if search term is a number (scholar number)
      if (!isNaN(searchTerm.trim())) {
        params.append("scholar_number", searchTerm.trim());
      } else {
        params.append("student", searchTerm.trim());
      }
    }

    return params.toString();
  };

  // Fetch data with pagination
  const fetchData = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = buildSearchParams(page);
      const response = await axiosInstance.get(
        `/d/studentfees/search_receipts/?${queryParams}`
      );
      const data = response.data;

      if (
        data &&
        typeof data === "object" &&
        data.detail === "No records found."
      ) {
        setAllStudents([]);
        setTotalCount(0);
        setNextUrl(null);
        setPrevUrl(null);
      } else if (data && typeof data === "object" && data.results) {
        setAllStudents(data.results);
        setTotalCount(data.count);
        setNextUrl(data.next);
        setPrevUrl(data.previous);
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchData(1);
  }, []);

  // Handle filter changes – reset to page 1 and fetch
  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
    fetchData(1);
  };

  const resetFilters = () => {
    setSelectedMonth("");
    setSelectedClass("");
    setSelectedSchoolYear("");
    setSelectedFeeType("");
    setSearchTerm("");
    setCurrentPage(1);
    fetchData(1);
  };

  // Search handler with debounce
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    
    // Clear existing timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    // Set new timeout
    const timeout = setTimeout(() => {
      fetchData(1);
    }, 500);
    setDebounceTimeout(timeout);
  };

  // Pagination handlers
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      fetchData(newPage);
    }
  };

  const goToNextPage = () => {
    if (nextUrl) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      fetchData(newPage);
    }
  };

  // Apply client-side filters on the current page data
  const filteredStudents = allStudents
    .filter((item) => {
      const monthsPaid = getMonthsFromPayments(item.payments);
      
      // School year filter (if not handled by API)
      const matchSchoolYear =
        !selectedSchoolYear ||
        item.school_year === selectedSchoolYear;

      // Month filter (if not handled by API)
      const matchMonth = !selectedMonth || monthsPaid.includes(selectedMonth);

      // Fee type filter (if not handled by API)
      const feeTypes = getFeeTypesFromPayments(item.payments);
      const matchFeeType = !selectedFeeType || feeTypes.includes(selectedFeeType);

      return matchSchoolYear && matchMonth && matchFeeType;
    })
    .sort((a, b) => {
      const nameA = a.student?.name || "";
      const nameB = b.student?.name || "";
      return nameA.localeCompare(nameB);
    });

  // Compute pagination info
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => fetchData(currentPage)}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
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
            <div className="flex flex-wrap items-end gap-4 w-full sm:w-auto">
              {/* Class Filter */}
              <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Class
                </label>
                <select
                  className="select select-bordered w-full focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  value={selectedClass}
                  onChange={(e) =>
                    handleFilterChange(setSelectedClass, e.target.value)
                  }
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
                  onChange={(e) =>
                    handleFilterChange(setSelectedMonth, e.target.value)
                  }
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
                  onChange={(e) =>
                    handleFilterChange(setSelectedSchoolYear, e.target.value)
                  }
                >
                  <option value="">All Years</option>
                  {schoolYears.map((year) => (
                    <option key={year.id} value={year.year_name}>
                      {year.year_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fee Type Filter */}
              <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fee Type
                </label>
                <select
                  className="select select-bordered w-full focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  value={selectedFeeType}
                  onChange={(e) =>
                    handleFilterChange(setSelectedFeeType, e.target.value)
                  }
                >
                  <option value="">All Types</option>
                  <option value="Tuition Fee (General)">Tuition Fee (General)</option>
                  <option value="Tuition Fee (PCM/PCB)">Tuition Fee (PCM/PCB)</option>
                  <option value="Admission Fee">Admission Fee</option>
                  <option value="Exam Fee">Exam Fee</option>
                  <option value="Activity Fee">Activity Fee</option>
                  <option value="Caution Fee">Caution Fee</option>
                  <option value="Maintenance">Maintenance</option>
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
                placeholder="Enter name, receipt no, scholar no..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
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
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">School Year</th>
                <th className="px-4 py-3">Fee Types</th>
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
                    colSpan="12"
                    className="text-center py-6 text-gray-500 dark:text-gray-400"
                  >
                    No data found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((record, index) => {
                  const monthsPaid = getMonthsFromPayments(record.payments);
                  const feeTypes = getFeeTypesFromPayments(record.payments);

                  return (
                    <tr
                      key={record.receipt_number || index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-100 text-nowrap">
                        {startIndex + index}
                      </td>

                      <td className="px-4 py-3 text-gray-800 dark:text-gray-100 text-nowrap">
                        {record.receipt_number}
                      </td>

                      <td className="px-4 py-3 text-gray-800 dark:text-gray-100 text-nowrap">
                        {record.student?.name || "—"}
                      </td>

                      <td className="px-4 py-3 text-gray-800 dark:text-gray-100 text-nowrap">
                        {record.student?.class_name || "—"}
                      </td>

                      <td className="px-4 py-3 text-gray-800 dark:text-gray-100 text-nowrap">
                        {record.student?.class_section || "—"}
                      </td>

                      <td className="px-4 py-3 text-gray-800 dark:text-gray-100 text-nowrap">
                        {record.school_year || "—"}
                      </td>

                      <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                        {feeTypes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {feeTypes.map((type, idx) => (
                              <span 
                                key={idx}
                                className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        ) : "—"}
                      </td>

                      <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                        {monthsPaid.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {monthsPaid.map((month, idx) => (
                              <span 
                                key={idx}
                                className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded"
                              >
                                {month}
                              </span>
                            ))}
                          </div>
                        ) : "—"}
                      </td>

                      <td className="px-4 py-3 text-gray-800 dark:text-gray-100 text-nowrap">
                        {record.payment_date}
                      </td>

                      <td className="px-4 py-3 text-gray-800 dark:text-gray-100 text-nowrap font-semibold">
                        ₹{record.total_amount_paid}
                      </td>

                      <td className="px-4 underline textTheme hover:text-blue-800 dark:hover:text-blue-200 cursor-pointer text-center text-nowrap">
                        <Link
                          to={allRouterLink.viewFeesDetails
                            .replace(":id", record.student?.student_year_id || record.student?.id)
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

        {/* Pagination Controls */}
        {totalCount > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Showing {startIndex}–{endIndex} of {totalCount} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded border ${
                  currentPage === 1
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bgTheme text-white hover:bg-opacity-80"
                }`}
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={goToNextPage}
                disabled={!nextUrl}
                className={`px-4 py-2 rounded border ${
                  !nextUrl
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bgTheme text-white hover:bg-opacity-80"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeSummaryTable;