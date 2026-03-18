import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAllUsers, createUser, updateUser, deleteUser, getUserStats } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import { ROLES, ROLE_LABELS, getRoleOptions } from '../utils/roles';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  ShieldCheck, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  Mail,
  Lock,
  UserCircle,
  Clock,
  Activity,
  UserPlus,
  AlertCircle
} from 'lucide-react';

const UserManagement = () => {
  const { user: contextUser, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const user = React.useMemo(() => {
    if (contextUser) return contextUser;
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }, [contextUser]);
  
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Pagination and filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.DISTRIBUTION_STAFF
  });

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate, authLoading]);

  // Fetch users and stats
  useEffect(() => {
    const fetchData = async () => {
      if (!authLoading && user?.role === 'admin') {
        fetchUsers();
        fetchStats();
      }
    };
    fetchData();
  }, [page, roleFilter, user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers({
        page,
        limit: 10,
        role: roleFilter,
        search: search
      });
      setUsers(response.data);
      setTotalPages(response.pagination.pages);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getUserStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: ROLES.DISTRIBUTION_STAFF
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateUser(editingUser._id, updateData);
        setSuccessMessage('User updated successfully!');
      } else {
        await createUser(formData);
        setSuccessMessage('User created successfully!');
      }
      setShowModal(false);
      fetchUsers();
      fetchStats();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save user');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        setSuccessMessage('User deleted successfully!');
        fetchUsers();
        fetchStats();
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        setError(err.message || 'Failed to delete user');
        setTimeout(() => setError(null), 5000);
      }
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'inventory_manager': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'procurement_staff': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'distribution_staff': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 xl:ml-20 font-sans pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <ShieldCheck size={24} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Access Management</h1>
            </div>
            <p className="text-slate-500 pl-11">Manage team members, roles, and system permissions</p>
          </div>
          
          <button
            onClick={handleCreateUser}
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-xl text-white bg-emerald-600 shadow-sm hover:bg-emerald-700 hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </button>
        </motion.div>

        {/* Notifications */}
        <AnimatePresence>
          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} />
                <span className="font-medium text-sm">{successMessage}</span>
              </div>
              <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700"><X size={16}/></button>
            </motion.div>
          )}
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={18} />
                <span className="font-medium text-sm">{error}</span>
              </div>
              <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700"><X size={16}/></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistics Grid */}
        {stats && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8"
          >
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Users</h3>
                <Users size={16} className="text-slate-400" />
              </div>
              <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Admins</h3>
                <ShieldCheck size={16} className="text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-purple-600">{stats.byRole?.admin || 0}</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider truncate" title="Inventory Managers">Inv Mgr</h3>
                <PackageSearch size={16} className="text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-blue-600">{stats.byRole?.inventory_manager || 0}</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider truncate" title="Procurement Staff">Proc</h3>
                <ShoppingBag size={16} className="text-amber-400" />
              </div>
              <p className="text-3xl font-bold text-amber-600">{stats.byRole?.procurement_staff || 0}</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider truncate" title="Distribution Staff">Dist</h3>
                <Truck size={16} className="text-emerald-400" />
              </div>
              <p className="text-3xl font-bold text-emerald-600">{stats.byRole?.distribution_staff || 0}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl shadow-sm p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity size={48} />
              </div>
              <div className="flex items-center justify-between mb-3 relative z-10">
                <h3 className="text-slate-300 text-xs font-bold uppercase tracking-wider">New (7d)</h3>
              </div>
              <p className="text-3xl font-bold text-white relative z-10">+{stats.recentUsers}</p>
            </motion.div>
          </motion.div>
        )}

        {/* Filters and Search Workspace */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-t-2xl shadow-sm border border-slate-100 p-5 flex flex-col md:flex-row gap-4 justify-between items-center border-b-0"
        >
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Find member by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 bg-white border border-slate-200 text-sm font-medium text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none transition-colors shadow-sm"
              style={{ paddingRight: '2.5rem', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
            >
              <option value="">All Access Roles</option>
              {getRoleOptions().map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
            
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-900 transition-colors shadow-sm"
            >
              Search
            </button>
          </form>
        </motion.div>

        {/* Users Table */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-b-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          {loading ? (
            <div className="p-16 text-center text-slate-400 flex flex-col justify-center items-center">
              <div className="w-12 h-12 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
              Loading team directory...
            </div>
          ) : users.length === 0 ? (
            <div className="p-16 text-center text-slate-500 flex flex-col justify-center items-center">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <Users size={40} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">No members found</h3>
              <p className="text-slate-500">We couldn't find any team members matching your current filters.</p>
            </div>
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Member Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role Matrix</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Provider</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-11 w-11 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 shadow-sm flex items-center justify-center">
                            <span className="text-slate-700 font-bold text-sm">
                              {u.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{u.name}</div>
                            <div className="text-xs text-slate-500 flex items-center mt-0.5">
                              <Mail size={10} className="mr-1" />
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-md border ${getRoleBadgeColor(u.role)} uppercase tracking-wider`}>
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium hidden sm:table-cell">
                        <span className="bg-slate-100 px-2 py-1 rounded capitalize">{u.provider || 'local'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden md:table-cell flex items-center">
                        <Clock size={12} className="inline mr-1 text-slate-400" />
                        {new Date(u.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditUser(u)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit Permissions"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u._id === user?.id 
                                ? 'text-slate-200 cursor-not-allowed' 
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            disabled={u._id === user?.id}
                            title={u._id === user?.id ? "Cannot delete yourself" : "Revoke Access"}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Grid Layer */}
            {totalPages > 1 && (
              <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  Showing page <span className="font-semibold text-slate-700">{page}</span> of <span className="font-semibold text-slate-700">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 border border-slate-200 text-sm font-medium rounded-lg text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors shadow-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 border border-slate-200 text-sm font-medium rounded-lg text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </motion.div>
      </div>

      {/* Modern Modal Overlay */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="text-emerald-600 w-5 h-5" />
                  {editingUser ? 'Edit Member Access' : 'Onboard New Member'}
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors focus:outline-none"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                      <UserCircle size={14} className="text-slate-400" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                      placeholder="Jane Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                      <Mail size={14} className="text-slate-400" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                      placeholder="jane@qpharmacy.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Lock size={14} className="text-slate-400" />
                        Password 
                      </span>
                      {editingUser && <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded">Optional</span>}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                      placeholder={editingUser ? "Leave blank to keep existing" : "Min. 8 characters"}
                      required={!editingUser}
                      minLength={8}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-slate-400" />
                      Access Role Matrix
                    </label>
                    <div className="relative">
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium appearance-none cursor-pointer"
                        style={{ paddingRight: '2.5rem', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                        required
                      >
                        {getRoleOptions().map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-2.5 p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-start">
                      <Info size={14} className="text-emerald-500 mt-0.5 mr-2 shrink-0" />
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        {getRoleOptions().find(r => r.value === formData.role)?.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-sm font-medium bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 hover:shadow-sm transition-all shadow-sm"
                    >
                      {editingUser ? 'Save Changes' : 'Grant Access'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
