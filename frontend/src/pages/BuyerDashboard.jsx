import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';

const BuyerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchBuyerOrders();
  }, []);

  const fetchBuyerOrders = async () => {
    try {
      setLoading(true);
      // Fetch orders placed by the current logged-in buyer
      const response = await API.get('/orders/my-orders');
      setOrders(response.data?.orders || response.data || []);
    } catch (err) {
      console.error('Error fetching buyer orders:', err);
      setError('Failed to load order history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Metrics calculations
  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => ['Pending', 'Confirmed', 'Processing', 'Shipped'].includes(o.status)).length;
  const totalSpent = orders.reduce((sum, order) => sum + (Number(order.total_price || order.total) || 0), 0);

  // Filtered orders list
  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status?.toLowerCase() === filterStatus.toLowerCase());

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'shipped':
      case 'processing':
      case 'confirmed':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 px-4 sm:px-6 lg:px-8 py-10 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-900/60 backdrop-blur-xl border border-gray-800/80 p-6 rounded-2xl">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              Welcome back, {user?.name || 'Buyer'} 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Track your fresh produce purchases and order history from local farmers.
            </p>
          </div>

          <Link
            to="/"
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Browse Marketplace
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Orders</span>
              <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">📦</span>
            </div>
            <div className="text-3xl font-black text-gray-100 mt-3">{totalOrders}</div>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Orders</span>
              <span className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">🚚</span>
            </div>
            <div className="text-3xl font-black text-blue-400 mt-3">{activeOrders}</div>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Spent</span>
              <span className="p-2 bg-teal-500/10 text-teal-400 rounded-xl">💰</span>
            </div>
            <div className="text-3xl font-black text-emerald-400 mt-3">₹{totalSpent.toFixed(2)}</div>
          </div>
        </div>

        {/* Order History Table */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-100">My Orders</h2>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all whitespace-nowrap ${
                    filterStatus === status
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-gray-800/60 text-gray-400 hover:text-gray-200 border border-transparent'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12 text-emerald-400">
              <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="text-4xl">🌾</div>
              <p className="text-gray-400 text-sm">No orders found matching this status.</p>
              <Link to="/" className="inline-block text-xs font-semibold text-emerald-400 hover:underline">
                Explore products in the marketplace →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <th className="py-4 px-4">Order ID</th>
                    <th className="py-4 px-4">Product / Details</th>
                    <th className="py-4 px-4">Quantity</th>
                    <th className="py-4 px-4">Total Price</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-sm">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="py-4 px-4 font-mono text-emerald-400 text-xs">
                        #{order.id?.toString().slice(-6) || order.order_id}
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-200">
                        {order.product_name || order.product?.name || 'Fresh Produce'}
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {order.quantity} {order.unit || 'kg'}
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-100">
                        ₹{(Number(order.total_price || order.total) || 0).toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(order.status)}`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-xs text-gray-400">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Recent'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BuyerDashboard;