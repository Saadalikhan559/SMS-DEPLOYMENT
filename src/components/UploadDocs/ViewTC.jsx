import React, { useEffect, useState } from "react";
import { fetchTransferCertificates } from "../../services/api/Api";
import { constants } from "../../global/constants";

const TransferCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [downloading, setDownloading] = useState(null);
  const pageSize = 10;

  const getTransferCertificates = async (page = 1) => {
    try {
      setLoading(true);
      const data = await fetchTransferCertificates(page, pageSize);
      setCertificates(data.results || []);
      setTotalPages(Math.ceil(data.count / pageSize));
      setTotalItems(data.count);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      setError("Failed to load transfer certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTransferCertificates(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      getTransferCertificates(newPage);
    }
  };

  const handleDownload = async (fileUrl, studentName, certificateId) => {
    try {
      setDownloading(certificateId);
      
      // Get token for authorization
      const authTokens = localStorage.getItem("authTokens");
      const accessToken = authTokens ? JSON.parse(authTokens).access : null;
      
      // Fetch the file with authentication
      const response = await fetch(fileUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to download file");
      }
      
      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from URL or create one
      const fileName = fileUrl.split('/').pop() || `${studentName || 'certificate'}_${certificateId}.pdf`;
      link.download = fileName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download the certificate. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  const filteredCertificates = certificates.filter((cert) =>
    cert.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.identities?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.year_level?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce [animation-delay:-0.2s]"></div>
          <div className="w-3 h-3 bgTheme rounded-full animate-bounce [animation-delay:-0.4s]"></div>
        </div>
        <p className="mt-2 text-gray-500 text-sm">Loading transfer certificates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
        <i className="fa-solid fa-triangle-exclamation text-5xl text-red-400 mb-4"></i>
        <p className="text-lg text-red-400 font-medium">{error}</p>
        <button
          onClick={() => getTransferCertificates(1)}
          className="mt-4 bgTheme text-white px-6 py-2 rounded-lg hover:opacity-90 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 bg-gray-50 dark:bg-gray-900 mb-24 md:mb-10">
      <div className="bg-white dark:bg-gray-800 max-w-7xl p-6 rounded-lg shadow-lg mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            <i className="fa-solid fa-file-pdf mr-2 text-red-500" />
            Transfer Certificates
          </h1>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 sm:mt-0">
            Total: {totalItems} certificate{totalItems !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by Student Name, ID or Class"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.trimStart())}
              className="border px-3 py-2 pl-10 rounded w-full dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="min-w-full text-sm text-left">
              <thead className="bgTheme text-white sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-semibold">S.No</th>
                  <th className="px-6 py-4 font-semibold">Student Name</th>
                  <th className="px-6 py-4 font-semibold">Class</th>
                  <th className="px-6 py-4 font-semibold">Certificate ID</th>
                  <th className="px-6 py-4 font-semibold">Uploaded At</th>
                  <th className="px-6 py-4 font-semibold text-center">Download</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCertificates.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm ? (
                        <span>
                          No certificates found for "{searchTerm}".{' '}
                          <button
                            onClick={() => setSearchTerm("")}
                            className="text-indigo-600 hover:underline dark:text-indigo-400"
                          >
                            Clear search
                          </button>
                        </span>
                      ) : (
                        'No transfer certificates found.'
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredCertificates.map((cert, index) => (
                    <tr key={cert.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-6 py-4 font-medium capitalize">{cert.student_name || "N/A"}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {cert.year_level || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm">{cert.identities || "N/A"}</td>
                      <td className="px-6 py-4 text-sm">
                        {cert.uploaded_at ? new Date(cert.uploaded_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {cert.files && cert.files.length > 0 ? (
                          <button
                            onClick={() => handleDownload(cert.files[0].file, cert.student_name, cert.id)}
                            disabled={downloading === cert.id}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 text-white rounded-lg transition text-sm
                              ${downloading === cert.id 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700'}`}
                          >
                            {downloading === cert.id ? (
                              <>
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                Downloading...
                              </>
                            ) : (
                              <>
                                <i className="fa-solid fa-download"></i>
                                Download
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">No file</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded border dark:border-gray-600 transition
                    ${currentPage === 1 
                      ? 'opacity-50 cursor-not-allowed text-gray-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>

                <span className="text-sm text-gray-700 dark:text-gray-300 px-3">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded border dark:border-gray-600 transition
                    ${currentPage === totalPages 
                      ? 'opacity-50 cursor-not-allowed text-gray-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferCertificates;