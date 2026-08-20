import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';

import {
  getConversations
} from '../utils/conversationStorage';

import {
  Sprout,
  ShoppingBag,
  ArrowLeft,
  Monitor,
  Moon,
  Sun,
  Package,
  Truck,
  Wallet,
  RefreshCw,
  Search,
  MessageCircle,
  CheckCircle2,
  Clock3,
  XCircle
} from 'lucide-react';

const BuyerDashboard = () => {
  const { user } = useContext(AuthContext);

  // ============================================================
  // STATE
  // ============================================================

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [conversations, setConversations] = useState([]);

  const [theme, setTheme] = useState('cyber');

  // ============================================================
  // FETCH BUYER ORDERS
  // ============================================================

  const fetchBuyerOrders = useCallback(async (showFullLoader = false) => {
    try {
      if (showFullLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError('');

      const response = await API.get('/orders/my-orders');

      console.log(
        'BUYER ORDERS RESPONSE:',
        response.data
      );

      let orderList = [];

      if (Array.isArray(response.data)) {
        orderList = response.data;
      } else if (Array.isArray(response.data?.orders)) {
        orderList = response.data.orders;
      } else if (Array.isArray(response.data?.data)) {
        orderList = response.data.data;
      }

      console.log(
        'BUYER ORDERS:',
        orderList
      );

      setOrders(orderList);

    } catch (err) {
      console.error(
        'Error fetching buyer orders:',
        err.response?.data || err
      );

      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to load order history. Please try again.'
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ============================================================
  // LOAD CONVERSATIONS
  // ============================================================

  const loadConversations = useCallback(() => {
    try {
      setConversations(getConversations());
    } catch (err) {
      console.error(
        'Error loading conversations:',
        err
      );

      setConversations([]);
    }
  }, []);

  // ============================================================
  // INITIAL LOAD + AUTO REFRESH
  // ============================================================

  useEffect(() => {
    // Initial load
    fetchBuyerOrders(true);
    loadConversations();

    // Automatically check backend every 5 seconds.
    // This allows the buyer dashboard to see when
    // the farmer changes Pending -> Confirmed.
    const orderRefreshInterval = setInterval(() => {
      fetchBuyerOrders(false);
    }, 5000);

    // Refresh immediately when buyer returns to this tab.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchBuyerOrders(false);
        loadConversations();
      }
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    return () => {
      clearInterval(orderRefreshInterval);

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
    };
  }, [
    fetchBuyerOrders,
    loadConversations
  ]);

  // ============================================================
  // MANUAL REFRESH
  // ============================================================

  const handleRefresh = () => {
    fetchBuyerOrders(false);
    loadConversations();
  };

  // ============================================================
  // METRICS
  // ============================================================

  const totalOrders = orders.length;

  const activeOrders = orders.filter((order) =>
    [
      'pending',
      'confirmed',
      'processing',
      'shipped'
    ].includes(
      String(order.status || '').toLowerCase()
    )
  ).length;

  const totalSpent = orders.reduce(
    (sum, order) =>
      sum +
      (
        Number(
          order.total_price ||
          order.total ||
          0
        ) || 0
      ),
    0
  );

  // ============================================================
  // FILTER ORDERS
  // ============================================================

  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter(
          (order) =>
            String(order.status || '').toLowerCase() ===
            filterStatus.toLowerCase()
        );

  // ============================================================
  // STATUS BADGE
  // ============================================================

  const getStatusConfig = (status) => {
    const normalizedStatus =
      String(status || 'pending').toLowerCase();

    switch (normalizedStatus) {
      case 'delivered':
      case 'completed':
        return {
          label: status || 'Delivered',
          className:
            'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )
        };

      case 'shipped':
      case 'processing':
      case 'confirmed':
        return {
          label: status || 'Confirmed',
          className:
            'bg-blue-500/10 text-blue-400 border-blue-500/30',
          icon: (
            <Truck className="w-3.5 h-3.5" />
          )
        };

      case 'cancelled':
      case 'rejected':
        return {
          label: status || 'Cancelled',
          className:
            'bg-rose-500/10 text-rose-400 border-rose-500/30',
          icon: (
            <XCircle className="w-3.5 h-3.5" />
          )
        };

      default:
        return {
          label: status || 'Pending',
          className:
            'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: (
            <Clock3 className="w-3.5 h-3.5" />
          )
        };
    }
  };

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

      mutedText:
        'text-slate-400',

      cardBg:
        'bg-[#0d1711] border-emerald-900/40 shadow-[0_0_30px_rgba(16,185,129,0.08)]',

      statBg:
        'bg-[#080d0a] border-emerald-900/30',

      tableHeader:
        'border-emerald-900/30 text-slate-400',

      tableRow:
        'divide-emerald-900/20',

      rowHover:
        'hover:bg-emerald-500/5',

      tabActive:
        'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-extrabold',

      tabInactive:
        'bg-[#0f1a12] text-slate-400 border-emerald-900/40 hover:text-white',

      btnPrimary:
        'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20',

      input:
        'bg-[#080d0a] border-emerald-900/50 text-white focus:border-emerald-400',

      logoInner:
        'bg-[#0d1711]'
    },

    dark: {
      bg:
        'bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white',

      header:
        'bg-slate-900/90 border-slate-800 text-white',

      accentText:
        'text-teal-400',

      mutedText:
        'text-slate-400',

      cardBg:
        'bg-slate-900 border-slate-800 shadow-xl',

      statBg:
        'bg-slate-950 border-slate-800',

      tableHeader:
        'border-slate-800 text-slate-400',

      tableRow:
        'divide-slate-800',

      rowHover:
        'hover:bg-slate-800/40',

      tabActive:
        'bg-teal-500 text-slate-950 border-teal-400 shadow-md font-extrabold',

      tabInactive:
        'bg-slate-900 text-slate-400 border-slate-800 hover:text-white',

      btnPrimary:
        'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20',

      input:
        'bg-slate-950 border-slate-800 text-white focus:border-teal-400',

      logoInner:
        'bg-slate-900'
    },

    light: {
      bg:
        'bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white',

      header:
        'bg-white/90 border-slate-200 text-slate-900',

      accentText:
        'text-emerald-600',

      mutedText:
        'text-slate-500',

      cardBg:
        'bg-white border-slate-200/80 shadow-xl shadow-slate-200/50',

      statBg:
        'bg-slate-50 border-slate-100',

      tableHeader:
        'border-slate-200 text-slate-500',

      tableRow:
        'divide-slate-200',

      rowHover:
        'hover:bg-slate-50',

      tabActive:
        'bg-emerald-600 text-white border-emerald-600 shadow-md font-extrabold',

      tabInactive:
        'bg-white text-slate-600 border-slate-200 hover:bg-slate-100',

      btnPrimary:
        'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',

      input:
        'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500',

      logoInner:
        'bg-white'
    }
  }[theme];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className={`
        min-h-screen
        font-sans
        transition-colors
        duration-300
        pb-20
        ${styles.bg}
      `}
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header
        className={`
          backdrop-blur-xl
          border-b
          sticky
          top-0
          z-30
          transition-colors
          ${styles.header}
        `}
      >

        <div
          className="
            max-w-7xl
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            py-3.5
            flex
            justify-between
            items-center
          "
        >

          <div className="flex items-center space-x-3">

            <div
              className="
                w-10
                h-10
                rounded-2xl
                bg-gradient-to-br
                from-emerald-400
                via-teal-500
                to-emerald-700
                p-[1px]
                shadow-lg
                shadow-emerald-500/20
              "
            >

              <div
                className={`
                  w-full
                  h-full
                  rounded-[15px]
                  flex
                  items-center
                  justify-center
                  ${styles.logoInner}
                `}
              >

                <Sprout
                  className="
                    w-5
                    h-5
                    text-emerald-400
                  "
                />

              </div>

            </div>

            <div>

              <span
                className="
                  text-xl
                  font-black
                  tracking-tight
                  flex
                  items-center
                  gap-1
                "
              >

                FARM

                <span className={styles.accentText}>
                  2
                </span>

                MARKET

                <span
                  className="
                    text-[9px]
                    font-mono
                    px-1.5
                    py-0.5
                    rounded
                    border
                    border-emerald-500/30
                    text-emerald-400
                    bg-emerald-500/10
                  "
                >
                  BUYER NODE
                </span>

              </span>

            </div>

          </div>

          <div className="flex items-center gap-2 sm:gap-3">

            <div
              className="
                flex
                items-center
                p-1
                rounded-2xl
                border
                border-slate-700/30
                bg-black/10
                backdrop-blur-md
              "
            >

              <button
                onClick={() => setTheme('cyber')}
                className={`
                  p-1.5
                  rounded-xl
                  transition
                  ${
                    theme === 'cyber'
                      ? 'bg-emerald-500 text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }
                `}
                title="Cyber-Agri Mode"
              >

                <Monitor className="w-3.5 h-3.5" />

              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`
                  p-1.5
                  rounded-xl
                  transition
                  ${
                    theme === 'dark'
                      ? 'bg-teal-500 text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }
                `}
                title="Dark Mode"
              >

                <Moon className="w-3.5 h-3.5" />

              </button>

              <button
                onClick={() => setTheme('light')}
                className={`
                  p-1.5
                  rounded-xl
                  transition
                  ${
                    theme === 'light'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-700'
                  }
                `}
                title="Light Mode"
              >

                <Sun className="w-3.5 h-3.5" />

              </button>

            </div>

            <Link
              to="/"
              className="
                p-2
                text-xs
                font-bold
                flex
                items-center
                gap-1
                opacity-70
                hover:opacity-100
                transition
              "
            >

              <ArrowLeft className="w-4 h-4" />

              <span className="hidden sm:inline">
                Marketplace
              </span>

            </Link>

          </div>

        </div>

      </header>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          pt-8
        "
      >

        {/* PAGE INTRO */}

        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-4
            mb-8
          "
        >

          <div>

            <h1
              className="
                text-3xl
                font-black
                tracking-tight
                flex
                items-center
                gap-2
              "
            >
              Welcome back, {user?.name || 'Buyer'} 👋
            </h1>

            <p
              className={`
                text-sm
                mt-1
                ${styles.mutedText}
              `}
            >
              Track your fresh produce purchases and
              order history from local farmers.
            </p>

          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`
              self-start
              md:self-auto
              inline-flex
              items-center
              gap-2
              px-4
              py-2.5
              rounded-xl
              text-xs
              font-bold
              transition
              border
              border-emerald-500/30
              disabled:opacity-60
              ${styles.btnPrimary}
            `}
          >

            <RefreshCw
              className={`
                w-3.5
                h-3.5
                ${refreshing ? 'animate-spin' : ''}
              `}
            />

            {refreshing
              ? 'Checking...'
              : 'Refresh Orders'}

          </button>

        </div>

        {/* STATS */}

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-3
            gap-4
            mb-8
          "
        >

          <div
            className={`
              p-5
              rounded-2xl
              border
              ${styles.cardBg}
            `}
          >

            <div
              className="
                flex
                items-center
                justify-between
                mb-3
              "
            >

              <span
                className="
                  text-[10px]
                  font-mono
                  font-bold
                  uppercase
                  tracking-wider
                  opacity-60
                "
              >
                Total Orders
              </span>

              <div
                className="
                  p-2
                  rounded-xl
                  bg-emerald-500/10
                  text-emerald-400
                "
              >

                <Package className="w-4 h-4" />

              </div>

            </div>

            <span className="text-3xl font-black">
              {totalOrders}
            </span>

          </div>

          <div
            className={`
              p-5
              rounded-2xl
              border
              ${styles.cardBg}
            `}
          >

            <div
              className="
                flex
                items-center
                justify-between
                mb-3
              "
            >

              <span
                className="
                  text-[10px]
                  font-mono
                  font-bold
                  uppercase
                  tracking-wider
                  opacity-60
                "
              >
                Active Orders
              </span>

              <div
                className="
                  p-2
                  rounded-xl
                  bg-blue-500/10
                  text-blue-400
                "
              >

                <Truck className="w-4 h-4" />

              </div>

            </div>

            <span className="text-3xl font-black text-blue-400">
              {activeOrders}
            </span>

          </div>

          <div
            className={`
              p-5
              rounded-2xl
              border
              ${styles.cardBg}
            `}
          >

            <div
              className="
                flex
                items-center
                justify-between
                mb-3
              "
            >

              <span
                className="
                  text-[10px]
                  font-mono
                  font-bold
                  uppercase
                  tracking-wider
                  opacity-60
                "
              >
                Total Spent
              </span>

              <div
                className="
                  p-2
                  rounded-xl
                  bg-teal-500/10
                  text-teal-400
                "
              >

                <Wallet className="w-4 h-4" />

              </div>

            </div>

            <span
              className={`
                text-3xl
                font-black
                ${styles.accentText}
              `}
            >
              ₹{totalSpent.toFixed(2)}
            </span>

          </div>

        </div>

        {/* CONVERSATIONS */}

        <div
          className={`
            border
            rounded-3xl
            p-5
            sm:p-6
            mb-8
            ${styles.cardBg}
          `}
        >

          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-4
            "
          >

            <div>

              <h2
                className="
                  text-xl
                  font-black
                  tracking-tight
                  flex
                  items-center
                  gap-2
                "
              >

                <MessageCircle
                  className="
                    w-5
                    h-5
                    text-emerald-400
                  "
                />

                My Conversations

              </h2>

              <p
                className={`
                  text-xs
                  mt-1
                  ${styles.mutedText}
                `}
              >
                Connect directly with farmers about their produce.
              </p>

            </div>

            <Link
              to="/"
              className={`
                self-start
                sm:self-auto
                inline-flex
                items-center
                gap-2
                px-4
                py-2.5
                rounded-xl
                text-xs
                font-bold
                transition
                ${styles.btnPrimary}
              `}
            >

              <Search className="w-3.5 h-3.5" />

              Find a Farmer

            </Link>

          </div>

          {conversations.length === 0 ? (

            <div
              className="
                mt-6
                border
                border-dashed
                border-emerald-500/20
                rounded-2xl
                py-10
                px-5
                text-center
              "
            >

              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-emerald-500/10
                  flex
                  items-center
                  justify-center
                  mx-auto
                  mb-4
                "
              >

                <MessageCircle
                  className="
                    w-6
                    h-6
                    text-emerald-400
                  "
                />

              </div>

              <h3 className="font-bold text-sm">
                No Conversations Yet
              </h3>

              <p
                className={`
                  text-xs
                  mt-1
                  max-w-md
                  mx-auto
                  ${styles.mutedText}
                `}
              >
                Your conversations with farmers will appear here
                after you contact a farmer from the marketplace.
              </p>

              <Link
                to="/"
                className={`
                  inline-flex
                  items-center
                  gap-2
                  mt-5
                  px-5
                  py-2.5
                  rounded-xl
                  text-xs
                  font-bold
                  transition
                  ${styles.btnPrimary}
                `}
              >

                <ShoppingBag className="w-3.5 h-3.5" />

                Browse Marketplace

              </Link>

            </div>

          ) : (

            <div className="mt-6 space-y-3">

              {conversations.map((conversation) => {

                const lastMessage =
                  conversation.messages?.[
                    conversation.messages.length - 1
                  ];

                return (

                  <div
                    key={conversation.id}
                    className={`
                      w-full
                      text-left
                      p-4
                      rounded-2xl
                      border
                      transition
                      ${styles.statBg}
                      ${styles.rowHover}
                    `}
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className="
                          w-10
                          h-10
                          rounded-xl
                          bg-emerald-500/10
                          flex
                          items-center
                          justify-center
                          shrink-0
                        "
                      >

                        <MessageCircle
                          className="
                            w-4
                            h-4
                            text-emerald-400
                          "
                        />

                      </div>

                      <div className="min-w-0 flex-1">

                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            gap-3
                          "
                        >

                          <p className="text-sm font-bold truncate">
                            {conversation.farmerName}
                          </p>

                          <span
                            className={`
                              text-[10px]
                              ${styles.mutedText}
                            `}
                          >
                            {conversation.messages?.length || 0} msg
                          </span>

                        </div>

                        <p
                          className={`
                            text-xs
                            mt-1
                            truncate
                            ${styles.mutedText}
                          `}
                        >
                          {conversation.productTitle}
                          {' · '}
                          {lastMessage?.text || 'Conversation started.'}
                        </p>

                      </div>

                    </div>

                  </div>

                );

              })}

            </div>

          )}

        </div>

        {/* ====================================================
            ORDER HISTORY
        ==================================================== */}

        <div
          className={`
            border
            rounded-3xl
            p-5
            sm:p-6
            space-y-6
            ${styles.cardBg}
          `}
        >

          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-4
            "
          >

            <div>

              <h2
                className="
                  text-xl
                  font-black
                  tracking-tight
                  flex
                  items-center
                  gap-2
                "
              >

                <ShoppingBag
                  className="
                    w-5
                    h-5
                    text-emerald-400
                  "
                />

                My Orders

              </h2>

              <p
                className={`
                  text-xs
                  mt-1
                  ${styles.mutedText}
                `}
              >
                View and track all your marketplace purchases.
              </p>

            </div>

            <div
              className="
                flex
                items-center
                gap-2
                overflow-x-auto
                pb-1
              "
            >

              {[
                'all',
                'pending',
                'confirmed',
                'shipped',
                'delivered',
                'cancelled'
              ].map((status) => (

                <button
                  key={status}
                  onClick={() =>
                    setFilterStatus(status)
                  }
                  className={`
                    px-3
                    py-1.5
                    text-[11px]
                    font-bold
                    rounded-lg
                    capitalize
                    transition-all
                    whitespace-nowrap
                    border
                    ${
                      filterStatus === status
                        ? styles.tabActive
                        : styles.tabInactive
                    }
                  `}
                >
                  {status}
                </button>

              ))}

            </div>

          </div>

          {/* ERROR */}

          {error && (

            <div
              className="
                bg-rose-500/10
                border
                border-rose-500/40
                text-rose-400
                p-4
                rounded-xl
                text-sm
                flex
                items-center
                justify-between
                gap-3
              "
            >

              <span>
                {error}
              </span>

              <button
                onClick={() =>
                  fetchBuyerOrders(false)
                }
                className="
                  text-xs
                  font-bold
                  underline
                  hover:no-underline
                "
              >
                Retry
              </button>

            </div>

          )}

          {/* LOADING */}

          {loading ? (

            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                py-16
                gap-3
              "
            >

              <div
                className="
                  w-9
                  h-9
                  border-4
                  border-emerald-900
                  border-t-emerald-400
                  rounded-full
                  animate-spin
                "
              />

              <p
                className="
                  text-[10px]
                  font-mono
                  tracking-wider
                  opacity-60
                "
              >
                LOADING ORDER HISTORY...
              </p>

            </div>

          ) : filteredOrders.length === 0 ? (

            <div
              className="
                text-center
                py-16
                space-y-4
              "
            >

              <div
                className="
                  w-16
                  h-16
                  rounded-2xl
                  bg-emerald-500/10
                  flex
                  items-center
                  justify-center
                  mx-auto
                  text-3xl
                "
              >
                🌾
              </div>

              <div>

                <h3 className="font-bold text-base">
                  No Orders Found
                </h3>

                <p
                  className={`
                    text-xs
                    mt-1
                    ${styles.mutedText}
                  `}
                >
                  {filterStatus === 'all'
                    ? 'You have not placed any orders yet.'
                    : `No ${filterStatus} orders found.`}
                </p>

              </div>

              <Link
                to="/"
                className={`
                  inline-flex
                  items-center
                  gap-2
                  px-5
                  py-2.5
                  rounded-xl
                  text-xs
                  font-bold
                  transition
                  ${styles.btnPrimary}
                `}
              >

                <Search className="w-3.5 h-3.5" />

                Explore Marketplace

              </Link>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-left border-collapse">

                <thead>

                  <tr
                    className={`
                      border-b
                      text-[10px]
                      font-mono
                      font-bold
                      uppercase
                      tracking-wider
                      ${styles.tableHeader}
                    `}
                  >

                    <th className="py-4 px-4">
                      Order ID
                    </th>

                    <th className="py-4 px-4">
                      Product / Details
                    </th>

                    <th className="py-4 px-4">
                      Quantity
                    </th>

                    <th className="py-4 px-4">
                      Total Price
                    </th>

                    <th className="py-4 px-4">
                      Status
                    </th>

                    <th className="py-4 px-4 text-right">
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody
                  className={`
                    divide-y
                    text-sm
                    ${styles.tableRow}
                  `}
                >

                  {filteredOrders.map((order) => {

                    const status =
                      getStatusConfig(order.status);

                    return (

                      <tr
                        key={order.id}
                        className={`
                          transition-colors
                          ${styles.rowHover}
                        `}
                      >

                        <td
                          className="
                            py-4
                            px-4
                            font-mono
                            text-emerald-400
                            text-xs
                          "
                        >
                          #
                          {order.id
                            ?.toString()
                            .slice(-6) ||
                            order.order_id}
                        </td>

                        <td
                          className="
                            py-4
                            px-4
                            font-semibold
                          "
                        >

                          {order.product_name ||
                            order.product_title ||
                            order.product?.name ||
                            'Fresh Produce'}

                        </td>

                        <td
                          className="
                            py-4
                            px-4
                            opacity-80
                          "
                        >

                          {order.quantity}

                          {' '}

                          {order.unit || 'kg'}

                        </td>

                        <td
                          className="
                            py-4
                            px-4
                            font-black
                          "
                        >

                          ₹
                          {(
                            Number(
                              order.total_price ||
                              order.total ||
                              0
                            ) || 0
                          ).toFixed(2)}

                        </td>

                        <td className="py-4 px-4">

                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-1.5
                              px-3
                              py-1.5
                              text-[10px]
                              font-black
                              uppercase
                              tracking-wider
                              rounded-full
                              border
                              ${status.className}
                            `}
                          >

                            {status.icon}

                            {status.label}

                          </span>

                        </td>

                        <td
                          className={`
                            py-4
                            px-4
                            text-right
                            text-xs
                            ${styles.mutedText}
                          `}
                        >

                          {order.created_at
                            ? new Date(
                                order.created_at
                              ).toLocaleDateString()
                            : 'Recent'}

                        </td>

                      </tr>

                    );

                  })}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

    </div>
  );
};

export default BuyerDashboard;