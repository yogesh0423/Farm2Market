import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Package, MapPin, Tag, IndianRupee, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FarmerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Vegetables',
    price_per_kg: '',
    quantity_available: '',
    location: user?.location || '',
    image_url: ''
  });

  // Fetch farmer's active listings
  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/products/my-listings');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  // Handle form submit for adding a new product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/products', formData);
      setShowModal(false);
      setFormData({
        title: '',
        category: 'Vegetables',
        price_per_kg: '',
        quantity_available: '',
        location: user?.location || '',
        image_url: ''
      });
      fetchMyListings(); // Refresh list after adding
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post product. Please check fields.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">👨‍🌾</span>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Farmer Dashboard</h1>
              <p className="text-xs text-slate-500">Welcome back, {user?.name || 'Farmer'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" /> Add New Produce
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-rose-600 rounded-lg border border-slate-200 transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" /> My Listed Products ({products.length})
          </h2>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading your produce listings...</div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No produce listed yet</h3>
            <p className="text-sm text-slate-500 mb-4">Start selling directly to buyers by listing your fresh harvest.</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Post Your First Crop
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="h-40 bg-emerald-50 flex items-center justify-center border-b border-slate-100">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">🌾</span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800 text-lg">{item.title}</h3>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-sm text-slate-600 mb-4">
                    <p className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <IndianRupee className="w-4 h-4 text-emerald-600" /> ₹{item.price_per_kg} / kg
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-slate-400" /> Available: {item.quantity_available} kg
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" /> {item.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Post New Crop / Produce</h3>
            {error && <div className="bg-rose-50 text-rose-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Crop Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Organic Tomatoes"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains">Grains</option>
                    <option value="Pulses">Pulses</option>
                    <option value="Spices">Spices</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Price (₹ / kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="40"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    value={formData.price_per_kg}
                    onChange={(e) => setFormData({ ...formData, price_per_kg: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Quantity (kg)</label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    value={formData.quantity_available}
                    onChange={(e) => setFormData({ ...formData, quantity_available: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="Nashik"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
                >
                  Publish Crop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;