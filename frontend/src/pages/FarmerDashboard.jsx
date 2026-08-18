import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import {
  Sprout,
  PlusCircle,
  Trash2,
  Pencil,
  MapPin,
  ShoppingBag,
  Sun,
  Moon,
  Monitor,
  LogOut,
  ArrowLeft,
  Layers,
  Package,
  TrendingUp,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

const FarmerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // ============================================================
  // DATA STATE
  // ============================================================

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('products');
  const [theme, setTheme] = useState('cyber');

  // ============================================================
  // ADD PRODUCT STATE
  // ============================================================

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

  // ============================================================
  // EDIT PRODUCT STATE
  // ============================================================

  const [editingProduct, setEditingProduct] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const categories = [
    'Vegetables',
    'Fruits',
    'Grains',
    'Pulses',
    'Spices'
  ];

  // ============================================================
  // FETCH DASHBOARD DATA
  // ============================================================

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
      console.error(
        'Failed to load farmer dashboard data:',
        err
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ADD PRODUCT
  // ============================================================

  const handleAddProduct = async (e) => {
    e.preventDefault();

    setFormError('');
    setFormSuccess('');

    try {
      await API.post('/products', {
        ...newProduct,
        price_per_kg: parseFloat(newProduct.price_per_kg),
        quantity_available: parseFloat(
          newProduct.quantity_available
        )
      });

      setFormSuccess(
        '✨ Listing added successfully!'
      );

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
      setFormError(
        err.response?.data?.error ||
        'Failed to add produce listing.'
      );
    }
  };

  // ============================================================
  // DELETE PRODUCT
  // ============================================================

  const handleDeleteProduct = async (id) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this listing?'
      )
    ) {
      return;
    }

    try {
      await API.delete(`/products/${id}`);

      fetchDashboardData();

    } catch (err) {
      alert(
        err.response?.data?.error ||
        'Failed to delete product.'
      );
    }
  };

  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  const handleEditProduct = (product) => {
    setEditError('');
    setEditSuccess('');

    setEditingProduct({
      ...product
    });
  };

  // ============================================================
  // CLOSE EDIT MODAL
  // ============================================================

  const handleCloseEditModal = () => {
    if (editLoading) return;

    setEditingProduct(null);
    setEditError('');
    setEditSuccess('');
  };

  // ============================================================
  // SAVE EDITED PRODUCT
  // ============================================================

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (!editingProduct) return;

    setEditLoading(true);
    setEditError('');
    setEditSuccess('');

    try {
      /*
        We send only the fields that belong to the product.

        parseFloat() converts values coming from input fields
        from strings into numbers.
      */

      const updatedProduct = {
        title: editingProduct.title,
        category: editingProduct.category,
        price_per_kg: parseFloat(
          editingProduct.price_per_kg
        ),
        quantity_available: parseFloat(
          editingProduct.quantity_available
        ),
        location: editingProduct.location,
        image_url: editingProduct.image_url || ''
      };

      /*
        PUT means:

        "Update the existing product with this ID."

        Example:

        PUT /products/5

        means we are updating product whose ID is 5.
      */

      await API.put(
        `/products/${editingProduct.id}`,
        updatedProduct
      );

      setEditSuccess(
        '✨ Listing updated successfully!'
      );

      /*
        Give the user a short success message,
        then reload the products from the backend.
      */

      setTimeout(async () => {
        await fetchDashboardData();

        setEditingProduct(null);
        setEditSuccess('');
        setEditLoading(false);
      }, 800);

    } catch (err) {

      console.error(
        'Failed to update product:',
        err
      );

      setEditError(
        err.response?.data?.error ||
        'Failed to update product.'
      );

      setEditLoading(false);
    }
  };

  // ============================================================
  // ORDER STATUS
  // ============================================================

  const handleOrderStatusChange = (
    orderId,
    newStatus
  ) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus
            }
          : order
      )
    );
  };

  // ============================================================
  // ORDER STATUS DISPLAY
  // ============================================================

  const getOrderStatus = (status) => {
    const normalizedStatus = String(
      status || 'pending'
    ).toLowerCase();

    if (normalizedStatus === 'confirmed') {
      return {
        label: 'CONFIRMED',
        className:
          'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        icon: (
          <CheckCircle2 className="w-3.5 h-3.5" />
        )
      };
    }

    if (normalizedStatus === 'rejected') {
      return {
        label: 'REJECTED',
        className:
          'bg-rose-500/15 text-rose-300 border-rose-500/30',
        icon: (
          <span className="text-xs font-black">
            ✕
          </span>
        )
      };
    }

    return {
      label: 'PENDING',
      className:
        'bg-amber-500/15 text-amber-300 border-amber-500/30',
      icon: (
        <span className="text-xs font-black">
          •
        </span>
      )
    };
  };

  // ============================================================
  // MARKET ANALYTICS
  // ============================================================
  // These values are calculated from the orders already fetched
  // from the backend. No new backend API is required.
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (Number(order.total_price) || 0),
    0
  );

  const pendingOrders = orders.filter(
    (order) =>
      String(order.status || 'pending').toLowerCase() === 'pending'
  ).length;

  const confirmedOrders = orders.filter(
    (order) =>
      String(order.status || '').toLowerCase() === 'confirmed'
  ).length;

  const completedOrders = orders.filter((order) =>
    ['delivered', 'completed'].includes(
      String(order.status || '').toLowerCase()
    )
  ).length;

  const totalQuantitySold = orders.reduce(
    (sum, order) => sum + (Number(order.quantity_kg) || 0),
    0
  );

  const averageOrderValue =
    orders.length > 0 ? totalRevenue / orders.length : 0;

  // ============================================================
  // PRODUCT PERFORMANCE
  // ============================================================
  // Group existing orders by product and calculate quantity,
  // revenue, and order count entirely on the frontend.
  const productPerformance = Object.values(
    orders.reduce((acc, order) => {
      const productName =
        order.product_title ||
        order.product_name ||
        order.product?.title ||
        'Unknown Product';

      if (!acc[productName]) {
        acc[productName] = {
          name: productName,
          quantity: 0,
          revenue: 0,
          orderCount: 0
        };
      }

      acc[productName].quantity +=
        Number(order.quantity_kg) || 0;

      acc[productName].revenue +=
        Number(order.total_price) || 0;

      acc[productName].orderCount += 1;

      return acc;
    }, {})
  )
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const maxProductQuantity =
    productPerformance.length > 0
      ? Math.max(
          ...productPerformance.map(
            (product) => product.quantity
          )
        )
      : 0;

  // ============================================================
  // THEME STYLES
  // ============================================================

  const styles = {
    cyber: {
      bg:
        'bg-[#080d0a] text-slate-100 selection:bg-emerald-500 selection:text-black',

      header:
        'bg-[#0b130e]/80 border-emerald-900/30 text-white',

      accentText:
        'text-emerald-400',

      badgeBg:
        'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',

      cardBg:
        'bg-[#0d1711] border-emerald-900/40 shadow-[0_0_30px_rgba(16,185,129,0.1)]',

      statBg:
        'bg-[#080d0a] border-emerald-900/30',

      btnPrimary:
        'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20',

      tabActive:
        'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-extrabold',

      tabInactive:
        'bg-[#0f1a12] text-slate-400 border-emerald-900/40 hover:text-white',

      modalBg:
        'bg-[#0d1711] border-emerald-500/40',

      modalInput:
        'bg-[#080d0a] border-emerald-900/60 text-white focus:border-emerald-400'
    },

    dark: {
      bg:
        'bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white',

      header:
        'bg-slate-900/90 border-slate-800 text-white',

      accentText:
        'text-teal-400',

      badgeBg:
        'bg-teal-500/10 text-teal-300 border-teal-500/20',

      cardBg:
        'bg-slate-900 border-slate-800 shadow-xl',

      statBg:
        'bg-slate-950 border-slate-800',

      btnPrimary:
        'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20',

      tabActive:
        'bg-teal-500 text-slate-950 border-teal-400 shadow-md font-extrabold',

      tabInactive:
        'bg-slate-900 text-slate-400 border-slate-800 hover:text-white',

      modalBg:
        'bg-slate-900 border-slate-800',

      modalInput:
        'bg-slate-950 border-slate-800 text-white focus:border-teal-400'
    },

    light: {
      bg:
        'bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white',

      header:
        'bg-white/90 border-slate-200 text-slate-900',

      accentText:
        'text-emerald-600',

      badgeBg:
        'bg-emerald-100 text-emerald-800 border-emerald-200',

      cardBg:
        'bg-white border-slate-200/80 shadow-xl shadow-slate-200/50',

      statBg:
        'bg-slate-50 border-slate-100',

      btnPrimary:
        'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',

      tabActive:
        'bg-emerald-600 text-white border-emerald-600 shadow-md font-extrabold',

      tabInactive:
        'bg-white text-slate-600 border-slate-200 hover:bg-slate-100',

      modalBg:
        'bg-white border-slate-200',

      modalInput:
        'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
    }
  }[theme];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 pb-20 ${styles.bg}`}
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header
        className={`backdrop-blur-xl border-b sticky top-0 z-30 transition-colors ${styles.header}`}
      >

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">

          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate('/')}
          >

            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 p-[1px] shadow-lg shadow-emerald-500/20">

              <div className="w-full h-full bg-[#0d1711] rounded-[15px] flex items-center justify-center">

                <Sprout className="w-5 h-5 text-emerald-400" />

              </div>

            </div>

            <div>

              <span className="text-xl font-black tracking-tight flex items-center gap-1">

                FARM
                <span className={styles.accentText}>
                  2
                </span>
                MARKET

                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${styles.badgeBg}`}
                >
                  FARMER NODE
                </span>

              </span>

            </div>

          </div>

          <div className="flex items-center space-x-3">

            <div className="flex items-center p-1 rounded-2xl border border-slate-700/30 bg-black/10 backdrop-blur-md">

              <button
                onClick={() => setTheme('cyber')}
                className={`p-1.5 rounded-xl text-xs font-bold transition ${
                  theme === 'cyber'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Cyber-Agri Mode"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-xl text-xs font-bold transition ${
                  theme === 'dark'
                    ? 'bg-teal-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Dark Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-xl text-xs font-bold transition ${
                  theme === 'light'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Light Mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>

            </div>

            <button
              onClick={() => navigate('/')}
              className="p-2 text-xs font-bold flex items-center gap-1 opacity-70 hover:opacity-100 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Marketplace
            </button>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-2 text-slate-400 hover:text-rose-400 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>

      </header>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">

          <div>

            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
              Welcome, {user?.name || 'Farmer'} 👨‍🌾
            </h1>

            <p className="text-xs opacity-60 mt-1">
              Manage your crop inventory and monitor direct incoming orders.
            </p>

          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${styles.btnPrimary}`}
          >
            <PlusCircle className="w-4 h-4" />
            Add Produce Listing
          </button>

        </div>

        {/* ====================================================
            MARKET ANALYTICS SNAPSHOT
        ==================================================== */}
        <section className="mb-8">

          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                Market Analytics
              </p>
              <h2 className="text-xl font-black tracking-tight mt-1">
                Business Snapshot
              </h2>
              <p className="text-xs opacity-60 mt-1">
                Key sales metrics calculated from your incoming orders.
              </p>
            </div>

            <TrendingUp className="w-5 h-5 text-emerald-400 opacity-70" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* ACTIVE CROPS */}
            <div className={`p-5 rounded-2xl border ${styles.cardBg}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono font-bold uppercase opacity-50">
                  Active Crops
                </span>
                <Package className="w-4 h-4 text-emerald-400" />
              </div>

              <span className="text-2xl font-black">
                {products.length}
              </span>

              <p className="text-[10px] opacity-50 mt-1">
                Current listings
              </p>
            </div>

            {/* TOTAL ORDERS */}
            <div className={`p-5 rounded-2xl border ${styles.cardBg}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono font-bold uppercase opacity-50">
                  Total Orders
                </span>
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
              </div>

              <span className="text-2xl font-black">
                {orders.length}
              </span>

              <p className="text-[10px] opacity-50 mt-1">
                {pendingOrders} pending
              </p>
            </div>

            {/* TOTAL QUANTITY */}
            <div className={`p-5 rounded-2xl border ${styles.cardBg}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono font-bold uppercase opacity-50">
                  Quantity Sold
                </span>
                <Layers className="w-4 h-4 text-emerald-400" />
              </div>

              <span className="text-2xl font-black">
                {totalQuantitySold.toFixed(2)} kg
              </span>

              <p className="text-[10px] opacity-50 mt-1">
                Across all orders
              </p>
            </div>

            {/* REVENUE */}
            <div className={`p-5 rounded-2xl border ${styles.cardBg}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono font-bold uppercase opacity-50">
                  Gross Revenue
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>

              <span className="text-2xl font-black text-emerald-400">
                ₹{totalRevenue.toFixed(2)}
              </span>

              <p className="text-[10px] opacity-50 mt-1">
                Avg. ₹{averageOrderValue.toFixed(2)} / order
              </p>
            </div>

          </div>

          {/* ORDER STATUS BREAKDOWN */}
          <div className={`mt-4 p-5 rounded-2xl border ${styles.cardBg}`}>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black">
                  Order Status Breakdown
                </h3>
                <p className="text-[10px] opacity-50 mt-1">
                  Current status of incoming buyer orders.
                </p>
              </div>

              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              <div className={`p-3 rounded-xl border ${styles.statBg}`}>
                <p className="text-[9px] uppercase font-mono opacity-50">
                  Pending
                </p>
                <p className="text-lg font-black text-amber-400 mt-1">
                  {pendingOrders}
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${styles.statBg}`}>
                <p className="text-[9px] uppercase font-mono opacity-50">
                  Confirmed
                </p>
                <p className="text-lg font-black text-emerald-400 mt-1">
                  {confirmedOrders}
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${styles.statBg}`}>
                <p className="text-[9px] uppercase font-mono opacity-50">
                  Completed
                </p>
                <p className="text-lg font-black text-teal-400 mt-1">
                  {completedOrders}
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* ====================================================
            TABS
        ==================================================== */}

        <div className="flex space-x-2 mb-6 border-b border-slate-700/20 pb-3">

          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              activeTab === 'products'
                ? styles.tabActive
                : styles.tabInactive
            }`}
          >
            <Layers className="w-4 h-4" />
            My Produce ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              activeTab === 'orders'
                ? styles.tabActive
                : styles.tabInactive
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Direct Orders ({orders.length})
          </button>

        </div>

        {/* ====================================================
            PRODUCTS
        ==================================================== */}

        {activeTab === 'products' && (

          <div>

            {loading ? (

              <div className="text-center py-20">

                <div className="w-10 h-10 border-4 border-emerald-900 border-t-emerald-400 rounded-full animate-spin mx-auto mb-3"></div>

                <p className="text-xs font-mono tracking-wider opacity-60">
                  LOADING INVENTORY...
                </p>

              </div>

            ) : products.length === 0 ? (

              <div
                className={`border rounded-3xl p-12 text-center max-w-lg mx-auto ${styles.cardBg}`}
              >

                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl bg-black/10">
                  🌱
                </div>

                <h3 className="text-base font-bold mb-1">
                  No Active Produce Listings
                </h3>

                <p className="text-xs opacity-60 mb-6">
                  List your fresh harvest to start selling directly to buyers.
                </p>

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

                  <div
                    key={item.id}
                    className={`border rounded-3xl overflow-hidden transition flex flex-col justify-between ${styles.cardBg}`}
                  >

                    <div>

                      <div className="relative h-40 bg-black/20 overflow-hidden">

                        {item.image_url ? (

                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />

                        ) : (

                          <div className="w-full h-full flex items-center justify-center text-5xl">
                            🥦
                          </div>

                        )}

                        <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-white/20 text-emerald-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full">
                          {item.category}
                        </span>

                      </div>

                      <div className="p-5">

                        <h3 className="font-extrabold text-lg mb-2">
                          {item.title}
                        </h3>

                        <div
                          className={`grid grid-cols-2 gap-2 p-3 rounded-xl border mb-3 ${styles.statBg}`}
                        >

                          <div>

                            <span className="text-[9px] uppercase font-mono opacity-50 block">
                              Price
                            </span>

                            <span className="font-bold text-emerald-400 text-sm">
                              ₹{item.price_per_kg} / kg
                            </span>

                          </div>

                          <div>

                            <span className="text-[9px] uppercase font-mono opacity-50 block">
                              Stock
                            </span>

                            <span className="font-bold text-xs">
                              {item.quantity_available} kg
                            </span>

                          </div>

                        </div>

                        <p className="text-xs opacity-70 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          {item.location}
                        </p>

                      </div>

                    </div>

                    {/* PRODUCT ACTIONS */}

                    <div className="p-5 pt-0 grid grid-cols-2 gap-2">

                      <button
                        onClick={() =>
                          handleEditProduct(item)
                        }
                        className="py-2.5 rounded-xl border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >

                        <Pencil className="w-3.5 h-3.5" />

                        Edit Listing

                      </button>

                      <button
                        onClick={() =>
                          handleDeleteProduct(item.id)
                        }
                        className="py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >

                        <Trash2 className="w-3.5 h-3.5" />

                        Delete

                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        )}

        {/* ====================================================
            ORDERS
        ==================================================== */}

        {activeTab === 'orders' && (

          <div>

            {orders.length === 0 ? (

              <div
                className={`border rounded-3xl p-12 text-center max-w-lg mx-auto ${styles.cardBg}`}
              >

                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl bg-black/10">
                  📦
                </div>

                <h3 className="text-base font-bold mb-1">
                  No Orders Received Yet
                </h3>

                <p className="text-xs opacity-60">
                  Orders placed by buyers will appear here automatically.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {orders.map((ord) => {

                  const status =
                    getOrderStatus(ord.status);

                  const normalizedStatus =
                    String(
                      ord.status || 'pending'
                    ).toLowerCase();

                  const isPending =
                    normalizedStatus === 'pending';

                  return (

                    <div
                      key={ord.id}
                      className={`p-5 rounded-2xl border ${styles.cardBg}`}
                    >

                      <div className="flex flex-col lg:flex-row justify-between gap-5">

                        <div className="space-y-2">

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="font-extrabold text-base">
                              {ord.product_title}
                            </span>

                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Order #{ord.id}
                            </span>

                          </div>

                          <p className="text-xs opacity-70">
                            Buyer:{' '}
                            <span className="font-semibold">
                              {ord.buyer_name}
                            </span>{' '}
                            ({ord.buyer_email})
                          </p>

                          <p className="text-xs font-mono opacity-50">
                            Date:{' '}
                            {new Date(
                              ord.created_at
                            ).toLocaleDateString()}
                          </p>

                        </div>

                        <div className="flex items-center gap-6">

                          <div className="text-right">

                            <span className="text-[10px] uppercase font-mono opacity-50 block">
                              Quantity
                            </span>

                            <span className="font-bold text-sm">
                              {ord.quantity_kg} kg
                            </span>

                          </div>

                          <div className="text-right">

                            <span className="text-[10px] uppercase font-mono opacity-50 block">
                              Total Revenue
                            </span>

                            <span className="font-black text-emerald-400 text-base">
                              ₹{ord.total_price}
                            </span>

                          </div>

                        </div>

                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-700/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                        <div className="flex items-center gap-2">

                          <span className="text-[10px] uppercase font-mono font-bold opacity-50">
                            Order Status
                          </span>

                          <span
                            className={`px-3 py-1.5 rounded-full border text-[10px] font-black tracking-wider flex items-center gap-1.5 ${status.className}`}
                          >
                            {status.icon}
                            {status.label}
                          </span>

                        </div>

                        {isPending ? (

                          <div className="flex items-center gap-2">

                            <button
                              onClick={() =>
                                handleOrderStatusChange(
                                  ord.id,
                                  'confirmed'
                                )
                              }
                              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5"
                            >

                              <CheckCircle2 className="w-3.5 h-3.5" />

                              Confirm Order

                            </button>

                            <button
                              onClick={() =>
                                handleOrderStatusChange(
                                  ord.id,
                                  'rejected'
                                )
                              }
                              className="px-4 py-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition"
                            >
                              Reject Order
                            </button>

                          </div>

                        ) : (

                          <div className="flex items-center gap-1.5 text-[10px] font-mono opacity-50">

                            <ShieldCheck className="w-3.5 h-3.5" />

                            ORDER ACTION COMPLETED

                          </div>

                        )}

                      </div>

                    </div>

                  );

                })}

              </div>

            )}

          </div>

        )}

      </main>

      {/* ======================================================
          ADD PRODUCT MODAL
      ====================================================== */}

      {showAddModal && (

        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">

          <div
            className={`rounded-3xl max-w-lg w-full p-6 shadow-2xl border relative ${styles.modalBg}`}
          >

            <div className="flex justify-between items-start mb-4">

              <div>

                <h3 className="text-lg font-black uppercase tracking-tight">
                  Add Produce Listing
                </h3>

                <p className="text-xs opacity-60">
                  List your fresh crop directly on the marketplace.
                </p>

              </div>

              <button
                onClick={() =>
                  setShowAddModal(false)
                }
                className="opacity-50 hover:opacity-100 font-bold text-lg"
              >
                ✕
              </button>

            </div>

            {formError && (

              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl mb-4 text-xs font-medium">
                {formError}
              </div>

            )}

            {formSuccess && (

              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl mb-4 text-xs font-medium">
                {formSuccess}
              </div>

            )}

            <form
              onSubmit={handleAddProduct}
              className="space-y-4"
            >

              <div>

                <label className="block text-[10px] font-mono font-bold uppercase opacity-60 mb-1">
                  Crop Title
                </label>

                <input
                  type="text"
                  placeholder="e.g. Organic Tomatoes"
                  value={newProduct.title}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      title: e.target.value
                    })
                  }
                  className={`w-full px-4 py-2.5 border rounded-xl outline-none text-sm font-medium ${styles.modalInput}`}
                  required
                />

              </div>

              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block text-[10px] font-mono font-bold uppercase opacity-60 mb-1">
                    Category
                  </label>

                  <select
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        category: e.target.value
                      })
                    }
                    className={`w-full px-3 py-2.5 border rounded-xl outline-none text-sm font-medium ${styles.modalInput}`}
                  >

                    {categories.map((c) => (

                      <option
                        key={c}
                        value={c}
                        className="bg-slate-900 text-white"
                      >
                        {c}
                      </option>

                    ))}

                  </select>

                </div>

                <div>

                  <label className="block text-[10px] font-mono font-bold uppercase opacity-60 mb-1">
                    Price / kg (₹)
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    placeholder="40"
                    value={newProduct.price_per_kg}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        price_per_kg: e.target.value
                      })
                    }
                    className={`w-full px-4 py-2.5 border rounded-xl outline-none text-sm font-medium ${styles.modalInput}`}
                    required
                  />

                </div>

              </div>

              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block text-[10px] font-mono font-bold uppercase opacity-60 mb-1">
                    Available Quantity (kg)
                  </label>

                  <input
                    type="number"
                    placeholder="100"
                    value={newProduct.quantity_available}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        quantity_available: e.target.value
                      })
                    }
                    className={`w-full px-4 py-2.5 border rounded-xl outline-none text-sm font-medium ${styles.modalInput}`}
                    required
                  />

                </div>

                <div>

                  <label className="block text-[10px] font-mono font-bold uppercase opacity-60 mb-1">
                    Farm Location
                  </label>

                  <input
                    type="text"
                    placeholder="Nashik, Maharashtra"
                    value={newProduct.location}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        location: e.target.value
                      })
                    }
                    className={`w-full px-4 py-2.5 border rounded-xl outline-none text-sm font-medium ${styles.modalInput}`}
                    required
                  />

                </div>

              </div>

              <div>

                <label className="block text-[10px] font-mono font-bold uppercase opacity-60 mb-1">
                  Image URL (Optional)
                </label>

                <input
                  type="url"
                  placeholder="https://..."
                  value={newProduct.image_url}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      image_url: e.target.value
                    })
                  }
                  className={`w-full px-4 py-2.5 border rounded-xl outline-none text-sm font-medium ${styles.modalInput}`}
                />

              </div>

              <div className="flex justify-end space-x-2 pt-3">

                <button
                  type="button"
                  onClick={() =>
                    setShowAddModal(false)
                  }
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

      {/* ======================================================
          EDIT PRODUCT MODAL
      ====================================================== */}

      {editingProduct && (

        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">

          <div
            className={`rounded-3xl max-w-lg w-full p-6 shadow-2xl border relative ${styles.modalBg}`}
          >

            <div className="flex justify-between items-start mb-5">

              <div>

                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">

                  <Pencil className="w-4 h-4 text-emerald-400" />

                  Edit Produce Listing

                </h3>

                <p className="text-xs opacity-60 mt-1">
                  Modify your existing produce information.
                </p>

              </div>

              <button
                onClick={handleCloseEditModal}
                disabled={editLoading}
                className="opacity-50 hover:opacity-100 font-bold text-lg disabled:opacity-20"
              >
                ✕
              </button>

            </div>

            {/* EDIT ERROR */}

            {editError && (

              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl mb-4 text-xs font-medium">
                {editError}
              </div>

            )}

            {/* EDIT SUCCESS */}

            {editSuccess && (

              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl mb-4 text-xs font-medium">
                {editSuccess}
              </div>

            )}

            <form
              onSubmit={handleSaveProduct}
              className="space-y-4"
            >

              {/* CROP TITLE */}

              <div>

                <label className="block text-[10px] font-mono font-bold uppercase opacity-60 mb-1">
                  Crop Title
                </label>

                <input
                  type="text"
                  value={editingProduct.title || ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      title: e.target.value
                    })
                  }
                  className={`w-full px-4 py-2.5 border rounded-xl outline-none text-sm font-medium ${styles.modalInput}`}
                  required
                />

              </div>

              {/* CATEGORY + PRICE */}

              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block text-[10px] font-mono font-bold uppercase opacity-60 mb-1">
                    Category
                  </label>

                  <select
                    value={
                      editingProduct.category ||
                      'Vegetables'
                    }
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value
                      })
                    }
                    className={`w-full px-3 py-2.5 border rounded-xl outline-none text-sm font-medium ${styles.modalInput}`}
                  >

                    {categories.map((category) => (

                      <option
                        key={category}
                        value={category}
                        className="bg-slate-900 text-white"
                      >
                        {category}
                      </option>

                    ))}

                  </select>

                </div>

                <div>

                  <label className="block text-[10px] font-mono font-bold uppercase opacity-60 mb-1">
                    Price / kg (₹)
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    value={
                      editingProduct.price_per_kg ?? ''
                    }
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price_per_kg: e.target.value
                      })
                    }
                    className={`w-full px-4 py-2.5 border rounded-xl outline-none text-sm font-medium ${styles.modalInput}`}
                    required
                  />

                </div>

              </div>

              {/* QUANTITY + LOCATION */}

              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block text-[10px] font-mono font-bold uppercase opacity-60 mb-1">
                    Available Quantity (kg)
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    value={
                      editingProduct.quantity_available ??
                      ''
                    }
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        quantity_available:
                          e.target.value
                      })
                    }
                    className={`w-full px-4 py-2.5 border rounded-xl outline-none text-sm font-medium ${styles.modalInput}`}
                    required
                  />

                </div>

                <div>

                  <label className="block text-[10px] font-mono font-bold uppercase opacity-60 mb-1">
                    Farm Location
                  </label>

                  <input
                    type="text"
                    value={
                      editingProduct.location || ''
                    }
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        location: e.target.value
                      })
                    }
                    className={`w-full px-4 py-2.5 border rounded-xl outline-none text-sm font-medium ${styles.modalInput}`}
                    required
                  />

                </div>

              </div>

              {/* IMAGE URL */}

              <div>

                <label className="block text-[10px] font-mono font-bold uppercase opacity-60 mb-1">
                  Image URL (Optional)
                </label>

                <input
                  type="url"
                  value={
                    editingProduct.image_url || ''
                  }
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      image_url: e.target.value
                    })
                  }
                  className={`w-full px-4 py-2.5 border rounded-xl outline-none text-sm font-medium ${styles.modalInput}`}
                />

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-2 pt-3">

                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  disabled={editLoading}
                  className="px-5 py-2.5 border border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-800 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={editLoading}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 ${styles.btnPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
                >

                  {editLoading ? (

                    <>
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />

                      Saving...

                    </>

                  ) : (

                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />

                      Save Changes
                    </>

                  )}

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