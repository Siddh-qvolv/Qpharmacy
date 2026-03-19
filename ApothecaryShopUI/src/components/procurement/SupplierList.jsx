import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSuppliers, deleteSupplier } from "../../services/supplierService";
import AppLoader from "../AppLoader";
import ConfirmationModal from "../ConfirmationModal";
import { motion } from "framer-motion";
import { PackageSearch, User, Phone, CheckCircle, Plus } from 'lucide-react';

function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await getSuppliers();
      // Handle response structure { success: true, data: [...] } or direct array
      const suppliersList = Array.isArray(data) ? data : (data?.data || []);
      setSuppliers(Array.isArray(suppliersList) ? suppliersList : []);
      setError(null);
    } catch (err) {
      setError("Failed to load suppliers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (id) => {
    setPendingDeleteId(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    setShowConfirmDelete(false);
    setDeleting(true);

    try {
      await deleteSupplier(pendingDeleteId);
      setSuppliers((prev) => prev.filter((supplier) => supplier._id !== pendingDeleteId));
    } catch (err) {
      setError("Failed to delete supplier");
      console.error(err);
    } finally {
      setDeleting(false);
      setPendingDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setPendingDeleteId(null);
  };

  if (loading) return <AppLoader message="Loading suppliers" />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 xl:ml-20 font-sans pb-12">
      <ConfirmationModal
        isOpen={showConfirmDelete}
        title="Confirm delete"
        message="Are you sure you want to delete this supplier?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={deleting}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Suppliers</h1>
            </div>
            <p className="text-slate-500 pl-11">Manage supplier details and contact information</p>
          </div>

          <Link
            to="/procurement/suppliers/new"
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-xl text-white bg-emerald-600 shadow-sm hover:bg-emerald-700 hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </Link>
        </motion.div>

        {suppliers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center flex flex-col items-center justify-center min-h-[300px]"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <User size={40} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">No suppliers found</h3>
            <p className="text-slate-500 max-w-sm">Add suppliers to start tracking procurement sources.</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          >
            {suppliers.map((supplier) => (
              <motion.div
                key={supplier._id}
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <User size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 truncate">{supplier.name}</h3>
                        <p className="text-xs text-slate-500 truncate">{supplier.contactPerson || 'No contact set'}</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone size={14} className="text-slate-400" />
                        <span>{supplier.phone || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CheckCircle size={14} className="text-slate-400" />
                        <span className="truncate">{supplier.email || '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        supplier.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}
                    >
                      {supplier.status}
                    </span>
                    <div className="flex gap-2">
                      <Link
                        to={`/procurement/suppliers/${supplier._id}`}
                        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                      >
                        View
                      </Link>
                      <Link
                        to={`/procurement/suppliers/${supplier._id}/edit`}
                        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 transition"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => requestDelete(supplier._id)}
                        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default SupplierList;
