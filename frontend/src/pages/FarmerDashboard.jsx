import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sprout, PlusCircle, Trash2, Tag, IndianRupee, MapPin, 
  ShoppingBag, Sun, Moon, Monitor, LogOut, ArrowLeft, 
  Layers, Package, CheckCircle2, TrendingUp, ShieldCheck
} from 'lucide-react';

const FarmerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders'
  const [theme, setTheme] = useState('cyber'); // 'cyber' | 'dark' | 'light'

  // Form State for Adding New Produce
  const [newProduct, setNewProduct] = useState({
    title: '',
    category: 'Vegetables',
    price_per_kg: '',
    quantity_available: '',
    location: '',
    image_url: ''
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const categories = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [prodRes, orderRes] = await Promise.all([
        API.get('/farmer/products'),
        API.get('/farmer/orders')
      ]);
      setProducts(prodRes.data);
      setOrders(orderRes.data);
    } catch (err) {
      console.error('Failed to load farmer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      await API.post('/products', {
        ...newProduct,
        price_per_kg: parseFloat(newProduct.price_per_kg),
        quantity_available: parseFloat(newProduct.quantity_available)
      });
      setFormSuccess('✨ Listing added successfully!');
      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess('');
        setNewProduct({
          title: '',
          category: 'Vegetables',
          price_per_kg: '',
          quantity_available: '',
          location: '',
          image_url: ''
        });
        fetchDashboardData();
      }, 1200);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to add produce listing.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await API.delete(`/products/${id}`);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete product.');
    }
  };

  // Dynamic Theme Styling Maps
  const styles = {
    cyber: {
      bg: 'bg-[#080d0a] text-slate-100 selection:bg-emerald-500 selection:text-black',
      header: 'bg-[#0b130e]/80 border-emerald-900/30 text-white',
      accentText: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      cardBg: 'bg-[#0d1711] border-emerald-900/40 shadow-[0_0_30px_rgba(16,185,129,0.1)]',
      statBg: 'bg-[#080d0a] border-emerald-900/30',
      btnPrimary: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20',
      tabActive: 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-extrabold',
      tabInactive: 'bg-[#0f1a12] text-slate-400 border-emerald-900/40 hover:text-white',
      modalBg: 'bg-[#0d1711] border-emerald-500/40',
      modalInput: 'bg-[#080d0a] border-emerald-900/60 text-white focus:border-emerald-400'
    },
    dark: {
      bg: 'bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white',
      header: 'bg-slate-900/90 border-slate-800 text-white',
      accentText: 'text-teal-400',
      badgeBg: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
      cardBg: 'bg-slate-900 border-slate-800 shadow-xl',
      statBg: 'bg-slate-950 border-slate-800',
      btnPrimary: 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20',
      tabActive: 'bg-teal-500 text-slate-950 border-teal-400 shadow-md font-extrabold',
      tabInactive: 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white',
      modalBg: 'bg-slate-900 border-slate-800',
      modalInput: 'bg-slate-950 border-slate-800 text-white focus:border-teal-400'
    },
    light: {
      bg: 'bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white',
      header: 'bg-white/90 border-slate-200 text-slate-900',
      accentText: 'text-emerald-600',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      cardBg: 'bg-white border-slate-200/80 shadow-xl shadow-slate-200/50',
      statBg: 'bg-slate-50 border-slate-100',
      btnPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
      tabActive: 'bg-emerald-600 text-white border-emerald-600 shadow-md font-extrabold',
      tabInactive: 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100',
      modalBg: 'bg-white border-slate-200',
      modalInput: 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
    }
  }[theme];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 pb-20 ${styles.bg}`}>
      
      {/* Header Bar */}
      <header className={`backdrop-blur-xl border-b sticky top-0 z-30 transition-colors ${styles.header}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 p-[1px] shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-[#0d1711] rounded-[15px] flex items-center justify-center">
                <Sprout className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight flex items-center gap-1">
                FARM<span className={styles.accentText}>2</span>MARKET
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${styles.badgeBg}`}>
                  FARMER NODE
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme Selector Controls */}
            <div className="flex items-center p-1 rounded-2xl border border-slate-700/30 bg-black/10 backdrop-blur-md">
              <button
                onClick={() => setTheme('cyber')}
                className={`p-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${theme === 'cyber' ? 'bg-emerald-500 text-black shadow-md' : 'text-slate-400 hover:text-white'}`}
                title="Cyber-Agri Mode"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${theme === 'dark' ? 'bg-teal-500 text-black shadow-md' : 'text-slate-400 hover:text-white'}`}
                title="Dark Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${theme === 'light' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-700'}`}
                title="Light Mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => navigate('/')}
              className="p-2 text-xs font-bold flex items-center gap-1 opacity-70 hover:opacity-100 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Marketplace
            </button>

            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="p-2 text-slate-400 hover:text-rose-400 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Welcome & Top Summary */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
              Welcome, {user?.name || 'Farmer'} 👨‍🌾
            </h1>
            <p className="text-xs opacity-60 mt-1">Manage your crop inventory and monitor direct incoming orders.</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${styles.btnPrimary}`}
          >
            <PlusCircle className="w-4 h-4" /> Add Produce Listing
          </button>
        </div>

        {/* Stats Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className={`p-5 rounded-2xl border ${styles.cardBg}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono font-bold uppercase opacity-50">Active Crops</span>
              <Package className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-black">{products.length}</span>
          </div>

          <div className={`p-5 rounded-2xl border ${styles.cardBg}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono font-bold uppercase opacity-50">Received Orders</span>
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-black">{orders.length}</span>
          </div>

          <div className={`p-5 rounded-2xl border ${styles.cardBg}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono font-bold uppercase opacity-50">Gross Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-black text-emerald-400">
              ₹{orders.reduce((sum, ord) => sum + (ord.total_price || 0), 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-slate-700/20 pb-3">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              activeTab === 'products' ? styles.tabActive : styles.tabInactive
            }`}
          >
            <Layers className="w-4 h-4" /> My Produce ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              activeTab === 'orders' ? styles.tabActive : styles.tabInactive
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Direct Orders ({orders.length})
          </button>
        </div>

        {/* Tab 1: Farmer Products Grid */}
        {activeTab === 'products' && (
          <div>
            {loading ? (
              <div className="text-center py-20">
                <div className="w-10 h-10 border-4 border-emerald-900 border-t-emerald-400 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs font-mono tracking-wider opacity-60">LOADING INVENTORY...</p>
              </div>
            ) : products.length === 0 ? (
              <div className={`border rounded-3xl p-12 text-center max-w-lg mx-auto ${styles.cardBg}`}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl bg-black/10">
                  🌱
                </div>
                <h3 className="text-base font-bold mb-1">No Active Produce Listings</h3>
                <p className="text-xs opacity-60 mb-6">List your fresh harvest to start selling directly to buyers.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold ${styles.btnPrimary}`}
                >
                  Create First Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((item) => (
                  <div key={item.id} className={`border rounded-3xl overflow-hidden transition flex flex-col justify-between ${styles.cardBg}`}>
                    <div>
                      <div className="relative h-40 bg-black/20 overflow-hidden">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl">🥦</div>
                        )}
                        <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-white/20 text-emerald-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full">
                          {item.category}
                        </span>
                      </div>

                      <div className="p-5">
                        <h3 className="font-extrabold text-lg mb-2">{item.title}</h3>
                        
                        <div className={`grid grid-cols-2 gap-2 p-3 rounded-xl border mb-3 ${styles.statBg}`}>
                          <div>
                            <span className="text-[9px] uppercase font-mono opacity-50 block">Price</span>
                            <span className="font-bold text-emerald-400 text-sm">₹{item.price_per_kg} / kg</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-mono opacity-50 block">Stock</span>
                            <span className="font-bold text-xs">{item.quantity_available} kg</span>
                          </div>
                        </div>

                        <p className="text-xs opacity-70 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {item.location}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <button
                        onClick={() => handleDeleteProduct(item.id)}
                        className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Listing
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Incoming Orders List */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className={`border rounded-3xl p-12 text-center max-w-lg mx-auto ${styles.cardBg}`}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl bg-black/10">
                  📦
                </div>
                <h3 className="text-base font-bold mb-1">No Orders Received Yet</h3>
                <p className="text-xs opacity-60">Orders placed by buyers will appear here automatically.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div key={ord.id} className={`p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${styles.cardBg}`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base">{ord.product_title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Order #{ord.id}
                        </span>
                      </div>
                      <p className="text-xs opacity-70">
                        Buyer: <span className="font-semibold">{ord.buyer_name}</span> ({ord.buyer_email})
                      </p>
                      <p className="text-xs font-mono opacity-50">
                        Date: {new Date(ord.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-mono opacity-50 block">Quantity</span>
                        <span className="font-bold text-sm">{ord.quantity_kg} kg</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-mono opacity-50 block">Total Revenue</span>
                        <span className="font-black text-emerald-400 text-base">₹{ord.total_price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Produce Listing Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className={`rounded-3xl max-w-lg w-full p-6 shadow-2xl border relative ${styles.modalBg}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">Add Produce Listing</h3>
                <p className="text-xs opacity-60">List your crop directly on the open marketplace</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="opacity-50 hover:opacity-100 font-bold text-lg">✕</button>
            </div>

            {formError && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl mb-4 text-xs font-medium">{formError}</div>}
            {formSuccess && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl mb-4 text-xs font-medium">{formSuccess}</div>}

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase opacity-60 mb-1">Crop Title</label>
                <input
                  type="text"
                  placeholder="e.g. Organic Tomatoes"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-xl outline-none text-sm font-medium ${styles.modalInput}`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase opacity-60 mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className={`w-full px-3 py-2.5 border rounded-xl outline-none text-sm font-medium ${styles.modalInput}`}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase opacity-60 mb-1">Price / kg (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="40"
                    value={newProduct.price_per_kg}
                    onChange={(e) => setNewProduct({ ...newProduct, price_per_kg: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-xl outline-none text-sm font-medium ${styles.modalInput}`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase opacity-60 mb-1">Available Quantity (kg)</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={newProduct.quantity_available}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity_available: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-xl outline-none text-sm font-medium ${styles.modalInput}`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase opacity-60 mb-1">Farm Location</label>
                  <input
                    type="text"
                    placeholder="Nashik, Maharashtra"
                    value={newProduct.location}
                    onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-xl outline-none text-sm font-medium ${styles.modalInput}`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase opacity-60 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-xl outline-none text-sm font-medium ${styles.modalInput}`}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${styles.btnPrimary}`}
                >
                  Publish Listing
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