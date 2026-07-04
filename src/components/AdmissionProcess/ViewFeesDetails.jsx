import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toPng } from "html-to-image";
import img from "../../assets/logo.png";
import jsPDF from "jspdf";

export const ViewFeesDetails = () => {
  const { id, receipt_number } = useParams();
  const { axiosInstance } = useContext(AuthContext);
  const receiptRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [feeSummary, setFeeSummary] = useState({});
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const getFeeSummaryData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get(
        `/d/studentfees/grouped_receipts/?student_year_id=${id}&receipt_number=${receipt_number}`,
      );
      const data = response.data;
      // New response structure: { count, next, previous, results: [...] }
      if (data && data.results && data.results.length > 0) {
        setFeeSummary(data.results[0]);
      } else {
        setFeeSummary({});
        setError("No fee record found for this student.");
      }
    } catch (err) {
      console.log(err);
      setError("Failed to load fee details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFeeSummaryData();
  }, [id, receipt_number]); // include receipt_number as dependency

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Extract all fee items
  const allFees = Object.values(feeSummary.fees_submitted || {}).flat() || [];

  // SUM amounts for each fee type across months
  const getTotal = (type) => {
    return allFees
      .filter((f) => f.fee_type === type)
      .reduce((sum, f) => sum + Number(f.amount_paid || 0), 0);
  };

  // Get list of months
  const months = Object.keys(feeSummary.fees_submitted || {});

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    setDownloading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const dataUrl = await toPng(receiptRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
        style: {
          margin: "0",
          padding: "20px",
        },
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(dataUrl);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;

      let imgWidth = pageWidth - margin * 2;
      let imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      if (imgHeight > pageHeight - margin * 2) {
        imgHeight = pageHeight - margin * 2;
        imgWidth = (imgProps.width * imgHeight) / imgProps.height;
      }

      const x = (pageWidth - imgWidth) / 2;
      const y = margin;

      pdf.addImage(dataUrl, "PNG", x, y, imgWidth, imgHeight);
      pdf.save(`receipt_${feeSummary.receipt_number || id}.pdf`);
    } catch (error) {
      console.error("PDF download failed:", error);
    } finally {
      setDownloading(false);
    }
  };

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 text-red-700 p-4 rounded shadow">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!feeSummary || Object.keys(feeSummary).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded shadow">
          <p>No fee details available for this receipt.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div
        ref={receiptRef}
        className="max-w-xl mx-auto border border-gray-300 p-6 bg-white shadow-lg"
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <img src={img} alt="logo Not found" className="logoImg" />
            <div className="flex flex-col items-end">
              <h2 className="text-xl font-bold uppercase leading-tight text-center text-black">
                New Progressive Education Public School
              </h2>
              <div className="mt-2 text-sm text-gray-700 text-center w-full">
                <p className="leading-tight font-bold text-black">
                  Bhopal - 462 001
                </p>
                <p className="leading-tight font-bold text-black">
                  Tel.: 0755 2538456
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="text-sm mb-4 space-y-2 text-black">
          <div className="flex justify-between">
            <p className="text-black">
              Receipt No.:{" "}
              <span className="font-semibold text-red-600">
                {feeSummary.receipt_number || "--"}
              </span>
            </p>
            <p className="text-black">
              Date:{" "}
              <span className="font-semibold text-black">
                {formatDate(feeSummary.payment_date)}
              </span>
            </p>
          </div>

          <div>
            <p className="text-black">
              Child's Name:{" "}
              <span className="font-semibold capitalize text-black">
                {feeSummary.student?.name || "--"}
              </span>
            </p>
          </div>

          <div>
            <p className="text-black">
              Parent's Name:{" "}
              <span className="font-semibold capitalize text-black">
                {feeSummary.student?.father_name || "Not Mentioned"}
              </span>
            </p>
          </div>

          <div>
            <p className="text-black">
              Months:{" "}
              <span className="font-semibold capitalize text-black">
                {months.length > 0 ? months.join(", ") : "--"}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-3">
            <p className="text-black">
              Grade:{" "}
              <span className="font-semibold text-black">
                {feeSummary.student?.class_name || "Not Mentioned"}
              </span>
            </p>

            <p className="text-black">
              Section:{" "}
              <span className="font-semibold text-black">
                {feeSummary.student?.class_section || "Not Mentioned"}
              </span>
            </p>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm border border-gray-400">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-400 p-2 text-left text-black">
                Particulars
              </th>
              <th className="border border-gray-400 p-2 text-right text-black">
                Amount (Rs.)
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="border border-gray-400 p-2 text-left text-black">
                Admission Fee
              </td>
              <td className="border border-gray-400 p-2 text-right text-black">
                {getTotal("Admission Fee")}/-
              </td>
            </tr>

            <tr>
              <td className="border border-gray-400 p-2 text-left text-black">
                Caution Money
              </td>
              <td className="border border-gray-400 p-2 text-right text-black">
                {getTotal("Caution Fee")}/-
              </td>
            </tr>

            <tr>
              <td className="border border-gray-400 p-2 text-left text-black">
                Exam Fees
              </td>
              <td className="border border-gray-400 p-2 text-right text-black">
                {getTotal("Exam Fee")}/-
              </td>
            </tr>

            <tr>
              <td className="border border-gray-400 p-2 text-left text-black">
                Maintenance
              </td>
              <td className="border border-gray-400 p-2 text-right text-black">
                {getTotal("Maintenance")}/-
              </td>
            </tr>

            <tr>
              <td className="border border-gray-400 p-2 text-left text-black">
                Tuition Fees
              </td>
              <td className="border border-gray-400 p-2 text-right text-black">
                {getTotal("Tuition Fee")}/-
              </td>
            </tr>

            <tr>
              <td className="border border-gray-400 p-2 text-left text-black">
                Form Fee
              </td>
              <td className="border border-gray-400 p-2 text-right text-black">
                {getTotal("Form Fee")}/-
              </td>
            </tr>

            <tr>
              <td className="border border-gray-400 p-2 text-left text-black">
                Others
              </td>
              <td className="border border-gray-400 p-2 text-right text-black">
                {getTotal("Others")}/-
              </td>
            </tr>

            <tr className="bg-gray-100">
              <td className="border border-gray-400 p-2 text-center font-semibold text-black">
                Grand Total
              </td>
              <td className="border border-gray-400 p-2 text-right font-semibold text-black">
                {feeSummary.total_amount_paid || "0"}/-
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div className="text-sm mt-4 text-black">
          <p className="text-black">
            <strong className="text-black">Paid by:</strong>{" "}
            {feeSummary.payment_mode || "--"}
          </p>
          <p className="text-black">
            Fees once paid are neither refundable nor transferable.
          </p>
          <p className="text-gray-500 text-xs">
            This is a computer generated receipt. No signature is required.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-xl mx-auto flex justify-end gap-3 mb-24 md:mb-20 mt-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn bgTheme text-white"
        >
          {downloading ? "Saving" : "Save & Print"}
        </button>
      </div>
    </div>
  );
};
