import React, { useEffect, useState } from "react";
import {
  fetchYearLevels,
  fetchStudentYearLevelByClass,
  fetchSchoolYear,
  fetchStudentSession,
} from "../../services/api/Api";
import { Link } from "react-router-dom";

const Allclasses = () => {
  const [yearLevels, setYearLevels] = useState([]);
  const [schoolYearLevels, setSchoolYearLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [countLoading, setCountLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [schoolYearLoading, setSchoolYearLoading] = useState(false);

  // Helper function to determine the current academic year based on API dates
  const getCurrentSchoolYear = (years) => {
    if (!years || years.length === 0) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day for accurate comparison

    // Find the academic year where today falls between start_date and end_date
    const currentYear = years.find(year => {
      const startDate = new Date(year.start_date);
      const endDate = new Date(year.end_date);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      return today >= startDate && today <= endDate;
    });

    if (currentYear) {
      console.log(`Current academic year: ${currentYear.year_name}`); // For debugging
      return currentYear;
    }

    // If no active year found (shouldn't happen with proper data), 
    // find the most recent year based on start_date
    const sortedYears = [...years].sort((a, b) => {
      return new Date(b.start_date) - new Date(a.start_date);
    });

    return sortedYears[0];
  };

  const getYearLevels = async () => {
    setLoading(true);
    try {
      const levels = await fetchYearLevels();
      setYearLevels(levels);
      const years = await fetchSchoolYear();
      if (years.length > 0) {
        const currentYear = getCurrentSchoolYear(years);
        const studentsData = await fetchStudentSession(currentYear.year_name);

        const counts = {};
        studentsData
          .filter(item => item.student_is_active)
          .forEach((item) => {
            counts[item.level_name] = (counts[item.level_name] || 0) + 1;
          });

        const withCounts = levels.map((level) => ({
          ...level,
          student_count: counts[level.level_name] || 0,
        }));

        setYearLevels(withCounts);
      }
    } catch (err) {
      setError("Failed to fetch year levels. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSchoolYear = async () => {
    setSchoolYearLoading(true);
    try {
      const data = await fetchSchoolYear();
      setSchoolYearLevels(data);

      // Use date-based logic to find current academic year
      if (data.length > 0) {
        const currentYear = getCurrentSchoolYear(data);
        if (currentYear) {
          setSelectedYear(currentYear.year_name);
        } else {
          // Fallback to latest year if no current year found
          setSelectedYear(data[data.length - 1].year_name);
        }
      }
    } catch (err) {
      setError("Failed to fetch school years.");
      console.error(err);
    } finally {
      setSchoolYearLoading(false);
    }
  };

  const getStudentCountsByYear = async (year) => {
    if (!year) return;

    setCountLoading(true);
    try {
      const studentsData = await fetchStudentSession(year);

      const counts = {};

      studentsData
        .filter(item => item.student_is_active)
        .forEach((item) => {
          const levelName = item.level_name;
          counts[levelName] = (counts[levelName] || 0) + 1;
        });

      setYearLevels((prevLevels) =>
        prevLevels.map((level) => ({
          ...level,
          student_count: counts[level.level_name] || 0,
        })),
      );
    } catch (err) {
      console.error(err);
      setError("Failed to fetch student data.");
    } finally {
      setCountLoading(false);
    }
  };

  useEffect(() => {
    if (selectedYear) {
      getStudentCountsByYear(selectedYear);
    }
  }, [selectedYear]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const levels = await fetchYearLevels();
        setYearLevels(levels);

        const years = await fetchSchoolYear();
        setSchoolYearLevels(years);

        if (years.length > 0) {
          const currentYear = getCurrentSchoolYear(years);
          if (currentYear) {
            setSelectedYear(currentYear.year_name);
          } else {
            setSelectedYear(years[years.length - 1].year_name);
          }
        }
      } catch (err) {
        setError("Failed to load data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // Loading and error states remain the same
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
        <p className="text-lg text-red-400 font-medium">
          Failed to load data, Try Again
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 bg-gray-50 dark:bg-gray-900 mb-24 md:mb-10">
      <div className="bg-white dark:bg-gray-800 p-6 max-w-7xl mx-auto rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">
          <i className="fa-solid fa-graduation-cap mr-2" />
          All Year Levels
        </h1>
        <div className="flex items-center mb-5">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="select select-bordered w-full sm:w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
          >
            {schoolYearLevels.map((year) => (
              <option key={year.id} value={year.year_name}>
                {year.year_name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto no-scrollbar rounded-lg max-h-[70vh]">
          <table className="min-w-full table-auto">
            <thead className="bgTheme text-white sticky top-0 z--1 text-sm">
              <tr>
                <th scope="col" className="px-4 py-3 text-nowrap text-center">
                  S.NO
                </th>
                <th scope="col" className="px-4 py-3 text-nowrap text-center">
                  Year Level
                </th>
                <th scope="col" className="px-4 py-3 text-nowrap text-center">
                  Number Of Students
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {yearLevels.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center py-6 text-gray-500 dark:text-gray-400"
                  >
                    No data found.
                  </td>
                </tr>
              ) : (
                yearLevels.map((record, index) => (
                  <tr
                    key={record.id || index}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-4 py-3 text-center text-nowrap text-gray-700 dark:text-gray-300">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 font-bold text-nowrap text-center capitalize">
                      <Link
                        to={`/allStudentsPerClass/${record.id}`}
                        state={{
                          level_name: record.level_name,
                          selected_year: selectedYear,
                        }}
                        className="textTheme hover:underline"
                      >
                        {record.level_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center text-nowrap">
                      {record.student_count}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Allclasses;