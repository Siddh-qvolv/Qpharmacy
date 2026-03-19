import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";
// import DashboardAiAnalysis from "../components/DashboardAiAnalysis";
import { addAbbreviation } from "../../utils/util.js";
import AppLoader from "../components/AppLoader.jsx";
import { motion } from "framer-motion";
import {
  PackageSearch,
  AlertTriangle,
  Clock,
  XCircle,
  IndianRupee,
  LayoutDashboard,
  TrendingUp,
  ShoppingCart,
  ArrowRight,
  ShoppingBag,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
 
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    expiringProducts: 0,
    expiredProducts: 0,
    totalValue: 0,
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Add state for procurement data
  const [purchaseOrderStats, setPurchaseOrderStats] = useState({
    openOrders: 0,
    thisMonth: 0,
  });
  const navigate = useNavigate();
  const [recentPurchaseOrders, setRecentPurchaseOrders] = useState([]);
  const cardStyles = {
    totalProducts: "from-blue-500 to-indigo-600",
    lowStock: "from-amber-500 to-orange-600",
    expiring: "from-orange-500 to-red-500",
    expired: "from-rose-500 to-pink-600",
    totalValue: "from-emerald-500 to-teal-600",
  };
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_API_URL;
 
        const productsRes = await axios.get(`${apiUrl}/products`, {
          headers: { Authorization: `${token}` },
        });
 
        // Ensure products is always an array
        const products = Array.isArray(productsRes.data.data)
          ? productsRes.data.data
          : [];
 
        // Stats
        const lowStockCount = products.filter(
          (p) => p.stockQuantity <= p.reorderLevel
        ).length;
 
        const today = new Date();
        const ninetyDaysFromNow = new Date();
        ninetyDaysFromNow.setDate(today.getDate() + 90);
 
        const expiringCount = products.filter((p) => {
          const expiryDate = new Date(p.expiryDate);
          return expiryDate <= ninetyDaysFromNow && expiryDate >= today;
        }).length;
 
        const expiredCount = products.filter(
          (p) => new Date(p.expiryDate) < today
        ).length;
 
        const totalValue = products.reduce(
          (sum, p) => sum + (p.stockQuantity * p.unitPrice || 0),
          0
        );
 
        setStats({
          totalProducts: products.length,
          lowStockProducts: lowStockCount,
          expiringProducts: expiringCount,
          expiredProducts: expiredCount,
          totalValue,
        });
 
        const recent = [...products]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
 
        setRecentProducts(recent);
 
        // Procurement data logic (optional chaining already handles missing fields)
        try {
          const ordersRes = await axios.get(`${apiUrl}/purchase-orders`, {
            headers: { Authorization: `${token}` },
          });
 
          const orders = Array.isArray(ordersRes.data)
            ? ordersRes.data
            : ordersRes.data.purchaseOrders || [];
 
          const openOrders = orders.filter(
            (o) => !["received", "cancelled"].includes(o.status)
          ).length;
 
          const thisMonth = orders.filter((o) => {
            const orderDate = new Date(o.orderDate);
            return (
              orderDate.getMonth() === today.getMonth() &&
              orderDate.getFullYear() === today.getFullYear()
            );
          }).length;
 
          setPurchaseOrderStats({ openOrders, thisMonth });
 
          const recentOrders = [...orders]
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .slice(0, 5);
 
          setRecentPurchaseOrders(recentOrders);
        } catch (err) {
          console.error("Error fetching procurement data:", err);
        }
 
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setLoading(false);
      }
    };
 
    fetchData();
  }, []);
 
  // Helper function for order status badge colors
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "draft":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "submitted":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "approved":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "shipped":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "received":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "partially_received":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };
 
  if (loading) return <AppLoader message="Loading your dashboard" />;
 
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
 
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };
 
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 xl:ml-20 font-sans pb-12">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
 
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <LayoutDashboard size={24} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Overview</h1>
            </div>
            <p className="text-slate-500 pl-11">Welcome back, <span className="font-medium text-slate-700">{user?.name || "User"}</span></p>
          </div>
 
          <div className="flex items-center gap-3">
            <Link
              to="/inventory"
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-xl text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-emerald-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <PackageSearch className="w-4 h-4 mr-2" />
              Manage Inventory
            </Link>
            <Link
              to="/stock-movements"
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-xl text-white bg-emerald-600 shadow-sm hover:bg-emerald-700 hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <Activity className="w-4 h-4 mr-2" />
              Stock Movements
            </Link>
          </div>
        </motion.div>
 
 
 
        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
 
          {/* Total Products */}
          <motion.div
            variants={itemVariants}
            onClick={() => navigate("/inventory?filter=all")}
            className="cursor-pointer bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-sm p-6 relative overflow-hidden text-white group hover:shadow-md hover:scale-[1.02] transition-all"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <PackageSearch size={64} />
            </div>
 
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <PackageSearch size={20} />
              </div>
            </div>
 
            <h3 className="text-white/80 text-sm font-medium mb-1">
              Total Products
            </h3>
            <p className="text-3xl font-bold">{stats.totalProducts}</p>
          </motion.div>
 
          {/* Low Stock */}
          <motion.div
            variants={itemVariants}
            onClick={() => navigate("/inventory?filter=low-stock")}
            className="cursor-pointer bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-sm p-6 relative overflow-hidden text-white group hover:shadow-md hover:scale-[1.02] transition-all"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <AlertTriangle size={64} />
            </div>
 
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <AlertTriangle size={20} />
              </div>
 
              {stats.lowStockProducts > 0 && (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
              )}
            </div>
 
            <h3 className="text-white/80 text-sm font-medium mb-1">
              Low Stock
            </h3>
            <p className="text-3xl font-bold">{stats.lowStockProducts}</p>
          </motion.div>
 
          {/* Expiring Soon */}
          <motion.div
            variants={itemVariants}
            onClick={() => navigate("/inventory?filter=expiring-soon")}
            className="cursor-pointer bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-sm p-6 relative overflow-hidden text-white group hover:shadow-md hover:scale-[1.02] transition-all"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock size={64} />
            </div>
 
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Clock size={20} />
              </div>
            </div>
 
            <h3 className="text-white/80 text-sm font-medium mb-1">
              Expiring Soon
            </h3>
            <p className="text-3xl font-bold">{stats.expiringProducts}</p>
          </motion.div>
 
          {/* Expired */}
          <motion.div
            variants={itemVariants}
            onClick={() => navigate("/inventory?filter=expired")}
            className="cursor-pointer bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-sm p-6 relative overflow-hidden text-white group hover:shadow-md hover:scale-[1.02] transition-all"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <XCircle size={64} />
            </div>
 
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <XCircle size={20} />
              </div>
 
              {/* {stats.expiredProducts > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                  Action Needed
                </span>
              )} */}
            </div>
 
            <h3 className="text-white/80 text-sm font-medium mb-1">
              Expired
            </h3>
            <p className="text-3xl font-bold">{stats.expiredProducts}</p>
          </motion.div>
 
          {/* Total Value (Already Perfect) */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-sm p-6 relative overflow-hidden text-white group hover:shadow-md hover:scale-[1.02] transition-all sm:col-span-2 lg:col-span-1"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={64} />
            </div>
 
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <IndianRupee size={20} />
              </div>
            </div>
 
            <h3 className="text-white/80 text-sm font-medium mb-1">
              Total Value
            </h3>
            <p className="text-3xl font-bold">
              ₹{addAbbreviation(stats.totalValue)}
            </p>
          </motion.div>
 
        </motion.div>
 
 
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
          {/* Recently Added Products List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col"
          >
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Recently Added Products</h3>
                <p className="text-sm text-slate-500">Latest 5 additions to your inventory</p>
              </div>
            </div>
 
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {recentProducts.map((product) => (
                <motion.div
                  key={product._id}
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200 hover:border-emerald-300 p-4 transition-all duration-200 group cursor-pointer hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold text-sm">
                        {product.name ? product.name.substring(0, 1).toUpperCase() : "N"}
                      </div>
 
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate group-hover:text-emerald-600 transition-colors">
                          {product.name || "N/A"}
                        </p>
 
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
 
                  {/* Bottom Section */}
                  <div className="flex items-center justify-between mt-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stockQuantity <= product.reorderLevel
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                        }`}
                    >
                      {product.stockQuantity} {product.unit}
                    </span>
 
                    <span className="text-sm font-medium text-slate-700">
                      ₹{product.unitPrice?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
 
 
            {recentProducts.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <Link to="/inventory" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center group w-fit">
                  View all products
                  <ArrowRight size={14} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </div>
            )}
          </motion.div>
 
          {/* Procurement Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-emerald-600 w-5 h-5" />
                <h2 className="text-lg font-semibold text-slate-800">Procurement</h2>
              </div>
            </div>
 
            <div className="p-6 flex flex-col flex-1">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl border border-blue-100 p-4 hover:border-blue-200 transition-all">
                  <p className="text-xs font-medium text-blue-600 mb-2 uppercase tracking-wider">Open Orders</p>
                  <p className="text-3xl font-bold text-blue-700">{purchaseOrderStats.openOrders || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-xl border border-emerald-100 p-4 hover:border-emerald-200 transition-all">
                  <p className="text-xs font-medium text-emerald-600 mb-2 uppercase tracking-wider">This Month</p>
                  <p className="text-3xl font-bold text-emerald-700">{purchaseOrderStats.thisMonth || 0}</p>
                </div>
              </div>
 
              {/* Recent Orders */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Recent Orders</h3>
                  <Link
                    to="/procurement/purchase-orders"
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors hover:underline"
                  >
                    View All
                  </Link>
                </div>
 
                {recentPurchaseOrders.length > 0 ? (
                  <div className="space-y-2">
                    {recentPurchaseOrders.slice(0, 4).map((order) => (
                      <Link
                        key={order._id}
                        to={`/procurement/purchase-orders/${order._id}`}
                        className="group flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all bg-slate-50/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors truncate">
                            {order.poNumber}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {order.supplier?.name || "No supplier"}
                          </p>
                        </div>
                        <span className={`text-[11px] px-2 py-1 rounded-md border font-semibold whitespace-nowrap ml-2 shrink-0 ${getStatusBadgeClass(order.status)}`}>
                          {order.status.replace("_", " ").toUpperCase()}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                    <ShoppingCart className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-slate-500 text-sm font-medium">No recent orders</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
 
        </div>
      </div>
    </div>
  );
};
 
export default Dashboard;