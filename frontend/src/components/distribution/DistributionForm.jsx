import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createDistribution } from "../../services/distributionService";
import { getProducts } from "../../services/productService"; // Assuming you have this service
import { PackageSearch } from "lucide-react";

const DistributionForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    recipient: "",
    recipientType: "pharmacy",
    items: [{ product: "", quantity: 1, batchNumber: "", expiryDate: "" }],
    shippingInfo: {
      address: "",
      contactPerson: "",
      contactNumber: "",
    },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts(); // declare & assign first
        //Conditional for Array, before it was causing white screen after pressing "New Distribution"- @Duzzann
        const productsArray = Array.isArray(response.data)
          ? response.data || response.data.data
          : [];
        setProducts(productsArray);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
      }
    };

    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("shippingInfo.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        shippingInfo: {
          ...prev.shippingInfo,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    // If product changes, auto-fill batch and expiry if available
    if (field === "product" && value) {
      const selectedProduct = products.find((p) => p._id === value);
      if (selectedProduct && selectedProduct.batch) {
        newItems[index].batchNumber = selectedProduct.batch;
        newItems[index].expiryDate =
          selectedProduct.expiryDate?.split("T")[0] || "";
      }
    }

    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { product: "", quantity: 1, batchNumber: "", expiryDate: "" },
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) {
      return; // Keep at least one item
    }

    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.recipient) {
      setError("Recipient is required");
      return;
    }

    if (formData.items.some((item) => !item.product || item.quantity < 1)) {
      setError("All items must have a product and quantity greater than 0");
      return;
    }

    setLoading(true);

    try {
      await createDistribution(formData);
      navigate("/distributions");
      // Add success notification
    } catch (err) {
      console.error("Error creating distribution:", err);
      setError(
        err.response?.data?.message || "Failed to create distribution order"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 font-sans pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-slate-900 px-6 py-6 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <PackageSearch className="w-6 h-6 text-white" />
              <div>
                <h1 className="text-xl font-semibold text-white">New Distribution Order</h1>
                <p className="text-sm text-emerald-100">Create and send stock to your recipient locations.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/distributions')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-800 bg-white/90 backdrop-blur rounded-xl shadow-sm hover:bg-white"
            >
              Back to Orders
            </button>
          </div>

          <div className="px-6 py-8 sm:px-8">
            {error && (
              <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">Recipient</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Recipient Name*</label>
                      <input
                        type="text"
                        name="recipient"
                        value={formData.recipient}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Enter recipient name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Recipient Type*</label>
                      <select
                        name="recipientType"
                        value={formData.recipientType}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      >
                        <option value="pharmacy">Pharmacy</option>
                        <option value="hospital">Hospital</option>
                        <option value="department">Department</option>
                        <option value="patient">Patient</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">Shipping Info</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                      <input
                        type="text"
                        name="shippingInfo.address"
                        value={formData.shippingInfo.address}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Shipping address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Contact Person</label>
                      <input
                        type="text"
                        name="shippingInfo.contactPerson"
                        value={formData.shippingInfo.contactPerson}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Contact person"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Contact Number</label>
                      <input
                        type="text"
                        name="shippingInfo.contactNumber"
                        value={formData.shippingInfo.contactNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">Items</h2>
                    <p className="text-sm text-slate-500">Add products and quantities to send.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    Add Item
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-500">Product</th>
                        <th className="px-4 py-3 font-semibold text-slate-500">Qty</th>
                        <th className="px-4 py-3 font-semibold text-slate-500">Batch</th>
                        <th className="px-4 py-3 font-semibold text-slate-500">Expiry</th>
                        <th className="px-4 py-3 font-semibold text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {formData.items.map((item, index) => (
                        <tr key={index} className="bg-white">
                          <td className="px-4 py-3">
                            <select
                              value={item.product}
                              onChange={(e) => handleItemChange(index, "product", e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              required
                            >
                              <option value="">Select product</option>
                              {products.map((product) => (
                                <option key={product._id} value={product._id}>
                                  {product.name} (Stock: {product.stockQuantity})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "quantity",
                                  parseInt(e.target.value) || ""
                                )
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              required
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.batchNumber}
                              onChange={(e) =>
                                handleItemChange(index, "batchNumber", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              placeholder="Batch #"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="date"
                              value={item.expiryDate}
                              onChange={(e) =>
                                handleItemChange(index, "expiryDate", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              disabled={formData.items.length === 1}
                              className={`px-3 py-1 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 ${
                                formData.items.length === 1
                                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                                  : "bg-rose-500 text-white hover:bg-rose-600"
                              }`}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/distributions")}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Creating..." : "Create Distribution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionForm;
