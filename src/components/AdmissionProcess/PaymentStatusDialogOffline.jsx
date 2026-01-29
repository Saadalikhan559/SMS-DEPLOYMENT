import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../router/routes";
import { allRouterLink } from "../../router/AllRouterLinks";

const PaymentStatusDialogOffline = ({ paymentStatus, onClose }) => {
  if (!paymentStatus) return null;

  const printRef = useRef();


  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const options = { year: "numeric", month: "short", day: "numeric" };
      return date.toLocaleDateString("en-US", options);
    } catch {
      return dateString;
    }
  };

  const handlePrint = () => {
    const originalContents = document.body.innerHTML;
    const printContents = printRef.current.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const lastReceipt =
    paymentStatus.data?.[paymentStatus.data.length - 1]?.receipt_number ||
    "N/A";

  const schoolYear = paymentStatus.data?.[0]?.school_year_name || "N/A";

  const receiptData = {
    receipt_number: paymentStatus.receipt_number || "N/A",

    timestamp: paymentStatus.payment_date || new Date().toISOString(),

    payment_method: paymentStatus.payment_mode || "N/A",

    student: paymentStatus.student?.name || "N/A",

    student_class:
      `${paymentStatus.student?.class_name || ""} ${
        paymentStatus.student?.class_section || ""
      }` || "N/A",

    school_year: paymentStatus.school_year || "N/A", // Only if you have it

    payment_details: [
      {
        fee_type: paymentStatus.fee?.fee_type || "N/A",
        paid_amount: Number(paymentStatus.fee?.amount_paid || 0),
        remaining_due: Number(paymentStatus.fee?.due_amount || 0),
        month: paymentStatus.fee?.month || "N/A",
        fee_status: paymentStatus.fee?.status || "N/A",
      },
    ],

    total_paid: Number(paymentStatus.total_amount_paid || 0),
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-2">
      <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 w-full max-w-md p-4 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-300 dark:border-gray-600 pb-2 mb-3">
          <h2 className="text-lg font-bold text-green-700 dark:text-green-400">
            Payment Summary
          </h2>
          <button
            onClick={onClose}
            className="btn btn-circle btn-xs bg-gray-200 dark:bg-gray-700 dark:text-white"
          >
            ✕
          </button>
        </div>

        {/* Printable Content */}
        <div ref={printRef} className="space-y-3 text-sm">
          {/* Receipt Details */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Receipt Details
            </h3>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <p>
                <strong>No:</strong> {receiptData.receipt_number}
              </p>
              <p>
                <strong>Date:</strong> {formatDate(receiptData.timestamp)}
              </p>
              <p>
                <strong>Mode:</strong> {receiptData.payment_method}
              </p>
              <p>
                <strong>School Year:</strong> {receiptData.school_year}
              </p>
            </div>
          </div>

          {/* Student Info */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Student
            </h3>
            <p className="text-xs">
              {receiptData.student} ({receiptData.student_class})
            </p>
          </div>

          

          {/* Summary */}
          <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Summary
            </h3>
            <p className="text-xs text-green-700 dark:text-green-400">
              <strong>Total Paid:</strong> ₹
              {Number(receiptData.total_paid).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="btn bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-white btn-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusDialogOffline;
