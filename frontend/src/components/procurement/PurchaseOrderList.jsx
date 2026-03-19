import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  getPurchaseOrders,
  updatePurchaseOrderStatus,
} from "../../services/purchaseOrderService";
import { getCurrentUser } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext.jsx";
import AppLoader from "../AppLoader.jsx";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit2, 
  CheckCircle, 
  Package, 
  PackageCheck,
  XCircle,
  Truck,
  ArrowRight
} from "lucide-react";

function PurchaseOrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const [userRole, setUserRole] = useState("");

  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchOrders();
    fetchUserRole();
  }, []);

  // Fetch user role from AuthContext or authService
  const fetchUserRole = () => {
    // First try to get from context
    if (user && user.role) {
      setUserRole(user.role);
    } else {
      // Fallback to authService if not available in context
      const user = getCurrentUser();
      if (user && user.role) {
        setUserRole(user.role);
      }
    }
  };

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getPurchaseOrders();
      // Ensure orders is always an array
      setOrders(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError("Failed to load purchase orders");
      console.error(err);
      setOrders([]); // Set orders to empty array in case of error
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updatePurchaseOrderStatus(orderId, newStatus);
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      showToast(
        `Order status updated to ${newStatus.replace("_", " ")}`,
        "success"
      );
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update order status";
      setError(errorMessage);
      showToast(errorMessage);
      console.error(err);
    }
  };

  // Ensure filteredOrders is always an array
  const filteredOrders = Array.isArray(orders)
    ? filter === "all"
      ? orders
      : orders.filter((order) => order.status === filter)
    : [];

  const getStatusBadgeConfig = (status) => {
    switch (status) {
      case "draft":
        return { color: "bg-slate-100 text-slate-700 border-slate-200", icon: null };
      case "submitted":
        return { color: "bg-blue-50 text-blue-700 border-blue-200", icon: <ArrowRight className="w-3 h-3 mr-1" /> };
      case "approved":
        return { color: "bg-purple-50 text-purple-700 border-purple-200", icon: <CheckCircle className="w-3 h-3 mr-1" /> };
      case "shipped":
        return { color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: <Truck className="w-3 h-3 mr-1" /> };
      case "received":
        return { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <PackageCheck className="w-3 h-3 mr-1" /> };
      case "partially_received":
        return { color: "bg-amber-50 text-amber-700 border-amber-200", icon: <Package className="w-3 h-3 mr-1" /> };
      case "cancelled":
        return { color: "bg-rose-50 text-rose-700 border-rose-200", icon: <XCircle className="w-3 h-3 mr-1" /> };
      default:
        return { color: "bg-slate-100 text-slate-700 border-slate-200", icon: null };
    }
  };

  const statusFilters = [
    { id: "all", label: "All Orders" },
    { id: "draft", label: "Draft" },
    { id: "submitted", label: "Submitted" },
    { id: "approved", label: "Approved" },
    { id: "shipped", label: "Shipped" },
    { id: "received", label: "Received" }
  ];

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

  if (loading) return <div className="py-12 flex justify-center"><div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      {/* Toast Notification */}
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3
            ${toast.type === "error" ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}
        >
          {toast.type === "error" ? <XCircle className="w-5 h-5 text-rose-500" /> : <CheckCircle className="w-5 h-5 text-emerald-500" />}
          <span className="font-medium text-sm">{toast.message}</span>
          <button onClick={() => setToast({ ...toast, show: false })} className="ml-2 text-current opacity-60 hover:opacity-100">
            &times;
          </button>
        </motion.div>
      )}

      {error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-4 rounded-xl flex items-center mb-6">
          <XCircle className="w-5 h-5 mr-3" />
          <span className="font-medium">{error}</span>
        </div>
      ) : null}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-slate-800">Order Directory</h2>
        <Link
          to="/procurement/purchase-orders/new"
          className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-xl text-white bg-emerald-600 shadow-sm hover:bg-emerald-700 hover:shadow transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Order
        </Link>
      </div>

      {/* Modern Filter Pills */}
      <div className="mb-6 flex overflow-x-auto hide-scrollbar pb-2">
        <div className="flex space-x-2">
          {statusFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 text-sm font-semibold whitespace-nowrap rounded-full transition-all duration-200 ${
                filter === f.id
                  ? "bg-slate-800 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {f.label}
              {filter === "all" && f.id !== "all" ? (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === f.id ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-500"}`}>
                  {orders.filter(o => o.status === f.id).length}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Container */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredOrders.length === 0 ? (
          <div className="col-span-full p-16 text-center text-slate-500 flex flex-col justify-center items-center bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <PackageCheck size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">No orders found</h3>
            <p className="text-slate-500">There are no purchase orders matching your current filter.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const badgeConf = getStatusBadgeConfig(order.status);
            return (
              <motion.div 
                variants={itemVariants}
                key={order._id} 
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all duration-200 group"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                      {order.poNumber}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${badgeConf.color} uppercase tracking-wider`}>
                    {badgeConf.icon}
                    {order.status.replace("_", " ")}
                  </span>
                </div>

                {/* Supplier */}
                <div className="mb-3">
                  <div className="text-sm font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
                    {order.supplier?.name || "Unknown Supplier"}
                  </div>
                </div>

                {/* Date and Amount */}
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-slate-500 font-medium">
                    {format(new Date(order.orderDate), "MMM dd, yyyy")}
                  </div>
                  <div className="text-lg font-bold text-slate-700">
                    ₹{order.totalAmount.toFixed(2)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                  <Link
                    to={`/procurement/purchase-orders/${order._id}`}
                    className="flex-1 min-w-0 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Eye size={16} className="mr-1" />
                    View
                  </Link>

                  {order.status === "draft" && (
                    <>
                      <Link
                        to={`/procurement/purchase-orders/${order._id}/edit`}
                        className="flex-1 min-w-0 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} className="mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleStatusChange(order._id, "submitted")}
                        className="flex-1 min-w-0 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                      >
                        Submit
                      </button>
                    </>
                  )}

                  {order.status === "submitted" && userRole === "admin" && (
                    <button
                      onClick={() => handleStatusChange(order._id, "approved")}
                      className="flex-1 min-w-0 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Approve
                    </button>
                  )}

                  {order.status === "approved" && (
                    <button
                      onClick={() => handleStatusChange(order._id, "shipped")}
                      className="flex-1 min-w-0 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <Truck size={16} className="mr-1" />
                      Ship
                    </button>
                  )}

                  {order.status === "shipped" && (
                    <Link
                      to={`/procurement/receive/${order._id}`}
                      className="flex-1 min-w-0 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                    >
                      <PackageCheck size={16} className="mr-1" />
                      Receive
                    </Link>
                  )}

                  {(order.status === "draft" || order.status === "submitted") && (
                    <button
                      onClick={() => handleStatusChange(order._id, "cancelled")}
                      className="flex-1 min-w-0 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                    >
                      <XCircle size={16} className="mr-1" />
                      Cancel
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </motion.div>
  );
}

export default PurchaseOrderList;
