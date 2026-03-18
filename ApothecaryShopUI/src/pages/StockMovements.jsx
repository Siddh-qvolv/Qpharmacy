import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddStockMovementModal from '../components/AddStockMovementModal';
import StockMovementGraph from '../components/StockMovementGraph';
// import StockMovementAiAnalysis from '../components/StockMovementAiAnalysis';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Plus, 
  Search, 
  PackageSearch, 
  ArrowDownRight, 
  ArrowUpRight,
  Calendar,
  User,
  Info
} from 'lucide-react';

const StockMovements = () => {
  const [stockMovements, setStockMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL;
        
        // Fetch products for dropdown
        const productsRes = await axios.get(`${apiUrl}/products`, {
          headers: {
            'Authorization': `${token}`
          }
        });
        
        setProducts(productsRes.data.data);
        
        // If there's a selected product, fetch its stock movements
        if (selectedProduct) {
          const movementsRes = await axios.get(`${apiUrl}/stockMovements/product/${selectedProduct}`, {
            headers: {
              'Authorization': `${token}`
            }
          });
          setStockMovements(movementsRes.data);
          
          // Find the product name for the selected product
          const selectedProd = productsRes.data.data.find(prod => prod._id === selectedProduct);
          if (selectedProd) {
            setSelectedProductName(selectedProd.name);
          }
        } else {
          setStockMovements([]);
          setSelectedProductName('');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedProduct]);

  const handleAddStockMovement = async (newMovement) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      await axios.post(`${apiUrl}/stockMovements`, newMovement, {
        headers: {
          'Authorization': `${token}`
        }
      });
      
      // Refresh the stock movements for the selected product
      if (selectedProduct === newMovement.productId) {
        const movementsRes = await axios.get(`${apiUrl}/stockMovements/product/${selectedProduct}`, {
          headers: {
            'Authorization': `${token}`
          }
        });
        setStockMovements(movementsRes.data);
      }
      
      // Also update the products list to reflect new stock quantities
      const productsRes = await axios.get(`${apiUrl}/products`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      
      setProducts(productsRes.data.data);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding stock movement:', err);
      alert(`Error: ${err.response?.data?.message || 'Failed to add stock movement'}`);
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
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (loading && selectedProduct) return (
    <div className="min-h-screen flex justify-center items-center bg-[#f8fafc]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 xl:ml-20 font-sans pb-12">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Activity size={24} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Stock Activity</h1>
            </div>
            <p className="text-slate-500 pl-11">Monitor inventory additions and subtractions</p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-xl text-white bg-emerald-600 shadow-sm hover:bg-emerald-700 hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Movement
          </button>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8"
        >
          <div className="mb-6 relative w-full md:w-1/2 lg:w-1/3">
            <label htmlFor="product-select" className="block text-sm font-semibold text-slate-700 mb-2">
              Select Product to Analyze
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={16} />
              </div>
              <select
                id="product-select"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:bg-slate-100 cursor-pointer appearance-none transition-colors"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
              >
                <option value="">-- Search for a product --</option>
                {products.map(product => (
                  <option key={product._id} value={product._id}>
                    {product.name} ({product.stockQuantity} in stock)
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {selectedProduct && (
            <div className="mt-8 border-t border-slate-100 pt-8">
              <StockMovementGraph stockMovements={stockMovements} />
            </div>
          )}
        </motion.div>
        
        {selectedProduct ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Info className="text-slate-400 w-5 h-5" />
                Movement Log for <span className="text-emerald-600">{selectedProductName}</span>
              </h2>
            </div>
            {stockMovements.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Movement</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Delta</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock (Before &rarr; After)</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                    </tr>
                  </thead>
                  <motion.tbody 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="bg-white divide-y divide-slate-50"
                  >
                    {stockMovements.map(movement => (
                      <motion.tr variants={itemVariants} key={movement._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-medium text-slate-600">
                            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                            {new Date(movement.createdAt).toLocaleString(undefined, { 
                              month: 'short', day: 'numeric', year: 'numeric', 
                              hour: 'numeric', minute: '2-digit' 
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-md border ${
                            movement.type === 'in' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {movement.type === 'in' ? <ArrowDownRight className="w-3 h-3 mr-1" /> : <ArrowUpRight className="w-3 h-3 mr-1" />}
                            {movement.type === 'in' ? 'STOCK IN' : 'STOCK OUT'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-bold ${movement.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-slate-500 font-medium">
                            <span className="text-slate-400">{movement.previousStock}</span>
                            <span className="mx-2 text-slate-300">&rarr;</span>
                            <span className="text-slate-800">{movement.newStock}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={movement.reason}>
                          {movement.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-slate-600">
                            <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                            {movement.createdBy?.name || 'Unknown'}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <Activity className="w-8 h-8 text-slate-300" />
                </div>
                No activity records found for this product.
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center flex justify-center flex-col items-center"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <PackageSearch className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">No Product Selected</h3>
            <p className="text-slate-500 max-w-sm mt-1">Select a product from the dropdown above to view its detailed stock movement history and analytics.</p>
          </motion.div>
        )}
      </div>
      
      {/* Stock Movement Modal */}
      <AddStockMovementModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddStockMovement}
        products={products}
      />
    </div>
  );
};

export default StockMovements;
