import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDistributions, deleteDistribution, exportDistributionsCSV, exportDistributionsPDF } from '../../services/distributionService';
import { motion } from 'framer-motion';
import { 
  Truck, 
  FileDown, 
  FileText, 
  Plus, 
  Search, 
  Calendar, 
  Filter, 
  Eye, 
  Trash2,
  PackageCheck
} from 'lucide-react';

const DistributionList = () => {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    recipient: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchDistributions();
  }, []);

  const fetchDistributions = async () => {
    setLoading(true);
    try {
      const data = await getDistributions(filters);
      setDistributions(data);
    } catch (error) {
      console.error('Error fetching distributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchDistributions();
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      recipient: '',
      startDate: '',
      endDate: ''
    });
    setTimeout(fetchDistributions, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this distribution order? This action cannot be undone.')) {
      try {
        await deleteDistribution(id);
        setDistributions(prevDistributions => 
          prevDistributions.filter(dist => dist._id !== id)
        );
      } catch (error) {
        console.error('Error deleting distribution:', error);
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportDistributionsCSV(filters);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportDistributionsPDF(filters);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badgeMap = {
      'pending': { colors: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending' },
      'processed': { colors: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Processed' },
      'shipped': { colors: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Shipped' },
      'delivered': { colors: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Delivered' },
      'returned': { colors: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Returned' },
      'cancelled': { colors: 'bg-slate-50 text-slate-700 border-slate-200', label: 'Cancelled' }
    };
    
    const config = badgeMap[status] || { colors: 'bg-slate-50 text-slate-700 border-slate-200', label: status };
    
    return (
      <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-md border ${config.colors} uppercase tracking-wider`}>
        {config.label}
      </span>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 xl:ml-20 font-sans pb-12 pt-8">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shadow-sm">
                <Truck size={24} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Distribution Orders</h1>
            </div>
            <p className="text-slate-500 pl-11">Manage outbound logistics and deliveries</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-xl text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-emerald-600 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-xl text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-rose-600 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </button>
            <Link to="/distributions/new">
              <button className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-xl text-white bg-emerald-600 shadow-sm hover:bg-emerald-700 hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                <Plus className="w-4 h-4 mr-2" />
                New Distribution
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Filters and Search Workspace */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-8"
        >
          <form onSubmit={applyFilters} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Filter size={16} />
                  </div>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:bg-slate-100 cursor-pointer appearance-none transition-colors"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processed">Processed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="returned">Returned</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Recipient
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    name="recipient"
                    value={filters.recipient}
                    onChange={handleFilterChange}
                    placeholder="Search by name..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Start Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar size={16} />
                  </div>
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  End Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar size={16} />
                  </div>
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors text-slate-700"
                  />
                </div>
              </div>
              
            </div>
            
            <div className="flex justify-end pt-2 border-t border-slate-100 mt-4 gap-3">
              <button 
                type="button" 
                onClick={clearFilters}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors"
              >
                Clear Filters
              </button>
              <button 
                type="submit"
                className="px-6 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-900 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-600"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </motion.div>

        {/* Table Content */}
        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col justify-center items-center">
            <div className="w-12 h-12 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
            Loading distribution orders...
          </div>
        ) : distributions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center flex flex-col items-center justify-center min-h-[300px]"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <PackageCheck size={40} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">No distribution orders found</h3>
            <p className="text-slate-500 max-w-sm">
              We couldn't find any distribution records matching your current criteria.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {distributions.map((dist) => (
                <motion.div
                  key={dist._id}
                  variants={itemVariants}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <Truck size={18} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900 truncate">Order #{dist.orderNumber}</h3>
                          <p className="text-xs text-slate-500 truncate">{dist.recipient}</p>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          <span>
                            {new Date(dist.createdAt).toLocaleDateString(undefined, {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          {dist.items.length} items • {dist.recipientType}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      {getStatusBadge(dist.status)}
                      <div className="flex gap-2">
                        <Link
                          to={`/distributions/${dist._id}`}
                          className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          View
                        </Link>
                        {dist.status === 'pending' && (
                          <button 
                            onClick={() => handleDelete(dist._id)}
                            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {distributions.length > 0 && (
              <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">
                  Showing <span className="text-slate-700 font-bold">{distributions.length}</span> distribution records
                </span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DistributionList;