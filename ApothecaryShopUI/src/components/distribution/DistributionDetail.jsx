import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getDistributionById,
  updateDistributionStatus,
} from "../../services/distributionService";
import AppLoader from "../AppLoader";
import {
  ArrowLeft,
  Package,
  Truck,
  Calendar,
  User,
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

const DistributionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [distribution, setDistribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchDistribution();
  }, [id]);

  const fetchDistribution = async () => {
    try {
      const data = await getDistributionById(id);
      setDistribution(data);
    } catch (err) {
      console.error("Error fetching distribution details:", err);
      setError("Failed to load distribution details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (
      window.confirm(
        `Are you sure you want to mark this order as ${newStatus}?`
      )
    ) {
      setUpdatingStatus(true);
      try {
        const updatedDistribution = await updateDistributionStatus(
          id,
          newStatus
        );
        setDistribution(updatedDistribution);
      } catch (err) {
        console.error("Error updating status:", err);
        setError("Failed to update status");
      } finally {
        setUpdatingStatus(false);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Clock },
      processed: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: Package },
      shipped: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: Truck },
      delivered: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle },
      returned: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: XCircle },
      cancelled: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", icon: AlertCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border ${config.bg} ${config.text} ${config.border}`}
      >
        <IconComponent size={16} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) return <AppLoader message="Loading details" />;

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-rose-50/20 xl:ml-20 p-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-rose-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle size={32} className="text-rose-600" />
              <div>
                <h3 className="text-xl font-bold text-rose-900">{error}</h3>
                <p className="text-rose-600 text-sm mt-1">Unable to load distribution details</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/distributions")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
            >
              <ArrowLeft size={18} />
              Back to List
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!distribution) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50/30 to-slate-50/20 xl:ml-20 p-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={40} className="text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Distribution Order Not Found</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              The distribution order you're looking for doesn't exist or may have been deleted.
            </p>
            <button
              onClick={() => navigate("/distributions")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
            >
              <ArrowLeft size={18} />
              Back to List
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-emerald-50/20 xl:ml-20 pb-12">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/distributions")}
              className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Distribution Order</h1>
              <p className="text-slate-600 mt-1">Order #{distribution.orderNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(distribution.status)}
          </div>
        </motion.div>

        {/* Status Timeline Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wide">Order Status Progress</h3>
            <div className="flex items-center justify-between">
              {["pending", "processed", "shipped", "delivered"].map((s, idx) => {
                const isActive = distribution.status === s;
                const isCompleted = ["processed", "shipped", "delivered", "returned"].includes(distribution.status) && idx < ["pending", "processed", "shipped", "delivered"].indexOf(distribution.status);
                return (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex flex-col items-center flex-1"
                  >
                    <motion.div
                      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ repeat: isActive ? Infinity : 0, duration: 1 }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                        isActive || isCompleted
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      {s.charAt(0).toUpperCase()}
                    </motion.div>
                    <p className={`text-xs font-medium text-center ${isActive || isCompleted ? "text-slate-900" : "text-slate-400"}`}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Order Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Package size={20} className="text-emerald-600" />
                  Order Information
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Created</p>
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-slate-400" />
                      <p className="font-medium text-slate-900">
                        {new Date(distribution.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(distribution.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {distribution.deliveredAt && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Delivered</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={18} className="text-emerald-500" />
                        <p className="font-medium text-slate-900">
                          {new Date(distribution.deliveredAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(distribution.deliveredAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Created By</p>
                    <div className="flex items-center gap-2">
                      <User size={18} className="text-slate-400" />
                      <p className="font-medium text-slate-900">
                        {distribution.createdBy?.name || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Status Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-full hover:shadow-md transition-shadow">
              <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50 to-purple-50">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock size={20} className="text-purple-600" />
                  Update Status
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Change Order Status</label>
                    <div className="relative">
                      <select
                        value={distribution.status}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        disabled={updatingStatus}
                        className="w-full appearance-none py-3 px-4 bg-white border-2 border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 cursor-pointer hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%237c3aed' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                          backgroundPosition: 'right 0.75rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em',
                          paddingRight: '2.5rem'
                        }}
                      >
                        {["pending", "processed", "shipped", "delivered", "returned", "cancelled"].map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-purple-600">
                        <Clock size={18} />
                      </div>
                    </div>
                  </div>

                  {/* <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStatusUpdate(distribution.status)}
                    disabled={updatingStatus}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updatingStatus ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                          <Clock size={16} />
                        </motion.div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Confirm Status Change
                      </>
                    )}
                  </motion.button> */}
                </div>

                {updatingStatus && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <p className="text-sm text-purple-700 font-medium">Processing your status change...</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recipient Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50 to-pink-50">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User size={20} className="text-pink-600" />
                  Recipient Information
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Name</p>
                  <p className="text-lg font-semibold text-slate-900">{distribution.recipient}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Type</p>
                  <span className="inline-block px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100">
                    {distribution.recipientType.charAt(0).toUpperCase() + distribution.recipientType.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Shipping Information */}
          {distribution.shippingInfo && Object.values(distribution.shippingInfo).some((v) => v) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50 to-orange-50">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <MapPin size={20} className="text-orange-600" />
                    Shipping Information
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {distribution.shippingInfo.address && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Address</p>
                      <p className="text-slate-700 leading-relaxed">{distribution.shippingInfo.address}</p>
                    </div>
                  )}
                  {distribution.shippingInfo.contactPerson && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Contact Person</p>
                      <p className="font-medium text-slate-900">{distribution.shippingInfo.contactPerson}</p>
                    </div>
                  )}
                  {distribution.shippingInfo.contactNumber && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Phone</p>
                      <a href={`tel:${distribution.shippingInfo.contactNumber}`} className="text-emerald-600 font-semibold hover:underline flex items-center gap-2">
                        <Phone size={16} />
                        {distribution.shippingInfo.contactNumber}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Items List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50 to-cyan-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package size={20} className="text-cyan-600" />
                Items in Distribution ({distribution.items?.length || 0})
              </h3>
            </div>
            <div className="p-6">
              {distribution.items && distribution.items.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
                  initial="hidden"
                  animate="show"
                >
                  {distribution.items.map((item, idx) => (
                    <motion.div
                      key={idx}
                      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                      className="border border-slate-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                          {item.product?.name?.charAt(0).toUpperCase() || "P"}
                        </div>
                        <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-1">{item.product?.name || "Unknown Product"}</h4>
                      <p className="text-xs text-slate-500 mb-3">{item.product?.code || "No Code"}</p>
                      <div className="space-y-2 pt-3 border-t border-slate-100">
                        {item.batchNumber && (
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Batch:</span>
                            <span className="text-xs font-medium text-slate-700">{item.batchNumber}</span>
                          </div>
                        )}
                        {item.expiryDate && (
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Expiry:</span>
                            <span className={`text-xs font-medium ${new Date(item.expiryDate) < new Date() ? "text-rose-600" : "text-slate-700"}`}>
                              {new Date(item.expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-8">
                  <Package size={32} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">No items in this distribution</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DistributionDetail;
