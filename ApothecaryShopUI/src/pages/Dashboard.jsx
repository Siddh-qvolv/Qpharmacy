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
  const [recentPurchaseOrders, setRecentPurchaseOrders] = useState([]);

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
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <PackageSearch size={64} />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <PackageSearch size={20} />
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Total Products</h3>
            <p className="text-3xl font-bold text-slate-800">{stats.totalProducts}</p>
          </motion.div>

          {/* Low Stock */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <AlertTriangle size={64} />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                <AlertTriangle size={20} />
              </div>
              {stats.lowStockProducts > 0 && (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              )}
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Low Stock</h3>
            <p className="text-3xl font-bold text-slate-800">{stats.lowStockProducts}</p>
          </motion.div>

          {/* Expiring Soon */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Clock size={64} />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                <Clock size={20} />
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Expiring Soon</h3>
            <p className="text-3xl font-bold text-slate-800">{stats.expiringProducts}</p>
          </motion.div>

          {/* Expired */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <XCircle size={64} />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                <XCircle size={20} />
              </div>
              {stats.expiredProducts > 0 && (
                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800">
                   Action Needed
                 </span>
              )}
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Expired</h3>
            <p className="text-3xl font-bold text-slate-800">{stats.expiredProducts}</p>
          </motion.div>

          {/* Total Value */}
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-sm p-6 relative overflow-hidden text-white group hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={64} />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                <IndianRupee size={20} />
              </div>
            </div>
            <h3 className="text-emerald-50 text-sm font-medium mb-1">Total Value</h3>
            <p className="text-3xl font-bold">₹{addAbbreviation(stats.totalValue)}</p>
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
                <p className="text-sm text-slate-500">Latest additions to your inventory</p>
              </div>
            </div>
            
            <div className="p-0 flex-1 overflow-x-auto">
              {recentProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <PackageSearch size={32} />
                  </div>
                  <p className="text-slate-600 font-medium">No products found</p>
                  <p className="text-slate-400 text-sm mt-1">Start by adding your first product to the inventory.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer">Added On</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-50">
                    {recentProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-medium mr-3">
                              {product.name ? product.name.substring(0, 1).toUpperCase() : "N"}
                            </div>
                            <div className="text-sm font-medium text-slate-900 group-hover:text-emerald-600 transition-colors">
                              {product.name || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.stockQuantity <= product.reorderLevel 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {product.stockQuantity} {product.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          ₹{product.unitPrice?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(product.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 transition-colors hover:bg-blue-50">
                  <p className="text-sm font-medium text-blue-600/80 mb-1">Open Orders</p>
                  <p className="text-3xl font-bold text-blue-700">{purchaseOrderStats.openOrders || 0}</p>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 transition-colors hover:bg-emerald-50">
                  <p className="text-sm font-medium text-emerald-600/80 mb-1">Orders This Month</p>
                  <p className="text-3xl font-bold text-emerald-700">{purchaseOrderStats.thisMonth || 0}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Recent Orders</h3>
                  <Link
                    to="/procurement/purchase-orders"
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    View All
                  </Link>
                </div>
                
                {recentPurchaseOrders.length > 0 ? (
                  <div className="space-y-3">
                    {recentPurchaseOrders.map((order) => (
                      <Link
                        key={order._id}
                        to={`/procurement/purchase-orders/${order._id}`}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all bg-white"
                      >
                        <div className="flex flex-col mb-2 sm:mb-0">
                          <span className="font-semibold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">{order.poNumber}</span>
                          <span className="text-xs text-slate-500 mt-0.5 max-w-[180px] truncate">
                            {order.supplier?.name || "No supplier"}
                          </span>
                        </div>
                        <span className={`text-[11px] px-2.5 py-1 rounded-md border font-medium whitespace-nowrap ${getStatusBadgeClass(order.status)} shrink-0`}>
                          {order.status.replace("_", " ").toUpperCase()}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                    <ShoppingCart className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-500 text-sm font-medium">No recent purchase orders</p>
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
