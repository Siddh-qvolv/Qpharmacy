import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { PERMISSIONS, canAccess } from '../utils/roles';
import { LayoutDashboard, PackageSearch, ShoppingBag, Truck, Users, LogOut, ChevronDown, Menu as MenuIcon, X } from 'lucide-react';

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

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link 
      to={to} 
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
        <div className="flex-shrink-0 flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-emerald-100 p-1.5 rounded-lg group-hover:bg-emerald-200 transition-colors">
              <span className="text-xl leading-none block">🌿</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">
              Qpharmacy
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

      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 shadow-lg px-4 pt-2 pb-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {isAuthenticated ? (
            <div className="flex flex-col space-y-1">
              {/* User Info Mobile */}
              <div className="px-4 py-4 mb-3 border-b border-slate-100 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                  <span className="text-emerald-700 font-bold text-lg">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-800">{user?.name}</p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
              </div>

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
              
              {user?.role === 'admin' && (
                <>
                  <div className="h-px bg-slate-100 my-2 mx-2"></div>
                  <NavLink to="/user-management" icon={Users}>User Management</NavLink>
                </>
              )}
              
              <div className="h-px bg-slate-100 my-2 mx-2"></div>
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 p-2">
              <Link 
                to="/" 
                className="block text-center px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Log in
              </Link>
              <Link 
                to="/register" 
                className="block text-center px-4 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
