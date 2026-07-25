import React, { useEffect, useState, useContext, useRef } from "react";
import { fetchYearLevels } from "../../services/api/Api";
import { AuthContext } from "../../context/AuthContext";
import { constants } from "../../global/constants";

const UnpaidFeesList = () => {
  const { userRole, yearLevelID, userID, studentID, axiosInstance } = useContext(AuthContext);

  const [unpaidFees, setUnpaidFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); // For debounced search
  const [yearLevels, setYearLevels] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loder, setLoder] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Debounce timer ref
  const debounceTimer = useRef(null);

  // Fetch year levels 
  const getYearLevels = async () => {
    try {
      const data = await fetchYearLevels();
      setYearLevels(data);
    } catch (err) {
      console.error("Error fetching year levels:", err);
    }
  };

  const loadUnpaidFees = async () => {
    try {
      setLoading(true);
      
      // Build query parameters with pagination
      const params = new URLSearchParams();
      params.append('limit', itemsPerPage);
      params.append('offset', (currentPage - 1) * itemsPerPage);
      
      // Add month filter
      if (selectedMonth) {
        const monthNumber = new Date(`${selectedMonth} 1, 2000`).getMonth() + 1;
        params.append('month', monthNumber);
      }
      
      // Add class filter
      if (selectedClass) {
        const selectedLevel = yearLevels.find(level => level.level_name === selectedClass);
        if (selectedLevel) {
          params.append('student_year_id', selectedLevel.id);
        }
      }

      // Add search filter - use debounced search
      if (debouncedSearch.trim()) {
        params.append('search', debouncedSearch.trim());
      }

      const response = await axiosInstance.get(`/d/studentfees/overdue_fees/?${params.toString()}`);
      
      // Handle paginated response
      if (response.data && response.data.results) {
        setUnpaidFees(response.data.results);
        setTotalItems(response.data.count || 0);
      } else {
        setUnpaidFees([]);
        setTotalItems(0);
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching unpaid fees:", err.response?.data || err.message);
      setError("Failed to load unpaid fees");
      setUnpaidFees([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // Sort fees
  const sortedFees = [...unpaidFees].sort((a, b) =>
    (a.student_name || "").localeCompare(b.student_name || "", undefined, { sensitivity: "base" })
  );

  // Handle search with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value.trimStart();
    setSearchTerm(value);
    setCurrentPage(1);
    
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer (500ms delay)
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 500);
  };

  // Send notification using axiosInstance 
  const handleSendNotifications = async () => {
    try {
      setLoder(true);
      const response = await axiosInstance.get("/d/fee-record/student_unpaid_fees/");
      setNotifications(response.data.notifications || []);
      setModalMessage(" WhatsApp notifications sent successfully!");
      setShowModal(true);
    } catch (err) {
      setModalMessage(" Failed to send notifications!");
      setShowModal(true);
    } finally {
      setLoder(false);
    }
  };

  useEffect(() => {
    getYearLevels();
  }, []);

  // Reload when filters or pagination changes (except searchTerm)
  useEffect(() => {
    if (yearLevels.length > 0) {
      loadUnpaidFees();
    }
  }, [selectedMonth, selectedClass, debouncedSearch, currentPage, itemsPerPage, yearLevels]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const resetFilters = () => {
    setSelectedMonth("");
    setSelectedClass("");
    setSearchTerm("");
    setDebouncedSearch("");
    setCurrentPage(1);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(totalItems / itemsPerPage)) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
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
    <div className="min-h-screen p-5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 mb-24 md:mb-10">
      <div className="bg-white dark:bg-gray-800 max-w-7xl p-6 rounded-lg shadow-lg mx-auto">
        {/* Title */}
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-4">
            <i className="fa-solid fa-graduation-cap mr-2"></i> Overdue Accounts Summary
          </h1>
        </div>

        {/* Filter Section */}
        <div className="w-full px-5">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-6 w-full border-b border-gray-300 dark:border-gray-700 pb-4">
            <div className="flex flex-wrap items-end gap-4 w-full sm:w-auto">
              {/* Month Filter */}
              <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium mb-1">Search by Month</label>
                <select
                  className="select select-bordered w-full focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Months</option>
                  {[
                    "January", "February", "March", "April", "May", "June", "July",
                    "August", "September", "October", "November", "December",
                  ].map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              {/* Class Filter */}
              {(userRole === constants.roles.director || userRole === constants.roles.officeStaff) && (
                <div className="flex flex-col w-full sm:w-auto">
                  <label className="text-sm font-medium mb-1">Search by Class</label>
                  <select
                    className="select select-bordered w-full focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">All Classes</option>
                    {yearLevels.map((level) => (
                      <option key={level.id} value={level.level_name}>{level.level_name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Reset Button */}
              <div className="mt-1 w-full sm:w-auto">
                <button
                  onClick={resetFilters}
                  className="btn bgTheme text-white"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-end gap-2 w-full sm:w-auto justify-end">
              <div className="flex flex-col w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Enter student name"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="border px-3 py-2 rounded w-full sm:w-64 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto rounded-lg no-scrollbar max-h-[70vh]">
          <table className="min-w-full table-auto divide-y divide-gray-300 dark:divide-gray-700">
            <thead className="bgTheme text-white sticky top-0 z-2">
              <tr>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">S.No</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Student Name</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Class</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Month</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Fee Type</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Total Amount</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Paid Amount</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Due Amount</th>
                <th className="px-4 py-3 text-left text-nowrap whitespace-nowrap">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {sortedFees.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No data found.
                  </td>
                </tr>
              ) : (
                sortedFees.map((item, index) => {
                  const isPaid = parseFloat(item.due_amount) <= 0 || item.status?.toLowerCase() === "paid";
                  return (
                    <tr key={item.fee_id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-4 py-3 text-nowrap font-bold">{item.student_name}</td>
                      <td className="px-4 py-3 text-nowrap">{item.class_name}</td>
                      <td className="px-4 py-3 text-nowrap">{item.month}</td>
                      <td className="px-4 py-3 text-nowrap">{item.fee_type}</td>
                      <td className="px-4 py-3 text-nowrap">₹{item.original_amount}</td>
                      <td className="px-4 py-3 text-nowrap">₹{item.paid_amount}</td>
                      <td className="px-4 py-3 text-nowrap">₹{item.due_amount}</td>
                      <td
                        className={`inline-flex items-center px-3 py-1 rounded-md shadow-sm text-sm font-medium m-2 ${isPaid ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          }`}
                      >
                        {item.status || (isPaid ? "Paid" : "Unpaid")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center gap-2">
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
              </span>
            </div>
            <div className="join">
              <button
                className="join-item btn dark:bg-gray-700 dark:text-white"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </button>
              <button className="join-item btn btn-disabled dark:bg-gray-600 dark:text-white">
                {currentPage}
              </button>
              <button
                className="join-item btn dark:bg-gray-700 dark:text-white"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box dark:bg-gray-800 dark:text-gray-100">
            <h3 className="font-bold text-lg"> Notification</h3>
            <p className="py-4 whitespace-pre-line">{modalMessage}</p>
            <div className="modal-action">
              <button className="btn bgTheme text-white w-32" onClick={() => setShowModal(false)}>OK</button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default UnpaidFeesList;