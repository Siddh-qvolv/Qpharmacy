import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
// import MaomaoVision from "../components/MaomaoVision";
import AppLoader from "../components/AppLoader";
import { motion } from "framer-motion";
import {
  Search,
  X,
  Plus,
  PackageSearch,
  AlertTriangle,
  Clock,
  XCircle,
  Filter,
  Edit2,
  Package
} from "lucide-react";
import { useLocation } from "react-router-dom";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const location = useLocation();

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await axios.get(`${apiUrl}/products`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      setProducts(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchProducts();
}, [location.pathname]);


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filter = params.get("filter");

    if (filter) {
      setFilterStatus(filter);
    }
  }, [location.search]);


  // Filter products based on search term and status
  // const filteredProducts = products.filter((product) => {
  //   const matchesSearch =
  //     (product.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
  //     (product.sku?.toLowerCase() || "").includes(searchTerm.toLowerCase());

  //   if (filterStatus === "all") return matchesSearch;
  //   if (filterStatus === "low-stock")
  //     return matchesSearch && product.stockQuantity <= product.reorderLevel;
  //   if (filterStatus === "in-stock")
  //     return matchesSearch && product.stockQuantity > product.reorderLevel;

  //   const today = new Date();
  //   const expiryDate = product.expiryDate ? new Date(product.expiryDate) : null;

  //   if (filterStatus === "expiring-soon") {
  //     const ninetyDaysFromNow = new Date();
  //     ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
  //     return (
  //       matchesSearch &&
  //       expiryDate &&
  //       expiryDate <= ninetyDaysFromNow &&
  //       expiryDate >= today
  //     );
  //   }
  //   if (filterStatus === "expired")
  //     return matchesSearch && expiryDate && expiryDate < today;

  //   return matchesSearch;
  // });

  const filteredProducts = products
  .filter((product) => {
    const matchesSearch =
      (product.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (product.sku?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "low-stock")
      return matchesSearch && product.stockQuantity <= product.reorderLevel;
    if (filterStatus === "in-stock")
      return matchesSearch && product.stockQuantity > product.reorderLevel;

    const today = new Date();
    const expiryDate = product.expiryDate ? new Date(product.expiryDate) : null;

    if (filterStatus === "expiring-soon") {
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
      return (
        matchesSearch &&
        expiryDate &&
        expiryDate <= ninetyDaysFromNow &&
        expiryDate >= today
      );
    }

    if (filterStatus === "expired")
      return matchesSearch && expiryDate && expiryDate < today;

    return matchesSearch;
  })
  .sort((a, b) => {
    const dateA = a.expiryDate ? new Date(a.expiryDate) : new Date(9999, 0, 1);
    const dateB = b.expiryDate ? new Date(b.expiryDate) : new Date(9999, 0, 1);

    return dateA - dateB; // 🔥 nearest expiry first
  });


  // Handle product found via image search
  const handleProductFound = (productName) => {
    // Set the search term directly with the product name
    setSearchTerm(productName);

    // Show a notification
    setSnackbar({
      open: true,
      message: `Searching for: ${productName}`,
      severity: "info",
    });

    // Auto-hide the snackbar after 5 seconds
    setTimeout(() => {
      setSnackbar((prev) => ({ ...prev, open: false }));
    }, 5000);
  };

  if (loading) return <AppLoader message="Loading your inventory" />;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 font-sans pb-12 transition-all duration-300">
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
                <PackageSearch size={24} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inventory Directory</h1>
            </div>
            <p className="text-slate-500 pl-11">Manage and track your medical supplies</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              to="/products/new"
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-xl text-white bg-emerald-600 shadow-sm hover:bg-emerald-700 hover:shadow transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between"
        >
          <div className="relative w-full lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="w-full lg:w-auto flex items-center relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Filter size={16} />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full lg:w-auto pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:bg-slate-50 cursor-pointer appearance-none shadow-sm transition-colors"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
            >
              <option value="all">All Products</option>
              <option value="low-stock">Low Stock</option>
              <option value="in-stock">In Stock</option>
              <option value="expiring-soon">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </motion.div>

        {/* Snackbar notification */}
        {snackbar.open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl shadow-sm border flex justify-between items-center ${snackbar.severity === "info"
                ? "bg-blue-50 border-blue-100 text-blue-700"
                : snackbar.severity === "success"
                  ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                  : snackbar.severity === "error"
                    ? "bg-rose-50 border-rose-100 text-rose-700"
                    : "bg-amber-50 border-amber-100 text-amber-700"
              }`}
          >
            <span className="font-medium text-sm">{snackbar.message}</span>
            <button
              onClick={() => setSnackbar((prev) => ({ ...prev, open: false }))}
              className="text-current opacity-70 hover:opacity-100 p-1"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}

        {/* Product Cards */}
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center flex flex-col items-center justify-center min-h-[400px]"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <Package size={40} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">No products found</h3>
            <p className="text-slate-500 max-w-sm">
              {searchTerm
                ? `We couldn't find any products matching "${searchTerm}" with the current filters.`
                : "Your inventory list is currently empty. Start tracking your items by adding a new product."}
            </p>
            {!searchTerm && (
              <Link
                to="/products/new"
                className="mt-6 inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Add Your First Product
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          >
            {filteredProducts.map((product) => {
              const today = new Date();
              const expiryDate = product.expiryDate ? new Date(product.expiryDate) : new Date();
              const isExpired = expiryDate < today;
              const expirySoonThreshold = new Date();
              expirySoonThreshold.setDate(expirySoonThreshold.getDate() + 90);
              const isExpiringSoon = !isExpired && expiryDate <= expirySoonThreshold;

              const stockLow = product.stockQuantity <= product.reorderLevel;

              return (
                <motion.div
                  variants={itemVariants}
                  key={product._id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                          {product.name ? product.name.charAt(0).toUpperCase() : "N"}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-slate-900 truncate">{product.name}</h3>
                          <p className="text-xs text-slate-500 truncate">{product.sku}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-slate-500 truncate">
                        {product.category || "Uncategorized"}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          stockLow
                            ? "bg-rose-50 text-rose-700 border border-rose-100"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        }`}
                      >
                        {stockLow ? "Low Stock" : "In Stock"}
                      </span>
                      <Link
                        to={`/products/${product._id}/edit`}
                        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                        title="Edit Product"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</p>
                      <p className={`${stockLow ? "text-rose-600" : "text-slate-800"} font-semibold`}>{product.stockQuantity}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</p>
                      <p className="font-semibold">₹{Number(product.unitPrice || 0).toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiry</p>
                      <div className="flex items-center gap-1">
                        {isExpired ? (
                          <XCircle size={14} className="text-rose-500" />
                        ) : isExpiringSoon ? (
                          <Clock size={14} className="text-amber-500" />
                        ) : null}
                        <p className={`${isExpired ? "text-rose-600" : isExpiringSoon ? "text-amber-600" : "text-slate-500"} font-semibold`}>
                          {expiryDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</p>
                      <p className="text-slate-700 font-semibold">{stockLow ? "Action required" : "Healthy"}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
