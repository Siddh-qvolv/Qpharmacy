import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDistributionReports, exportDistributionsCSV, exportDistributionsPDF } from '../../services/distributionService';

const DistributionDashboard = () => {
  const [reportData, setReportData] = useState({
    statusCounts: [],
    topRecipients: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getDistributionReports(filters);
      setReportData(data);
    } catch (err) {
      console.error('Error fetching distribution reports:', err);
      setError('Failed to load reports');
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
    fetchReports();
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: ''
    });
    setTimeout(fetchReports, 0);
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

  // Status color mapping
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-500',
      'processed': 'bg-blue-500',
      'shipped': 'bg-indigo-500',
      'delivered': 'bg-green-500',
      'returned': 'bg-red-500',
      'cancelled': 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-300';
  };

  // Format date range for display
  const getDateRangeText = () => {
    if (filters.startDate && filters.endDate) {
      return `${new Date(filters.startDate).toLocaleDateString()} to ${new Date(filters.endDate).toLocaleDateString()}`;
    } else if (filters.startDate) {
      return `From ${new Date(filters.startDate).toLocaleDateString()}`;
    } else if (filters.endDate) {
      return `Until ${new Date(filters.endDate).toLocaleDateString()}`;
    }
    return 'All Time';
  };

  // Calculate total count for percentage
  const getTotalStatusCount = () => {
    return reportData.statusCounts.reduce((sum, item) => sum + item.count, 0) || 1;
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100">
          <div className="px-6 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h4 className="text-xl font-bold text-slate-800">Distribution Analytics</h4>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-emerald-600 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                Export CSV
              </button>
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-rose-600 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                Export PDF
              </button>
              <Link to="/distributions">
                <button className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-white bg-emerald-600 shadow-sm hover:bg-emerald-700 hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                  View All Orders
                </button>
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            <form onSubmit={applyFilters} className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex gap-3 w-full">
                    <button 
                      type="submit"
                      className="flex-1 px-6 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-900 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-600"
                    >
                      Apply Filters
                    </button>
                    <button 
                      type="button" 
                      onClick={clearFilters}
                      className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {loading ? (
              <div className="flex flex-col justify-center items-center py-20 text-slate-400">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <span>Loading analytics data...</span>
              </div>
            ) : error ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                {error}
              </div>
            ) : (
              <>
                <div className="mb-10">
                  <h5 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    Status Summary
                    <span className="font-medium text-sm text-slate-400">({getDateRangeText()})</span>
                  </h5>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <div className="space-y-5">
                        {reportData.statusCounts.map((status) => {
                          const percentage = Math.round((status.count / getTotalStatusCount()) * 100);
                          return (
                            <div key={status._id} className="relative">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-slate-700 capitalize">{status._id}</span>
                                <span className="text-sm font-medium text-slate-500">{status.count} ({percentage}%)</span>
                              </div>
                              <div className="overflow-hidden h-3 flex rounded-full bg-slate-200 shadow-inner">
                                <div 
                                  style={{ width: `${percentage}%` }} 
                                  className={`rounded-full shadow-lg ${getStatusColor(status._id)} transition-all duration-500`}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {reportData.statusCounts.length === 0 && (
                          <div className="text-center py-10 text-slate-400 italic">
                            No distribution data available for selected range
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 xs:grid-cols-3 gap-4">
                      {['pending', 'processed', 'shipped', 'delivered', 'returned', 'cancelled'].map(status => {
                        const statusData = reportData.statusCounts.find(s => s._id === status) || { count: 0 };
                        return (
                          <div key={status} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <h6 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">{status}</h6>
                            <p className="text-2xl font-black text-slate-800">{statusData.count}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h5 className="text-lg font-bold text-slate-800 mb-4">Top Recipients</h5>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      {reportData.topRecipients.length > 0 ? (
                        <table className="min-w-full divide-y divide-slate-100">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Recipient</th>
                              <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Order Count</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {reportData.topRecipients.map((recipient, index) => (
                              <tr key={index} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-semibold text-slate-700">{recipient._id}</td>
                                <td className="px-6 py-4 text-right">
                                  <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">
                                    {recipient.count}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center py-12 text-slate-400 italic">
                          No recipient data available
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-lg font-bold text-slate-800 mb-4">Most Distributed Products</h5>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      {reportData.topProducts.length > 0 ? (
                        <table className="min-w-full divide-y divide-slate-100">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Product</th>
                              <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Total Qty</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {reportData.topProducts.map((product, index) => (
                              <tr key={index} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="font-semibold text-slate-700">{product.product?.name || 'Unknown Product'}</div>
                                  <div className="text-[10px] text-slate-400 font-medium">{product.product?.code || 'No Code'}</div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <span className="text-sm font-bold text-slate-800">{product.totalQuantity}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center py-12 text-slate-400 italic">
                          No product distribution data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionDashboard;