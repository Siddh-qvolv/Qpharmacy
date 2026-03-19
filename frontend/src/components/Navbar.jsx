import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { PERMISSIONS, canAccess } from '../utils/roles';
            import logo from "../assets/logo.png"; // adjust path if needed

import { LayoutDashboard, PackageSearch, ShoppingBag, Truck, Users, LogOut, ChevronDown, Menu as MenuIcon, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { isAuthenticated, setAuth, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuth({
        token: null,
        isAuthenticated: false,
        user: null
      });
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
      navigate('/');
    }
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const NavLink = ({ to, icon: Icon, children, onClick }) => (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
        isActive(to) 
          ? 'bg-emerald-50 text-emerald-700' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'
      }`}
    >
      <Icon className={`w-4 h-4 mr-2 ${isActive(to) ? 'text-emerald-600' : 'text-slate-400'}`} />
      {children}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] w-full">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16">
        
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-emerald-100 p-1.5 rounded-lg group-hover:bg-emerald-200 transition-all duration-300 shadow-sm">
              <img 
                src={logo} 
                alt="logo" 
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
              />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 truncate max-w-[140px] xs:max-w-none">
              Army Dental Corps
            </span>
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-emerald-600 transition-colors focus:outline-none"
          >
            {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
        
        {/* Desktop menu */}
        <div className="hidden md:flex flex-1 items-center justify-between ml-8">
          <div className="flex space-x-1">
            {isAuthenticated && (
              <>
                <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                
                {canAccess(user?.role, 'CAN_VIEW_INVENTORY') && (
                  <NavLink to="/inventory" icon={PackageSearch}>Inventory</NavLink>
                )}
                
                {canAccess(user?.role, 'CAN_VIEW_PROCUREMENT') && (
                  <NavLink to="/procurement/purchase-orders" icon={ShoppingBag}>Procurement</NavLink>
                )}
                
                {canAccess(user?.role, 'CAN_VIEW_DISTRIBUTION') && (
                  <NavLink to="/distributions" icon={Truck}>Distribution</NavLink>
                )}
              </>
            )}
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="relative ml-4" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all focus:outline-none"
                >
                  <div className="flex flex-col items-end mr-1 hidden lg:flex">
                    <span className="text-sm font-semibold text-slate-700 leading-tight">
                      {user?.name || "User"}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {user?.role || "USER"}
                    </span>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 shadow-sm text-emerald-700 font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl py-2 z-50 border border-slate-100 transform opacity-100 scale-100 transition-all origin-top-right">
                    <div className="px-5 py-3 border-b border-slate-50 mb-1">
                      <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <div className="mt-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          user?.role === 'admin' 
                            ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {user?.role || 'USER'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="px-2">
                      {user?.role === 'admin' && (
                        <Link
                          to="/user-management"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center px-3 py-2.5 text-sm text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                        >
                          <Users className="w-4 h-4 mr-3 text-slate-400 group-hover:text-emerald-500" />
                          User Management
                        </Link>
                      )}
                      
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors mt-1"
                      >
                        <LogOut className="w-4 h-4 mr-3 text-rose-400" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-3">
                <Link to="/" className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl shadow-sm hover:bg-emerald-700 hover:shadow transition-all">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 right-0 h-full w-[280px] bg-white shadow-2xl z-[70] overflow-y-auto flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                   <img src={logo} alt="logo" className="w-5 h-5" />
                   Menu
                </span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-200/50 text-slate-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {isAuthenticated ? (
                <div className="flex flex-col flex-1 p-4 space-y-1">
                  {/* User Profile Card in Drawer */}
                  <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-emerald-200 shadow-sm text-emerald-700 font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                        <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-widest">{user?.role}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Main Menu</p>
                  <NavLink to="/dashboard" icon={LayoutDashboard} onClick={() => setIsMenuOpen(false)}>Dashboard</NavLink>
                  
                  {canAccess(user?.role, 'CAN_VIEW_INVENTORY') && (
                    <NavLink to="/inventory" icon={PackageSearch} onClick={() => setIsMenuOpen(false)}>Inventory</NavLink>
                  )}
                  
                  {canAccess(user?.role, 'CAN_VIEW_PROCUREMENT') && (
                    <NavLink to="/procurement/purchase-orders" icon={ShoppingBag} onClick={() => setIsMenuOpen(false)}>Procurement</NavLink>
                  )}
                  
                  {canAccess(user?.role, 'CAN_VIEW_DISTRIBUTION') && (
                    <NavLink to="/distributions" icon={Truck} onClick={() => setIsMenuOpen(false)}>Distribution</NavLink>
                  )}

                  <div className="mt-8 pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Settings</p>
                    {user?.role === 'admin' && (
                      <NavLink to="/user-management" icon={Users} onClick={() => setIsMenuOpen(false)}>User Management</NavLink>
                    )}
                    
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors mt-2"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 flex flex-col gap-3">
                   <Link 
                    to="/" 
                    className="flex items-center justify-center px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link 
                    to="/register" 
                    className="flex items-center justify-center px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}

              <div className="mt-auto p-6 text-center">
                 <p className="text-[10px] text-slate-400 font-medium">© 2026 Army Dental Corps</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
