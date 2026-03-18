import React, { useContext } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { motion } from 'framer-motion';
import { ShoppingBag, Users, FileText, Receipt } from 'lucide-react';

function ProcurementLayout() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 xl:ml-20 font-sans pb-12 pt-8">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shadow-sm">
              <ShoppingBag size={24} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Procurement</h1>
          </div>
          <p className="text-slate-500 pl-11">Source, negotiate, and acquire medical supplies</p>
        </motion.div>
        
        {/* Navigation Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <div className="inline-flex p-1 space-x-1 bg-slate-100 rounded-xl">
            {isAdmin && (
              <NavLink 
                to="/procurement/suppliers" 
                className={({ isActive }) => 
                  `flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isActive 
                    ? 'bg-white text-emerald-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`
                }
              >
                <Users className="w-4 h-4 mr-2" />
                Suppliers
              </NavLink>
            )}
            <NavLink 
              to="/procurement/purchase-orders" 
              className={({ isActive }) => 
                `flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isActive 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`
              }
            >
              <FileText className="w-4 h-4 mr-2" />
              Purchase Orders
            </NavLink>
            <NavLink 
              to="/procurement/purchase-receipts" 
              className={({ isActive }) => 
                `flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isActive 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`
              }
            >
              <Receipt className="w-4 h-4 mr-2" />
              Receipts
            </NavLink>
          </div>
        </motion.div>
        
        {/* Sub-routing Outlet */}
        <Outlet />
        
      </div>
    </div>
  );
}

export default ProcurementLayout;