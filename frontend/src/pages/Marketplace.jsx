import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Search, MapPin, Tag, IndianRupee, ShoppingBag, LogOut, 
  Sparkles, TrendingUp, ShieldCheck, Sprout, ArrowRight,
  Zap, Flame, SlidersHorizontal, Sun, Moon, Monitor
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Marketplace = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Theme Mode State: 'cyber' (default high-energy), 'dark', or 'light'
  const [theme, setTheme] = useState('cyber');

  // Order modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');

  const categories = [
    { name: 'All', icon: '⚡' },
    { name: 'Vegetables', icon: '🥬' },
    { name: 'Fruits', icon: '🍎' },
    { name: 'Grains', icon: '🌾' },
    { name: 'Pulses', icon: '🫘' },
    { name: 'Spices', icon: '🌶️' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to load marketplace products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderError('');
    setOrderSuccess('');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await API.post('/orders', {
        product_id: selectedProduct.id,
        quantity_kg: parseFloat(quantity)
      });
      setOrderSuccess('⚡ Order Executed Successfully!');
      setTimeout(() => {
        setSelectedProduct(null);
        setOrderSuccess('');
        setQuantity(1);
        fetchProducts();
      }, 1500);
    } catch (err) {
      setOrderError(err.response?.data?.error || 'Failed to execute order.');
    }
  };

  const filteredProducts = products.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Dynamic Theme Styling Maps
  const styles = {
    cyber: {
      bg: 'bg-[#080d0a] text-slate-100 selection:bg-emerald-500 selection:text-black',
      ticker: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      header: 'bg-[#0b130e]/80 border-emerald-900/30 text-white',
      logoText: 'text-white',
      accentText: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      heroOverlay: 'from-emerald-950 via-[#0b1710] to-[#080d0a]',
      searchContainer: 'bg-[#121f16]/80 border-emerald-500/30 shadow-emerald-950/80',
      searchInput: 'bg-[#0a120c] text-white placeholder-slate-500 border-emerald-900/40',
      filterBorder: 'border-emerald-950',
      filterActive: 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]',
      filterInactive: 'bg-[#0f1a12] text-slate-400 border-emerald-900/40 hover:border-emerald-700 hover:text-emerald-300',
      cardBg: 'bg-[#0d1711] border-emerald-900/40 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
      cardTitle: 'text-white group-hover:text-emerald-300',
      cardStatBg: 'bg-[#080d0a] border-emerald-900/30',
      btnPrimary: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20',
      modalBg: 'bg-[#0d1711] border-emerald-500/40',
      modalInput: 'bg-[#080d0a] border-emerald-900/60 text-white focus:border-emerald-400'
    },
    dark: {
      bg: 'bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white',
      ticker: 'bg-slate-900 border-slate-800 text-slate-300',
      header: 'bg-slate-900/90 border-slate-800 text-white',
      logoText: 'text-white',
      accentText: 'text-teal-400',
      badgeBg: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
      heroOverlay: 'from-slate-900 via-slate-950 to-black',
      searchContainer: 'bg-slate-900/80 border-slate-800 shadow-slate-950',
      searchInput: 'bg-slate-950 text-white placeholder-slate-500 border-slate-800',
      filterBorder: 'border-slate-800',
      filterActive: 'bg-teal-500 text-slate-950 border-teal-400 shadow-md',
      filterInactive: 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200',
      cardBg: 'bg-slate-900 border-slate-800 hover:border-teal-500/40 hover:shadow-xl',
      cardTitle: 'text-white group-hover:text-teal-400',
      cardStatBg: 'bg-slate-950 border-slate-800',
      btnPrimary: 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20',
      modalBg: 'bg-slate-900 border-slate-800',
      modalInput: 'bg-slate-950 border-slate-800 text-white focus:border-teal-400'
    },
    light: {
      bg: 'bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white',
      ticker: 'bg-emerald-50 border-emerald-100 text-emerald-800',
      header: 'bg-white/90 border-slate-200 text-slate-900',
      logoText: 'text-slate-900',
      accentText: 'text-emerald-600',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      heroOverlay: 'from-emerald-800 via-emerald-700 to-teal-800 text-white',
      searchContainer: 'bg-white/20 border-white/30 shadow-xl',
      searchInput: 'bg-white text-slate-800 placeholder-slate-400 border-slate-200',
      filterBorder: 'border-slate-200',
      filterActive: 'bg-emerald-600 text-white border-emerald-600 shadow-md',
      filterInactive: 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-slate-100',
      cardBg: 'bg-white border-slate-200/80 hover:border-emerald-400 hover:shadow-xl',
      cardTitle: 'text-slate-800 group-hover:text-emerald-700',
      cardStatBg: 'bg-slate-50 border-slate-100',
      btnPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
      modalBg: 'bg-white border-slate-200',
      modalInput: 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
    }
  }[theme];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 pb-20 ${styles.bg}`}>
      
      {/* Top Ticker Tape */}
      <div className={`border-b py-1.5 px-4 overflow-hidden text-[11px] font-mono flex items-center gap-6 justify-between transition-colors ${styles.ticker}`}>
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-bold uppercase tracking-wider">LIVE AGRI-EXCHANGE</span>
        </div>
        <div className="flex gap-8 overflow-x-auto whitespace-nowrap scrollbar-none font-medium">
          <span>🍅 Tomatoes: <span className="font-bold">₹42/kg ↑</span></span>
          <span>🧅 Onions: <span className="font-bold">₹28/kg ↑</span></span>
          <span>🌾 Organic Wheat: <span className="font-bold">₹35/kg</span></span>
          <span>🌶️ Chili (Guntur): <span className="text-rose-400 font-bold">₹190/kg ↓</span></span>
        </div>
        <div className="hidden md:flex items-center gap-1 text-[10px]">
          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified Decentralized Node
        </div>
      </div>

      {/* Main Header with Integrated Theme Switcher */}
      <header className={`backdrop-blur-xl border-b sticky top-0 z-30 transition-colors ${styles.header}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 p-[1px] shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-[#0d1711] rounded-[15px] flex items-center justify-center">
                <Sprout className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className={`text-xl font-black tracking-tight flex items-center gap-1 ${styles.logoText}`}>
                FARM<span className={styles.accentText}>2</span>MARKET
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${styles.badgeBg}`}>
                  {theme.toUpperCase()}
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
                title="Cyber-Agri Mode (Default)"
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

            {token ? (
              <div className="flex items-center space-x-3 p-1.5 pl-3 rounded-2xl border border-slate-700/30 bg-black/10">
                <span className="text-xs font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                  {user?.name} 
                </span>
                
                {user?.role === 'farmer' && (
                  <button
                    onClick={() => navigate('/farmer/dashboard')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${styles.btnPrimary}`}
                  >
                    Dashboard <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="px-3 py-2 text-xs font-bold hover:opacity-80 transition">
                  Sign In
                </Link>
                <Link to="/register" className={`px-4 py-2 rounded-xl text-xs font-bold transition ${styles.btnPrimary}`}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Showcase Banner */}
      <section className={`relative overflow-hidden pt-12 pb-16 px-4 bg-gradient-to-br ${styles.heroOverlay}`}>
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono tracking-wide">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> DIRECT FARMER-TO-BUYER PROTOCOL
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none">
            Cut Out The Middlemen.<br/>
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              Empower Direct Farmers.
            </span>
          </h1>

          <p className="opacity-80 max-w-xl mx-auto text-sm sm:text-base font-normal">
            Buy farm-fresh harvests directly from verified regional cultivators with zero markups.
          </p>

          {/* Floating Search Input */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className={`p-1.5 backdrop-blur-2xl border rounded-2xl shadow-2xl transition-all ${styles.searchContainer}`}>
              <div className="relative flex items-center">
                <Search className="absolute left-4 opacity-50 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search organic produce, crops, locations (e.g. Tomatoes, Nashik)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl text-sm font-medium border outline-none transition-all ${styles.searchInput}`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Category Filter Bar */}
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b ${styles.filterBorder}`}>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider opacity-80">Filter By Produce</h2>
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2 w-full sm:w-auto scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap border ${
                  selectedCategory === cat.name ? styles.filterActive : styles.filterInactive
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-900 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xs font-mono tracking-wider opacity-70">FETCHING PRODUCE LISTINGS...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={`border rounded-3xl p-12 text-center max-w-lg mx-auto ${styles.cardBg}`}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl bg-black/10">
              🌽
            </div>
            <h3 className="text-base font-bold mb-1">No Produce Found</h3>
            <p className="text-xs opacity-60 mb-6">No produce matches your search or category filter.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="text-xs text-emerald-400 font-bold hover:underline font-mono"
            >
              [RESET FILTERS]
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((item) => (
              <div 
                key={item.id} 
                className={`group relative border rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between ${styles.cardBg}`}
              >
                <div>
                  <div className="relative h-48 bg-black/20 overflow-hidden">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🥬
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-white/20 text-emerald-300 text-[10px] font-mono font-bold px-3 py-1 rounded-full">
                      {item.category}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className={`font-extrabold text-xl transition-colors mb-1 ${styles.cardTitle}`}>
                      {item.title}
                    </h3>
                    
                    <p className="text-xs opacity-60 mb-5 flex items-center gap-1.5">
                      Farmer: <span className="font-semibold opacity-100">{item.farmer_name}</span>
                    </p>

                    <div className={`grid grid-cols-2 gap-3 p-3.5 rounded-2xl border mb-4 ${styles.cardStatBg}`}>
                      <div>
                        <span className="text-[9px] uppercase font-mono font-bold opacity-50 block">Unit Price</span>
                        <span className="font-black text-emerald-400 text-lg flex items-center">
                          <IndianRupee className="w-4 h-4" />{item.price_per_kg} <span className="text-[10px] font-normal opacity-60 ml-1">/kg</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-mono font-bold opacity-50 block">In Stock</span>
                        <span className="font-bold text-xs flex items-center gap-1 mt-1 font-mono">
                          <Tag className="w-3 h-3 text-emerald-400" /> {item.quantity_available} kg
                        </span>
                      </div>
                    </div>

                    <p className="text-xs opacity-70 flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {item.location}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => setSelectedProduct(item)}
                    disabled={item.quantity_available <= 0}
                    className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 ${styles.btnPrimary}`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {item.quantity_available > 0 ? 'BUY PRODUCE NOW' : 'OUT OF STOCK'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Order Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className={`rounded-3xl max-w-md w-full p-6 shadow-2xl border relative ${styles.modalBg}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">Direct Purchase Order</h3>
                <p className="text-xs text-emerald-400 font-mono">{selectedProduct.title} • ₹{selectedProduct.price_per_kg} / kg</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="opacity-50 hover:opacity-100 font-bold text-lg">✕</button>
            </div>

            {orderError && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl mb-4 text-xs font-medium">{orderError}</div>}
            {orderSuccess && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl mb-4 text-xs font-medium">{orderSuccess}</div>}

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold opacity-60 uppercase tracking-wider mb-1">Select Quantity (kg)</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct.quantity_available}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl outline-none text-sm font-bold font-mono ${styles.modalInput}`}
                  required
                />
              </div>

              <div className={`p-4 rounded-xl text-xs space-y-2 border font-mono ${styles.cardStatBg}`}>
                <div className="flex justify-between opacity-60">
                  <span>Unit Price:</span>
                  <span>₹{selectedProduct.price_per_kg} / kg</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-slate-700/30 pt-2">
                  <span>Total Payable:</span>
                  <span className="text-emerald-400">₹{(selectedProduct.price_per_kg * (parseFloat(quantity) || 0)).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-3 border border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition ${styles.btnPrimary}`}
                >
                  Confirm Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;