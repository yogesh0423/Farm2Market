

import React, {
  useState,
  useEffect,
  useContext
} from 'react';

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
  ShieldCheck,
  MessageCircle
} from 'lucide-react';

import {
  getConversations
} from '../utils/conversationStorage';


const FarmerDashboard = () => {

  const { user, logout } =
    useContext(AuthContext);

  const navigate = useNavigate();


  // ============================================================
  // DATA STATE
  // ============================================================

  const [products, setProducts] =
    useState([]);

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [conversations, setConversations] =
    useState([]);

  const [activeTab, setActiveTab] =
    useState('products');

  const [theme, setTheme] =
    useState('cyber');


  // ============================================================
  // ADD PRODUCT STATE
  // ============================================================

  const [newProduct, setNewProduct] =
    useState({
      title: '',
      category: 'Vegetables',
      price_per_kg: '',
      quantity_available: '',
      location: '',
      image_url: '',
      description: ''
    });

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [formError, setFormError] =
    useState('');

  const [formSuccess, setFormSuccess] =
    useState('');


  // ============================================================
  // EDIT PRODUCT STATE
  // ============================================================

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [editLoading, setEditLoading] =
    useState(false);

  const [editError, setEditError] =
    useState('');

  const [editSuccess, setEditSuccess] =
    useState('');


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
    loadConversations();

  }, []);


  const fetchDashboardData = async () => {

    try {

      setLoading(true);

      const [
        prodRes,
        orderRes
      ] = await Promise.all([
        API.get('/farmer/products'),
        API.get('/farmer/orders')
      ]);

      setProducts(
        Array.isArray(prodRes.data)
          ? prodRes.data
          : prodRes.data?.products || []
      );

      setOrders(
        Array.isArray(orderRes.data)
          ? orderRes.data
          : orderRes.data?.orders || []
      );

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
  // AUTO-REFRESH ORDERS
  // ============================================================

  useEffect(() => {

    if (!user?.id) return;

    const interval = setInterval(async () => {

      try {

        const response =
          await API.get('/farmer/orders');

        setOrders(
          Array.isArray(response.data)
            ? response.data
            : response.data?.orders || []
        );

      } catch (error) {

        console.error(
          'Failed to refresh farmer orders:',
          error
        );

      }

    }, 5000);

    return () => clearInterval(interval);

  }, [user?.id]);


  // ============================================================
  // LOAD CONVERSATIONS
  // ============================================================

  const loadConversations = () => {

    const allConversations =
      getConversations();

    const farmerConversations =
      allConversations.filter(
        (conversation) =>
          conversation.farmerName ===
          user?.name
      );

    setConversations(
      farmerConversations
    );

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
        title: newProduct.title,
        category: newProduct.category,
        price_per_unit: parseFloat(newProduct.price_per_kg),
        unit: 'kg',
        available_quantity: parseFloat(newProduct.quantity_available),
        image_url: newProduct.image_url || '',
        description: newProduct.description || ''
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
          image_url: '',
          description: ''
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

      await API.delete(
        `/products/${id}`
      );

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
      ...product,
      price_per_unit:
        product.price_per_unit ??
        product.pricePerUnit ??
        product.price ??
        product.price_per_kg ??
        0,
      available_quantity:
        product.available_quantity ??
        product.availableQuantity ??
        product.stock ??
        product.quantity_available ??
        0,
      image_url:
        product.image_url ??
        product.imageUrl ??
        '',
      description:
        product.description ?? ''
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

      const updatedProduct = {
        title: editingProduct.title,
        category: editingProduct.category,
        price_per_unit: parseFloat(
          editingProduct.price_per_unit ??
          editingProduct.price_per_kg ??
          editingProduct.price ??
          0
        ),
        unit: editingProduct.unit || 'kg',
        available_quantity: parseFloat(
          editingProduct.available_quantity ??
          editingProduct.quantity_available ??
          editingProduct.stock ??
          0
        ),
        image_url: editingProduct.image_url || '',
        description: editingProduct.description || ''
      };

      await API.put(
        `/products/${editingProduct.id}`,
        updatedProduct
      );

      setEditSuccess(
        '✨ Listing updated successfully!'
      );

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
  // PRODUCT FIELD HELPERS
  // ============================================================

  // Backend canonical fields:
  // price_per_unit, available_quantity, image_url.
  // Fallbacks keep older product records compatible.

  const getProductPrice = (product) =>
    Number(
      product?.price_per_unit ??
      product?.pricePerUnit ??
      product?.price ??
      product?.price_per_kg ??
      0
    );

  const getProductQuantity = (product) =>
    Number(
      product?.available_quantity ??
      product?.availableQuantity ??
      product?.stock ??
      product?.quantity_available ??
      0
    );

  const getProductLocation = (product) =>
    product?.farmer_location ||
    product?.location ||
    user?.location ||
    'Location not specified';

  const getProductImage = (product) =>
    product?.image_url ||
    product?.imageUrl ||
    '';


  // ============================================================
  // ORDER STATUS
  // ============================================================

  const [updatingOrderId, setUpdatingOrderId] =
    useState(null);

  const [orderActionError, setOrderActionError] =
    useState('');

  const handleOrderStatusChange = async (
    orderId,
    newStatus
  ) => {

    if (updatingOrderId) return;

    setUpdatingOrderId(orderId);
    setOrderActionError('');

    try {

      console.log(
        `UPDATING ORDER #${orderId} -> ${newStatus}`
      );

      // IMPORTANT:
      // Persist the status in the Flask/PostgreSQL backend.
      const response = await API.put(
        `/orders/${orderId}/status`,
        {
          status: newStatus
        }
      );

      console.log(
        'ORDER STATUS UPDATE RESPONSE:',
        response.data
      );

      const returnedOrder =
        response.data?.order || response.data;

      const updatedStatus =
        returnedOrder?.status || newStatus;

      // Update the screen immediately.
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          Number(order.id) === Number(orderId)
            ? {
                ...order,
                ...(returnedOrder &&
                typeof returnedOrder === 'object'
                  ? returnedOrder
                  : {}),
                status: updatedStatus
              }
            : order
        )
      );

      // Re-fetch from the database to verify
      // that PostgreSQL contains the new status.
      await fetchDashboardData();

    } catch (err) {

      console.error(
        'ORDER STATUS UPDATE ERROR:',
        err
      );

      console.error(
        'ORDER STATUS UPDATE RESPONSE:',
        err.response?.data
      );

      setOrderActionError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        `Failed to update order #${orderId}.`
      );

    } finally {

      setUpdatingOrderId(null);

    }

  };


  // ============================================================
// ORDER STATUS DISPLAY
// ============================================================

const getOrderStatus = (status) => {

  const normalizedStatus =
    String(
      status || 'pending'
    ).toLowerCase();


  // ============================================================
  // CONFIRMED
  // ============================================================

  if (
    normalizedStatus ===
    'confirmed'
  ) {

    return {

      label: 'CONFIRMED',

      className:
        'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',

      icon: (
        <CheckCircle2
          className="w-3.5 h-3.5"
        />
      )

    };

  }


  // ============================================================
  // SHIPPED
  // ============================================================

  if (
    normalizedStatus ===
    'shipped'
  ) {

    return {

      label: 'SHIPPED',

      className:
        'bg-blue-500/15 text-blue-300 border-blue-500/30',

      icon: (
        <span className="text-xs font-black">
          🚚
        </span>
      )

    };

  }


  // ============================================================
  // DELIVERED
  // ============================================================

  if (
    normalizedStatus ===
    'delivered'
  ) {

    return {

      label: 'DELIVERED',

      className:
        'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',

      icon: (
        <CheckCircle2
          className="w-3.5 h-3.5"
        />
      )

    };

  }


  // ============================================================
  // REJECTED
  // ============================================================

  if (
    normalizedStatus ===
    'rejected'
  ) {

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


  // ============================================================
  // PENDING
  // ============================================================

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

  const totalRevenue =
    orders.reduce(
      (sum, order) =>
        sum +
        (
          Number(
            order.total_price
          ) || 0
        ),
      0
    );


  const pendingOrders =
    orders.filter(
      (order) =>
        String(
          order.status ||
          'pending'
        ).toLowerCase() ===
        'pending'
    ).length;


  const confirmedOrders =
    orders.filter(
      (order) =>
        String(
          order.status || ''
        ).toLowerCase() ===
        'confirmed'
    ).length;


  const completedOrders =
    orders.filter(
      (order) =>
        [
          'delivered',
          'completed'
        ].includes(
          String(
            order.status || ''
          ).toLowerCase()
        )
    ).length;


  const totalQuantitySold =
    orders.reduce(
      (sum, order) =>
        sum +
        (
          Number(
            order.quantity_kg ??
            order.quantity ??
            0
          ) || 0
        ),
      0
    );


  const averageOrderValue =
    orders.length > 0
      ? totalRevenue /
        orders.length
      : 0;


  // ============================================================
  // PRODUCT PERFORMANCE
  // ============================================================

  const productPerformance =
    Object.values(

      orders.reduce(
        (acc, order) => {

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
            Number(
              order.quantity_kg
            ) || 0;


          acc[productName].revenue +=
            Number(
              order.total_price
            ) || 0;


          acc[productName].orderCount +=
            1;


          return acc;

        },
        {}
      )

    )
      .sort(
        (a, b) =>
          b.quantity -
          a.quantity
      )
      .slice(0, 5);


  const maxProductQuantity =
    productPerformance.length > 0
      ? Math.max(
          ...productPerformance.map(
            (product) =>
              product.quantity
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

      cardBg:
        'bg-[#0d1711] border-emerald-900/40 shadow-[0_0_30px_rgba(16,185,129,0.08)]',

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

      cardBg:
        'bg-slate-900 border-slate-800 shadow-xl',

      statBg:
        'bg-slate-950 border-slate-800',

      btnPrimary:
        'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20',

      tabActive:
        'bg-teal-500 text-slate-950 border-teal-400 shadow-md font-extrabold',

      tabInactive:
        'bg-slate-900 text-slate-400 border-slate-700 hover:text-white',

      modalBg:
        'bg-slate-900 border-slate-700',

      modalInput:
        'bg-slate-950 border-slate-700 text-white focus:border-teal-400'

    },


    light: {

      bg:
        'bg-slate-50 text-slate-900',

      header:
        'bg-white border-slate-200 text-slate-900',

      accentText:
        'text-emerald-600',

      cardBg:
        'bg-white border-slate-200 shadow-sm',

      statBg:
        'bg-slate-50 border-slate-200',

      btnPrimary:
        'bg-emerald-600 hover:bg-emerald-700 text-white',

      tabActive:
        'bg-emerald-600 text-white border-emerald-600 shadow-md font-extrabold',

      tabInactive:
        'bg-white text-slate-500 border-slate-200 hover:text-slate-900',

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
          TOP HEADER
      ====================================================== */}

      <header
        className={`
          sticky
          top-0
          z-40
          backdrop-blur-xl
          border-b
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
            py-3
            flex
            items-center
            justify-between
            gap-4
          "
        >

          {/* LOGO */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <div
              className="
                w-9
                h-9
                rounded-xl
                bg-emerald-500/10
                border
                border-emerald-500/20
                flex
                items-center
                justify-center
              "
            >

              <Sprout
                className="
                  w-5
                  h-5
                  text-emerald-400
                "
              />

            </div>

            <div>

              <p
                className="
                  font-black
                  tracking-tight
                "
              >
                Farm2Market
              </p>

              <p
                className="
                  text-[8px]
                  font-mono
                  opacity-50
                  uppercase
                  tracking-widest
                "
              >
                Farmer Console
              </p>

            </div>

          </div>


          {/* CONTROLS */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            {/* THEME */}

            <div
              className="
                hidden
                sm:flex
                items-center
                p-1
                rounded-2xl
                border
                border-slate-700/30
                bg-black/10
              "
            >

              <button
                onClick={() =>
                  setTheme('cyber')
                }
                className={`
                  p-1.5
                  rounded-xl
                  transition
                  ${
                    theme === 'cyber'
                      ? 'bg-emerald-500 text-black'
                      : 'text-slate-400 hover:text-white'
                  }
                `}
                title="Cyber Mode"
              >
                <Monitor
                  className="w-3.5 h-3.5"
                />
              </button>


              <button
                onClick={() =>
                  setTheme('dark')
                }
                className={`
                  p-1.5
                  rounded-xl
                  transition
                  ${
                    theme === 'dark'
                      ? 'bg-teal-500 text-black'
                      : 'text-slate-400 hover:text-white'
                  }
                `}
                title="Dark Mode"
              >
                <Moon
                  className="w-3.5 h-3.5"
                />
              </button>


              <button
                onClick={() =>
                  setTheme('light')
                }
                className={`
                  p-1.5
                  rounded-xl
                  transition
                  ${
                    theme === 'light'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-slate-700'
                  }
                `}
                title="Light Mode"
              >
                <Sun
                  className="w-3.5 h-3.5"
                />
              </button>

            </div>


            {/* MARKETPLACE */}

            <button
              onClick={() =>
                navigate('/')
              }
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

              <ArrowLeft
                className="w-4 h-4"
              />

              Marketplace

            </button>


            {/* LOGOUT */}

            <button
              onClick={() => {

                logout();

                navigate('/login');

              }}
              className="
                p-2
                text-slate-400
                hover:text-rose-400
                transition
              "
              title="Logout"
            >

              <LogOut
                className="w-4 h-4"
              />

            </button>

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

        {/* ====================================================
            WELCOME
        ==================================================== */}

        <div
          className="
            flex
            flex-col
            md:flex-row
            justify-between
            items-start
            md:items-center
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

              Welcome,{' '}
              {user?.name || 'Farmer'}
              {' '}👨‍🌾

            </h1>

            <p
              className="
                text-xs
                opacity-60
                mt-1
              "
            >
              Manage your crop inventory and monitor direct incoming orders.
            </p>

          </div>


          <button
            onClick={() =>
              setShowAddModal(true)
            }
            className={`
              px-5
              py-3
              rounded-2xl
              text-xs
              font-black
              uppercase
              tracking-wider
              flex
              items-center
              gap-2
              transition-all
              ${styles.btnPrimary}
            `}
          >

            <PlusCircle
              className="w-4 h-4"
            />

            Add Produce Listing

          </button>

        </div>


        {/* ====================================================
            MARKET ANALYTICS
        ==================================================== */}

        <section
          className="mb-8"
        >

          <div
            className="
              flex
              items-end
              justify-between
              mb-4
            "
          >

            <div>

              <p
                className="
                  text-[10px]
                  font-mono
                  font-bold
                  uppercase
                  tracking-wider
                  text-emerald-400
                "
              >
                Market Analytics
              </p>

              <h2
                className="
                  text-xl
                  font-black
                  tracking-tight
                  mt-1
                "
              >
                Business Snapshot
              </h2>

              <p
                className="
                  text-xs
                  opacity-60
                  mt-1
                "
              >
                Key sales metrics calculated from your incoming orders.
              </p>

            </div>


            <TrendingUp
              className="
                w-5
                h-5
                text-emerald-400
                opacity-70
              "
            />

          </div>


          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              gap-4
            "
          >

            {/* ACTIVE CROPS */}

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
                  justify-between
                  items-center
                  mb-2
                "
              >

                <span
                  className="
                    text-[10px]
                    font-mono
                    font-bold
                    uppercase
                    opacity-50
                  "
                >
                  Active Crops
                </span>

                <Package
                  className="
                    w-4
                    h-4
                    text-emerald-400
                  "
                />

              </div>

              <span
                className="
                  text-2xl
                  font-black
                "
              >
                {products.length}
              </span>

              <p
                className="
                  text-[10px]
                  opacity-50
                  mt-1
                "
              >
                Current listings
              </p>

            </div>


            {/* ORDERS */}

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
                  justify-between
                  items-center
                  mb-2
                "
              >

                <span
                  className="
                    text-[10px]
                    font-mono
                    font-bold
                    uppercase
                    opacity-50
                  "
                >
                  Total Orders
                </span>

                <ShoppingBag
                  className="
                    w-4
                    h-4
                    text-emerald-400
                  "
                />

              </div>

              <span
                className="
                  text-2xl
                  font-black
                "
              >
                {orders.length}
              </span>

              <p
                className="
                  text-[10px]
                  opacity-50
                  mt-1
                "
              >
                {pendingOrders} pending
              </p>

            </div>


            {/* QUANTITY */}

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
                  justify-between
                  items-center
                  mb-2
                "
              >

                <span
                  className="
                    text-[10px]
                    font-mono
                    font-bold
                    uppercase
                    opacity-50
                  "
                >
                  Quantity Sold
                </span>

                <Layers
                  className="
                    w-4
                    h-4
                    text-emerald-400
                  "
                />

              </div>

              <span
                className="
                  text-2xl
                  font-black
                "
              >
                {totalQuantitySold.toFixed(2)}
                {' '}kg
              </span>

              <p
                className="
                  text-[10px]
                  opacity-50
                  mt-1
                "
              >
                Across all orders
              </p>

            </div>


            {/* REVENUE */}

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
                  justify-between
                  items-center
                  mb-2
                "
              >

                <span
                  className="
                    text-[10px]
                    font-mono
                    font-bold
                    uppercase
                    opacity-50
                  "
                >
                  Gross Revenue
                </span>

                <TrendingUp
                  className="
                    w-4
                    h-4
                    text-emerald-400
                  "
                />

              </div>

              <span
                className="
                  text-2xl
                  font-black
                  text-emerald-400
                "
              >
                ₹{totalRevenue.toFixed(2)}
              </span>

              <p
                className="
                  text-[10px]
                  opacity-50
                  mt-1
                "
              >
                Avg. ₹
                {averageOrderValue.toFixed(2)}
                {' '} / order
              </p>

            </div>

          </div>

        </section>


        {/* ====================================================
            ORDER PERFORMANCE
        ==================================================== */}

        <section
          className="
            mb-8
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-4
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
                justify-between
                items-center
                mb-4
              "
            >

              <div>

                <p
                  className="
                    text-[10px]
                    font-mono
                    uppercase
                    opacity-50
                  "
                >
                  Order Status
                </p>

                <h3
                  className="
                    text-sm
                    font-black
                    mt-1
                  "
                >
                  Current Pipeline
                </h3>

              </div>

              <ShoppingBag
                className="
                  w-4
                  h-4
                  text-emerald-400
                "
              />

            </div>


            <div
              className="
                grid
                grid-cols-3
                gap-3
              "
            >

              <div
                className="
                  p-3
                  rounded-xl
                  bg-amber-500/10
                  border
                  border-amber-500/20
                "
              >

                <p
                  className="
                    text-[9px]
                    uppercase
                    font-mono
                    opacity-50
                  "
                >
                  Pending
                </p>

                <p
                  className="
                    text-xl
                    font-black
                    text-amber-400
                    mt-1
                  "
                >
                  {pendingOrders}
                </p>

              </div>


              <div
                className="
                  p-3
                  rounded-xl
                  bg-emerald-500/10
                  border
                  border-emerald-500/20
                "
              >

                <p
                  className="
                    text-[9px]
                    uppercase
                    font-mono
                    opacity-50
                  "
                >
                  Confirmed
                </p>

                <p
                  className="
                    text-xl
                    font-black
                    text-emerald-400
                    mt-1
                  "
                >
                  {confirmedOrders}
                </p>

              </div>


              <div
                className="
                  p-3
                  rounded-xl
                  bg-blue-500/10
                  border
                  border-blue-500/20
                "
              >

                <p
                  className="
                    text-[9px]
                    uppercase
                    font-mono
                    opacity-50
                  "
                >
                  Completed
                </p>

                <p
                  className="
                    text-xl
                    font-black
                    text-blue-400
                    mt-1
                  "
                >
                  {completedOrders}
                </p>

              </div>

            </div>

          </div>


          {/* PRODUCT PERFORMANCE */}

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
                justify-between
                items-center
                mb-4
              "
            >

              <div>

                <p
                  className="
                    text-[10px]
                    font-mono
                    uppercase
                    opacity-50
                  "
                >
                  Product Performance
                </p>

                <h3
                  className="
                    text-sm
                    font-black
                    mt-1
                  "
                >
                  Top Produce
                </h3>

              </div>

              <Layers
                className="
                  w-4
                  h-4
                  text-emerald-400
                "
              />

            </div>


            {productPerformance.length === 0 ? (

              <p
                className="
                  text-xs
                  opacity-50
                  py-4
                  text-center
                "
              >
                No product sales yet.
              </p>

            ) : (

              <div
                className="
                  space-y-3
                "
              >

                {productPerformance.map(
                  (product) => {

                    const percentage =
                      maxProductQuantity > 0
                        ? (
                            product.quantity /
                            maxProductQuantity
                          ) * 100
                        : 0;

                    return (

                      <div
                        key={product.name}
                      >

                        <div
                          className="
                            flex
                            justify-between
                            text-[10px]
                            mb-1
                          "
                        >

                          <span
                            className="
                              font-bold
                              truncate
                              max-w-[60%]
                            "
                          >
                            {product.name}
                          </span>

                          <span
                            className="
                              font-mono
                              opacity-60
                            "
                          >
                            {product.quantity.toFixed(1)}
                            {' '}kg
                          </span>

                        </div>


                        <div
                          className="
                            h-1.5
                            rounded-full
                            bg-black/10
                            overflow-hidden
                          "
                        >

                          <div
                            className="
                              h-full
                              rounded-full
                              bg-emerald-500
                            "
                            style={{
                              width:
                                `${percentage}%`
                            }}
                          />

                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            )}

          </div>

        </section>


        {/* ====================================================
            FARMER CONVERSATIONS
        ==================================================== */}

        <section
          className="
            mb-8
          "
        >

          <div
            className="
              flex
              items-end
              justify-between
              mb-4
            "
          >

            <div>

              <p
                className="
                  text-[10px]
                  font-mono
                  font-bold
                  uppercase
                  tracking-wider
                  text-emerald-400
                "
              >
                Buyer Communication
              </p>

              <h2
                className="
                  text-xl
                  font-black
                  tracking-tight
                  mt-1
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

                Farmer Conversations

              </h2>

              <p
                className="
                  text-xs
                  opacity-60
                  mt-1
                "
              >
                Conversations started by buyers about your produce.
              </p>

            </div>


            <span
              className="
                text-[10px]
                font-mono
                text-emerald-400
              "
            >
              {conversations.length}
              {' '}
              CONVERSATION
              {conversations.length === 1
                ? ''
                : 'S'}
            </span>

          </div>


          {conversations.length === 0 ? (

            <div
              className={`
                p-8
                rounded-2xl
                border
                text-center
                ${styles.cardBg}
              `}
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


              <h3
                className="
                  font-bold
                  text-sm
                "
              >
                No Buyer Conversations Yet
              </h3>


              <p
                className="
                  text-xs
                  opacity-50
                  mt-1
                "
              >
                Conversations started by buyers will appear here.
              </p>

            </div>

          ) : (

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                lg:grid-cols-3
                gap-4
              "
            >

              {conversations.map(
                (conversation) => {

                  const lastMessage =
                    conversation
                      .messages?.[
                        conversation
                          .messages.length - 1
                      ];

                  return (

                    <div
                      key={conversation.id}
                      className={`
                        p-5
                        rounded-2xl
                        border
                        transition
                        hover:border-emerald-500/40
                        ${styles.cardBg}
                      `}
                    >

                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-3
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-3
                            min-w-0
                          "
                        >

                          <div
                            className="
                              w-10
                              h-10
                              shrink-0
                              rounded-xl
                              bg-emerald-500/10
                              border
                              border-emerald-500/20
                              flex
                              items-center
                              justify-center
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


                          <div
                            className="
                              min-w-0
                            "
                          >

                            <p
                              className="
                                text-sm
                                font-black
                                truncate
                              "
                            >
                              {conversation.buyerName ||
                                'Buyer'}
                            </p>

                            <p
                              className="
                                text-[10px]
                                opacity-50
                                truncate
                              "
                            >
                              About{' '}
                              {conversation.productTitle}
                            </p>

                          </div>

                        </div>


                        <span
                          className="
                            text-[9px]
                            font-mono
                            text-emerald-400
                            whitespace-nowrap
                          "
                        >
                          {conversation.messages?.length ||
                            0}
                          {' '}msg
                        </span>

                      </div>


                      <div
                        className="
                          mt-4
                          p-3
                          rounded-xl
                          border
                          border-slate-700/20
                          bg-black/10
                        "
                      >

                        <p
                          className="
                            text-[9px]
                            uppercase
                            font-mono
                            opacity-40
                            mb-1
                          "
                        >
                          Latest Message
                        </p>

                        <p
                          className="
                            text-xs
                            opacity-70
                            line-clamp-2
                          "
                        >
                          {lastMessage?.text ||
                            'Conversation started.'}
                        </p>

                      </div>


                      <div
                        className="
                          mt-4
                          flex
                          items-center
                          gap-2
                          text-[9px]
                          font-mono
                          text-emerald-400
                        "
                      >

                        <span
                          className="
                            w-1.5
                            h-1.5
                            rounded-full
                            bg-emerald-400
                          "
                        />

                        BUYER CONTACT

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          )}

        </section>


        {/* ====================================================
            TABS
        ==================================================== */}

        <div
          className="
            flex
            space-x-2
            mb-6
            border-b
            border-slate-700/20
            pb-3
          "
        >

          <button
            onClick={() =>
              setActiveTab('products')
            }
            className={`
              px-5
              py-2.5
              rounded-xl
              border
              text-xs
              font-bold
              transition
              ${
                activeTab === 'products'
                  ? styles.tabActive
                  : styles.tabInactive
              }
            `}
          >

            My Produce

          </button>


          <button
            onClick={() =>
              setActiveTab('orders')
            }
            className={`
              px-5
              py-2.5
              rounded-xl
              border
              text-xs
              font-bold
              transition
              ${
                activeTab === 'orders'
                  ? styles.tabActive
                  : styles.tabInactive
              }
            `}
          >

            Direct Orders

          </button>

        </div>


        {/* ====================================================
            PRODUCTS
        ==================================================== */}

        {activeTab === 'products' && (

          <section>

            <div
              className="
                flex
                justify-between
                items-center
                mb-4
              "
            >

              <div>

                <h2
                  className="
                    text-xl
                    font-black
                  "
                >
                  My Produce
                </h2>

                <p
                  className="
                    text-xs
                    opacity-50
                    mt-1
                  "
                >
                  Manage your active marketplace listings.
                </p>

              </div>

            </div>


            {loading ? (

              <div
                className="
                  flex
                  justify-center
                  py-16
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

              </div>

            ) : products.length === 0 ? (

              <div
                className={`
                  p-10
                  rounded-2xl
                  border
                  text-center
                  ${styles.cardBg}
                `}
              >

                <Package
                  className="
                    w-10
                    h-10
                    text-emerald-400
                    mx-auto
                    mb-3
                  "
                />

                <h3
                  className="
                    font-bold
                  "
                >
                  No Produce Listings
                </h3>

                <p
                  className="
                    text-xs
                    opacity-50
                    mt-1
                  "
                >
                  Add your first produce listing to the marketplace.
                </p>

              </div>

            ) : (

              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  lg:grid-cols-3
                  gap-5
                "
              >

                {products.map(
                  (product) => (

                    <div
                      key={product.id}
                      className={`
                        rounded-2xl
                        border
                        overflow-hidden
                        ${styles.cardBg}
                      `}
                    >

                      <div
                        className="
                          h-40
                          bg-black/10
                          overflow-hidden
                        "
                      >

                        {getProductImage(product) ? (

                          <img
                            src={
                              getProductImage(product)
                            }
                            alt={
                              product.title
                            }
                            className="
                              w-full
                              h-full
                              object-cover
                            "
                            onError={(e) => {

                              e.currentTarget.style.display =
                                'none';

                            }}
                          />

                        ) : (

                          <div
                            className="
                              w-full
                              h-full
                              flex
                              items-center
                              justify-center
                              text-5xl
                            "
                          >
                            🌾
                          </div>

                        )}

                      </div>


                      <div
                        className="
                          p-5
                        "
                      >

                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-3
                          "
                        >

                          <div>

                            <h3
                              className="
                                font-black
                                text-lg
                              "
                            >
                              {product.title}
                            </h3>

                            <p
                              className="
                                text-[10px]
                                font-mono
                                text-emerald-400
                                mt-1
                              "
                            >
                              {product.category}
                            </p>

                          </div>

                          <span
                            className="
                              text-sm
                              font-black
                              text-emerald-400
                            "
                          >
                            ₹
                            {getProductPrice(product).toFixed(2)}
                            /{product.unit || 'kg'}
                          </span>

                        </div>


                        <div
                          className="
                            mt-4
                            space-y-2
                            text-xs
                            opacity-70
                          "
                        >

                          <p
                            className="
                              flex
                              items-center
                              gap-2
                            "
                          >

                            <Package
                              className="
                                w-3.5
                                h-3.5
                                text-emerald-400
                              "
                            />

                            {getProductQuantity(product)}
                            {' '}{product.unit || 'kg'} available

                          </p>


                          <p
                            className="
                              flex
                              items-center
                              gap-2
                            "
                          >

                            <MapPin
                              className="
                                w-3.5
                                h-3.5
                                text-emerald-400
                              "
                            />

                            {getProductLocation(product)}

                          </p>

                        </div>


                        <div
                          className="
                            flex
                            gap-2
                            mt-5
                          "
                        >

                          <button
                            onClick={() =>
                              handleEditProduct(
                                product
                              )
                            }
                            className="
                              flex-1
                              py-2.5
                              rounded-xl
                              border
                              border-emerald-500/30
                              text-emerald-400
                              text-xs
                              font-bold
                              hover:bg-emerald-500/10
                              transition
                              flex
                              items-center
                              justify-center
                              gap-2
                            "
                          >

                            <Pencil
                              className="w-3.5 h-3.5"
                            />

                            Edit

                          </button>


                          <button
                            onClick={() =>
                              handleDeleteProduct(
                                product.id
                              )
                            }
                            className="
                              px-4
                              py-2.5
                              rounded-xl
                              border
                              border-rose-500/30
                              text-rose-400
                              text-xs
                              font-bold
                              hover:bg-rose-500/10
                              transition
                            "
                          >

                            <Trash2
                              className="w-3.5 h-3.5"
                            />

                          </button>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        )}


        {/* ====================================================
            ORDERS
        ==================================================== */}

        {activeTab === 'orders' && (

          <section>

            <div
              className="
                mb-5
                flex
                flex-col
                sm:flex-row
                sm:items-end
                sm:justify-between
                gap-3
              "
            >

              <div>

                <h2
                  className="
                    text-xl
                    font-black
                  "
                >
                  Direct Orders
                </h2>

                <p
                  className="
                    text-xs
                    opacity-50
                    mt-1
                  "
                >
                  Manage incoming orders from buyers. Status is saved to the
                  PostgreSQL backend and refreshed automatically.
                </p>

              </div>

              <button
                type="button"
                onClick={fetchDashboardData}
                disabled={loading || updatingOrderId !== null}
                className="
                  px-4
                  py-2
                  rounded-xl
                  border
                  border-emerald-500/30
                  text-emerald-400
                  text-xs
                  font-bold
                  hover:bg-emerald-500/10
                  disabled:opacity-50
                  transition
                "
              >
                Refresh Orders
              </button>

            </div>


            {orderActionError && (
              <div
                className="
                  mb-4
                  p-3
                  rounded-xl
                  border
                  border-rose-500/30
                  bg-rose-500/10
                  text-rose-400
                  text-xs
                "
              >
                {orderActionError}
              </div>
            )}

            {orders.length === 0 ? (

              <div
                className={`
                  p-12
                  rounded-2xl
                  border
                  text-center
                  ${styles.cardBg}
                `}
              >

                <ShoppingBag
                  className="
                    w-10
                    h-10
                    text-emerald-400
                    mx-auto
                    mb-3
                  "
                />

                <h3
                  className="
                    font-bold
                  "
                >
                  No Orders Yet
                </h3>

                <p
                  className="
                    text-xs
                    opacity-50
                    mt-1
                  "
                >
                  Incoming buyer orders will appear here.
                </p>

              </div>

            ) : (

              <div
                className="
                  space-y-4
                "
              >

                {orders.map(
                  (ord) => {

                    const status =
                      getOrderStatus(
                        ord.status
                      );

                    const isPending =
                      String(
                        ord.status ||
                        'pending'
                      ).toLowerCase() ===
                      'pending';


                    return (

                      <div
                        key={ord.id}
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
                            flex-col
                            lg:flex-row
                            lg:items-center
                            justify-between
                            gap-4
                          "
                        >

                          <div
                            className="
                              grid
                              grid-cols-2
                              md:grid-cols-4
                              gap-4
                              flex-1
                            "
                          >

                            <div>

                              <p
                                className="
                                  text-[9px]
                                  font-mono
                                  uppercase
                                  opacity-40
                                "
                              >
                                Order
                              </p>

                              <p
                                className="
                                  text-sm
                                  font-black
                                  mt-1
                                "
                              >
                                #{ord.id}
                              </p>

                            </div>


                            <div>

                              <p
                                className="
                                  text-[9px]
                                  font-mono
                                  uppercase
                                  opacity-40
                                "
                              >
                                Product
                              </p>

                              <p
                                className="
                                  text-sm
                                  font-bold
                                  mt-1
                                "
                              >
                                {ord.product_title ||
                                  ord.product_name ||
                                  ord.product?.title ||
                                  'Produce'}
                              </p>

                            </div>


                            <div>

                              <p
                                className="
                                  text-[9px]
                                  font-mono
                                  uppercase
                                  opacity-40
                                "
                              >
                                Quantity
                              </p>

                              <p
                                className="
                                  text-sm
                                  font-bold
                                  mt-1
                                "
                              >
                                {Number(
                                  ord.quantity_kg ??
                                  ord.quantity ??
                                  0
                                )}
                                {' '}kg
                              </p>

                            </div>


                            <div>

                              <p
                                className="
                                  text-[9px]
                                  font-mono
                                  uppercase
                                  opacity-40
                                "
                              >
                                Total
                              </p>

                              <p
                                className="
                                  text-sm
                                  font-black
                                  text-emerald-400
                                  mt-1
                                "
                              >
                                ₹
                                {Number(
                                  ord.total_price ||
                                  0
                                ).toFixed(2)}
                              </p>

                            </div>

                          </div>


                          <div
                            className="
                              flex
                              flex-col
                              sm:flex-row
                              items-start
                              sm:items-center
                              gap-3
                            "
                          >

                            <span
                              className={`
                                px-3
                                py-1.5
                                rounded-full
                                border
                                text-[10px]
                                font-mono
                                font-bold
                                flex
                                items-center
                                gap-1.5
                                ${status.className}
                              `}
                            >

                              {status.icon}

                              {status.label}

                            </span>


                            {isPending ? (

                              <div
                                className="
                                  flex
                                  items-center
                                  gap-2
                                "
                              >

                                <button
                                  disabled={
                                    updatingOrderId === ord.id
                                  }
                                  onClick={() =>
                                    handleOrderStatusChange(
                                      ord.id,
                                      'confirmed'
                                    )
                                  }
                                  className="
                                    px-4
                                    py-2
                                    rounded-xl
                                    bg-emerald-500
                                    hover:bg-emerald-400
                                    text-slate-950
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                    text-xs
                                    font-black
                                    transition
                                    flex
                                    items-center
                                    gap-1.5
                                  "
                                >

                                  <CheckCircle2
                                    className="
                                      w-3.5
                                      h-3.5
                                    "
                                  />

                                  {updatingOrderId === ord.id
                                    ? 'Updating...'
                                    : 'Confirm Order'}

                                </button>


                                <button
                                  disabled={
                                    updatingOrderId === ord.id
                                  }
                                  onClick={() =>
                                    handleOrderStatusChange(
                                      ord.id,
                                      'rejected'
                                    )
                                  }
                                  className="
                                    px-4
                                    py-2
                                    rounded-xl
                                    border
                                    border-rose-500/30
                                    text-rose-400
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                    hover:bg-rose-500/10
                                    text-xs
                                    font-bold
                                    transition
                                  "
                                >
                                  {updatingOrderId === ord.id
                                    ? 'Updating...'
                                    : 'Reject Order'}
                                </button>

                              </div>

                            ) : (

                              <div
                                className="
                                  flex
                                  items-center
                                  gap-1.5
                                  text-[10px]
                                  font-mono
                                  opacity-50
                                "
                              >

                                <ShieldCheck
                                  className="
                                    w-3.5
                                    h-3.5
                                  "
                                />

                                ORDER ACTION COMPLETED

                              </div>

                            )}

                          </div>

                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            )}

          </section>

        )}

      </main>


      {/* ======================================================
          ADD PRODUCT MODAL
      ====================================================== */}

      {showAddModal && (

        <div
          className="
            fixed
            inset-0
            bg-black/80
            backdrop-blur-md
            flex
            items-center
            justify-center
            p-4
            z-50
          "
        >

          <div
            className={`
              rounded-3xl
              max-w-lg
              w-full
              p-6
              shadow-2xl
              border
              ${styles.modalBg}
            `}
          >

            <div
              className="
                flex
                justify-between
                items-start
                mb-5
              "
            >

              <div>

                <h3
                  className="
                    text-lg
                    font-black
                    uppercase
                    tracking-tight
                  "
                >
                  Add Produce Listing
                </h3>

                <p
                  className="
                    text-xs
                    opacity-60
                    mt-1
                  "
                >
                  List your fresh crop directly on the marketplace.
                </p>

              </div>


              <button
                onClick={() =>
                  setShowAddModal(false)
                }
                className="
                  opacity-50
                  hover:opacity-100
                  font-bold
                  text-lg
                "
              >
                ✕
              </button>

            </div>


            {formError && (

              <div
                className="
                  bg-rose-500/10
                  border
                  border-rose-500/30
                  text-rose-400
                  p-3
                  rounded-xl
                  mb-4
                  text-xs
                "
              >
                {formError}
              </div>

            )}


            {formSuccess && (

              <div
                className="
                  bg-emerald-500/10
                  border
                  border-emerald-500/30
                  text-emerald-300
                  p-3
                  rounded-xl
                  mb-4
                  text-xs
                "
              >
                {formSuccess}
              </div>

            )}


            <form
              onSubmit={handleAddProduct}
              className="space-y-4"
            >

              <div>

                <label
                  className="
                    block
                    text-[10px]
                    font-mono
                    font-bold
                    uppercase
                    opacity-60
                    mb-1
                  "
                >
                  Crop Title
                </label>

                <input
                  type="text"
                  placeholder="e.g. Organic Tomatoes"
                  value={
                    newProduct.title
                  }
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      title: e.target.value
                    })
                  }
                  className={`
                    w-full
                    px-4
                    py-2.5
                    border
                    rounded-xl
                    outline-none
                    text-sm
                    ${styles.modalInput}
                  `}
                  required
                />

              </div>


              <div
                className="
                  grid
                  grid-cols-2
                  gap-4
                "
              >

                <div>

                  <label
                    className="
                      block
                      text-[10px]
                      font-mono
                      font-bold
                      uppercase
                      opacity-60
                      mb-1
                    "
                  >
                    Category
                  </label>

                  <select
                    value={
                      newProduct.category
                    }
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        category:
                          e.target.value
                      })
                    }
                    className={`
                      w-full
                      px-4
                      py-2.5
                      border
                      rounded-xl
                      outline-none
                      text-sm
                      ${styles.modalInput}
                    `}
                  >

                    {categories.map(
                      (category) => (

                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>

                      )
                    )}

                  </select>

                </div>


                <div>

                  <label
                    className="
                      block
                      text-[10px]
                      font-mono
                      font-bold
                      uppercase
                      opacity-60
                      mb-1
                    "
                  >
                    Price / kg
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      newProduct.price_per_kg
                    }
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        price_per_kg:
                          e.target.value
                      })
                    }
                    className={`
                      w-full
                      px-4
                      py-2.5
                      border
                      rounded-xl
                      outline-none
                      text-sm
                      ${styles.modalInput}
                    `}
                    required
                  />

                </div>

              </div>


              <div>

                <label
                  className="
                    block
                    text-[10px]
                    font-mono
                    font-bold
                    uppercase
                    opacity-60
                    mb-1
                  "
                >
                  Quantity Available (kg)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    newProduct.quantity_available
                  }
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      quantity_available:
                        e.target.value
                    })
                  }
                  className={`
                    w-full
                    px-4
                    py-2.5
                    border
                    rounded-xl
                    outline-none
                    text-sm
                    ${styles.modalInput}
                  `}
                  required
                />

              </div>


              <div>

                <label
                  className="
                    block
                    text-[10px]
                    font-mono
                    font-bold
                    uppercase
                    opacity-60
                    mb-1
                  "
                >
                  Farm Location
                </label>

                <input
                  type="text"
                  value={
                    newProduct.location
                  }
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      location:
                        e.target.value
                    })
                  }
                  className={`
                    w-full
                    px-4
                    py-2.5
                    border
                    rounded-xl
                    outline-none
                    text-sm
                    ${styles.modalInput}
                  `}
                  required
                />

              </div>


              <div>

                <label
                  className="
                    block
                    text-[10px]
                    font-mono
                    font-bold
                    uppercase
                    opacity-60
                    mb-1
                  "
                >
                  Image URL (Optional)
                </label>

                <input
                  type="url"
                  value={
                    newProduct.image_url
                  }
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      image_url:
                        e.target.value
                    })
                  }
                  className={`
                    w-full
                    px-4
                    py-2.5
                    border
                    rounded-xl
                    outline-none
                    text-sm
                    ${styles.modalInput}
                  `}
                />

              </div>


              <div
                className="
                  flex
                  justify-end
                  gap-2
                  pt-3
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                  className="
                    px-5
                    py-2.5
                    border
                    border-slate-700
                    rounded-xl
                    text-xs
                    font-bold
                    hover:bg-slate-800
                  "
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className={`
                    px-6
                    py-2.5
                    rounded-xl
                    text-xs
                    font-black
                    uppercase
                    tracking-wider
                    transition
                    ${styles.btnPrimary}
                  `}
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

        <div
          className="
            fixed
            inset-0
            bg-black/80
            backdrop-blur-md
            flex
            items-center
            justify-center
            p-4
            z-50
          "
        >

          <div
            className={`
              rounded-3xl
              max-w-lg
              w-full
              p-6
              shadow-2xl
              border
              ${styles.modalBg}
            `}
          >

            <div
              className="
                flex
                justify-between
                items-start
                mb-5
              "
            >

              <div>

                <h3
                  className="
                    text-lg
                    font-black
                    uppercase
                    tracking-tight
                    flex
                    items-center
                    gap-2
                  "
                >

                  <Pencil
                    className="
                      w-4
                      h-4
                      text-emerald-400
                    "
                  />

                  Edit Produce Listing

                </h3>

                <p
                  className="
                    text-xs
                    opacity-60
                    mt-1
                  "
                >
                  Modify your existing produce information.
                </p>

              </div>


              <button
                onClick={
                  handleCloseEditModal
                }
                disabled={editLoading}
                className="
                  opacity-50
                  hover:opacity-100
                  font-bold
                  text-lg
                  disabled:opacity-20
                "
              >
                ✕
              </button>

            </div>


            {editError && (

              <div
                className="
                  bg-rose-500/10
                  border
                  border-rose-500/30
                  text-rose-400
                  p-3
                  rounded-xl
                  mb-4
                  text-xs
                "
              >
                {editError}
              </div>

            )}


            {editSuccess && (

              <div
                className="
                  bg-emerald-500/10
                  border
                  border-emerald-500/30
                  text-emerald-300
                  p-3
                  rounded-xl
                  mb-4
                  text-xs
                "
              >
                {editSuccess}
              </div>

            )}


            <form
              onSubmit={handleSaveProduct}
              className="space-y-4"
            >

              <div>

                <label
                  className="
                    block
                    text-[10px]
                    font-mono
                    font-bold
                    uppercase
                    opacity-60
                    mb-1
                  "
                >
                  Crop Title
                </label>

                <input
                  type="text"
                  value={
                    editingProduct.title ||
                    ''
                  }
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      title:
                        e.target.value
                    })
                  }
                  className={`
                    w-full
                    px-4
                    py-2.5
                    border
                    rounded-xl
                    outline-none
                    text-sm
                    ${styles.modalInput}
                  `}
                  required
                />

              </div>


              <div
                className="
                  grid
                  grid-cols-2
                  gap-4
                "
              >

                <div>

                  <label
                    className="
                      block
                      text-[10px]
                      font-mono
                      font-bold
                      uppercase
                      opacity-60
                      mb-1
                    "
                  >
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
                        category:
                          e.target.value
                      })
                    }
                    className={`
                      w-full
                      px-4
                      py-2.5
                      border
                      rounded-xl
                      outline-none
                      text-sm
                      ${styles.modalInput}
                    `}
                  >

                    {categories.map(
                      (category) => (

                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>

                      )
                    )}

                  </select>

                </div>


                <div>

                  <label
                    className="
                      block
                      text-[10px]
                      font-mono
                      font-bold
                      uppercase
                      opacity-60
                      mb-1
                    "
                  >
                    Price / kg
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      editingProduct.price_per_unit ??
                      editingProduct.price_per_kg ??
                      editingProduct.price ??
                      ''
                    }
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price_per_unit:
                          e.target.value
                      })
                    }
                    className={`
                      w-full
                      px-4
                      py-2.5
                      border
                      rounded-xl
                      outline-none
                      text-sm
                      ${styles.modalInput}
                    `}
                    required
                  />

                </div>

              </div>


              <div>

                <label
                  className="
                    block
                    text-[10px]
                    font-mono
                    font-bold
                    uppercase
                    opacity-60
                    mb-1
                  "
                >
                  Quantity Available (kg)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    editingProduct.available_quantity ??
                    editingProduct.quantity_available ??
                    editingProduct.stock ??
                    ''
                  }
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      available_quantity:
                        e.target.value
                    })
                  }
                  className={`
                    w-full
                    px-4
                    py-2.5
                    border
                    rounded-xl
                    outline-none
                    text-sm
                    ${styles.modalInput}
                  `}
                  required
                />

              </div>


              <div>

                <label
                  className="
                    block
                    text-[10px]
                    font-mono
                    font-bold
                    uppercase
                    opacity-60
                    mb-1
                  "
                >
                  Farm Location
                </label>

                <input
                  type="text"
                  value={
                    editingProduct.farmer_location ||
                    editingProduct.location ||
                    user?.location ||
                    ''
                  }
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      farmer_location:
                        e.target.value
                    })
                  }
                  className={`
                    w-full
                    px-4
                    py-2.5
                    border
                    rounded-xl
                    outline-none
                    text-sm
                    ${styles.modalInput}
                  `}
                  required
                />

              </div>


              <div>

                <label
                  className="
                    block
                    text-[10px]
                    font-mono
                    font-bold
                    uppercase
                    opacity-60
                    mb-1
                  "
                >
                  Image URL (Optional)
                </label>

                <input
                  type="url"
                  value={
                    editingProduct.image_url ||
                    ''
                  }
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      image_url:
                        e.target.value
                    })
                  }
                  className={`
                    w-full
                    px-4
                    py-2.5
                    border
                    rounded-xl
                    outline-none
                    text-sm
                    ${styles.modalInput}
                  `}
                />

              </div>


              <div
                className="
                  flex
                  justify-end
                  gap-2
                  pt-3
                "
              >

                <button
                  type="button"
                  onClick={
                    handleCloseEditModal
                  }
                  disabled={editLoading}
                  className="
                    px-5
                    py-2.5
                    border
                    border-slate-700
                    rounded-xl
                    text-xs
                    font-bold
                    hover:bg-slate-800
                    transition
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={editLoading}
                  className={`
                    px-6
                    py-2.5
                    rounded-xl
                    text-xs
                    font-black
                    uppercase
                    tracking-wider
                    transition
                    flex
                    items-center
                    gap-2
                    ${styles.btnPrimary}
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  `}
                >

                  {editLoading ? (

                    <>

                      <span
                        className="
                          w-3.5
                          h-3.5
                          border-2
                          border-current
                          border-t-transparent
                          rounded-full
                          animate-spin
                        "
                      />

                      Saving...

                    </>

                  ) : (

                    <>

                      <CheckCircle2
                        className="
                          w-3.5
                          h-3.5
                        "
                      />

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