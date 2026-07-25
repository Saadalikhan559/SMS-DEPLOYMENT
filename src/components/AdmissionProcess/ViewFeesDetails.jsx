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
  }, [id, receipt_number]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Get all fee items with their month info
  const getFeesWithMonth = () => {
    const fees = [];
    const feesSubmitted = feeSummary.fees_submitted || {};
    Object.keys(feesSubmitted).forEach(month => {
      if (Array.isArray(feesSubmitted[month])) {
        feesSubmitted[month].forEach(fee => {
          fees.push({
            ...fee,
            month: month === "Unknown" ? "" : month,
            amountPaid: Number(fee.amount_paid || 0),
            originalAmount: Number(fee.original_amount || 0),
            dueAmount: Number(fee.due_amount || 0),
            discount: Number(fee.discount || 0)
          });
        });
      }
    });
    return fees;
  };

  // Get valid months (excluding "Unknown")
  const getValidMonths = () => {
    return Object.keys(feeSummary.fees_submitted || {})
      .filter(month => month !== "Unknown");
  };

  const validMonths = getValidMonths();
  const feesWithMonth = getFeesWithMonth();

  // Calculate totals
  const totalOriginal = feesWithMonth.reduce((sum, f) => sum + f.originalAmount, 0);
  const totalPaid = feesWithMonth.reduce((sum, f) => sum + f.amountPaid, 0);
  const totalDue = feesWithMonth.reduce((sum, f) => sum + f.dueAmount, 0);
  const totalDiscount = feesWithMonth.reduce((sum, f) => sum + f.discount, 0);

  // Check if any fee has pending amount
  const hasPendingAmount = feesWithMonth.some(fee => fee.dueAmount > 0);

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
                {validMonths.length > 0 ? validMonths.join(", ") : "--"}
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

        {/* Table with Original, Paid, and Due columns */}
        <table className="w-full text-sm border border-gray-400">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-400 p-2 text-left text-black">
                Particulars
              </th>
              <th className="border border-gray-400 p-2 text-right text-black">
                Original (₹)
              </th>
              <th className="border border-gray-400 p-2 text-right text-black">
                Paid (₹)
              </th>
              <th className="border border-gray-400 p-2 text-right text-black">
                Due (₹)
              </th>
              <th className="border border-gray-400 p-2 text-center text-black">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {/* Show each fee with its month and payment details */}
            {feesWithMonth.map((fee, index) => {
              const displayName = fee.month 
                ? `${fee.fee_type} (${fee.month})` 
                : fee.fee_type;
              
              let status = "Pending";
              let statusColor = "bg-red-100 text-red-700";
              
              if (fee.dueAmount === 0 && fee.amountPaid > 0) {
                status = "Paid";
                statusColor = "bg-green-100 text-green-700";
              } else if (fee.amountPaid > 0 && fee.dueAmount > 0) {
                status = "Partial";
                statusColor = "bg-yellow-100 text-yellow-700";
              }

              return (
                <tr key={`${fee.fee_type}-${index}`}>
                  <td className="border border-gray-400 p-2 text-left text-black">
                    {displayName}
                  </td>
                  <td className="border border-gray-400 p-2 text-right text-black">
                    {fee.originalAmount.toFixed(2)}
                  </td>
                  <td className="border border-gray-400 p-2 text-right text-black">
                    {fee.amountPaid.toFixed(2)}
                  </td>
                  <td className="border border-gray-400 p-2 text-right text-black">
                    {fee.dueAmount.toFixed(2)}
                  </td>
                  <td className="border border-gray-400 p-2 text-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColor}`}>
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}

            {/* Summary Row */}
            <tr className="bg-gray-50 font-semibold">
              <td className="border border-gray-400 p-2 text-left text-black">
                Total
              </td>
              <td className="border border-gray-400 p-2 text-right text-black">
                {totalOriginal.toFixed(2)}
              </td>
              <td className="border border-gray-400 p-2 text-right text-black">
                {totalPaid.toFixed(2)}
              </td>
              <td className="border border-gray-400 p-2 text-right text-black">
                {totalDue.toFixed(2)}
              </td>
              <td className="border border-gray-400 p-2 text-center"></td>
            </tr>

            {/* Grand Total Paid */}
            <tr className="bg-gray-100">
              <td colSpan="2" className="border border-gray-400 p-2 text-center font-semibold text-black">
                Grand Total Paid
              </td>
              <td colSpan="2" className="border border-gray-400 p-2 text-right font-semibold text-black">
                {feeSummary.total_amount_paid || "0.00"}
              </td>
              <td className="border border-gray-400 p-2"></td>
            </tr>
          </tbody>
        </table>

        {/* Payment Status Summary */}
        <div className="mt-4 text-sm">
          <div className="flex justify-between items-center border-t border-gray-300 pt-3">
            <p className="text-black">
              <strong>Payment Status:</strong>
            </p>
            <span className={`text-sm font-semibold px-3 py-1 rounded ${
              !hasPendingAmount ? "bg-green-100 text-green-700" :
              "bg-yellow-100 text-yellow-700"
            }`}>
              {!hasPendingAmount ? "✅ Fully Paid" : "⚠️ Partial Payment"}
            </span>
          </div>
          {hasPendingAmount && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600 text-xs">
                <strong>Remaining Due:</strong> ₹{totalDue.toFixed(2)}
              </p>
              <p className="text-red-500 text-xs mt-1">
                * Partial payment accepted. Please pay the remaining amount to clear the dues.
              </p>
            </div>
          )}
          {totalDiscount > 0 && (
            <p className="text-green-600 text-xs mt-1">
              * Discount applied: ₹{totalDiscount.toFixed(2)}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="text-sm mt-4 text-black border-t border-gray-300 pt-3">
          <p className="text-black">
            <strong className="text-black">Paid by:</strong>{" "}
            {feeSummary.payment_mode || "--"}
          </p>
          <p className="text-black text-xs mt-1">
            Fees once paid are neither refundable nor transferable.
          </p>
          <p className="text-gray-500 text-xs mt-1">
            This is a computer generated receipt. No signature is required.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-xl mx-auto flex justify-end gap-3 mb-24 md:mb-20 mt-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn bgTheme text-white px-6 py-2 rounded hover:opacity-90 transition-opacity"
        >
          {downloading ? "Saving..." : "Save & Print"}
        </button>
      </div>
    </div>
  );
};