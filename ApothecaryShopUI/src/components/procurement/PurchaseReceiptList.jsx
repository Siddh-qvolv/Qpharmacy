import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { getPurchaseReceipts } from "../../services/purchaseReceiptService";
import AppLoader from "../AppLoader";
import { motion } from "framer-motion";
import { 
  FileText, 
  Package, 
  Calendar, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  PackageCheck
} from "lucide-react";

function PurchaseReceiptList() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const data = await getPurchaseReceipts();
      setReceipts(data);
      setError(null);
    } catch (err) {
      setError("Failed to load purchase receipts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <AppLoader message="Loading receipts" />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-slate-800">Purchase Receipts</h2>
      </div>

      {/* Cards Container */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {receipts.length === 0 ? (
          <div className="col-span-full p-16 text-center text-slate-500 flex flex-col justify-center items-center bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <PackageCheck size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">No receipts found</h3>
            <p className="text-slate-500">There are no purchase receipts to display.</p>
          </div>
        ) : (
          receipts.map((receipt) => (
            <motion.div 
              variants={itemVariants}
              key={receipt._id} 
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all duration-200 group"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                      {receipt.receiptNumber}
                    </span>
                  </div>
                  <Link
                    to={`/procurement/purchase-orders/${receipt.purchaseOrder._id}`}
                    className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    PO: {receipt.purchaseOrder.poNumber}
                  </Link>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wider ${
                    receipt.status === "complete"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : receipt.status === "partial"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}>
                    {receipt.status === "complete" && <CheckCircle className="w-3 h-3 mr-1" />}
                    {receipt.status === "partial" && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {receipt.status === "pending" && <XCircle className="w-3 h-3 mr-1" />}
                    {receipt.status.replace("_", " ")}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                    receipt.qualityCheck.passed
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}>
                    {receipt.qualityCheck.passed ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                    {receipt.qualityCheck.passed ? "Passed" : "Failed"}
                  </span>
                </div>
              </div>

              {/* Receipt Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{format(new Date(receipt.receiptDate), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{receipt.receivedBy.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Package className="w-4 h-4 text-slate-400" />
                  <span>{receipt.items.length} items</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100">
                <Link
                  to={`/procurement/purchase-receipts/${receipt._id}`}
                  className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Eye size={16} className="mr-2" />
                  View Details
                </Link>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}

export default PurchaseReceiptList;
