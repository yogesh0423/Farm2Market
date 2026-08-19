import React, { useState, useEffect, useContext } from 'react';

import { LanguageContext } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import LanguageSelector from '../components/LanguageSelector';
import FarmerContactModal from '../components/FarmerContactModal';
import {
  createConversationId,
  upsertConversation
} from '../utils/conversationStorage';

import {
  Search,
  MapPin,
  Tag,
  IndianRupee,
  ShoppingBag,
  LogOut,
  ShieldCheck,
  Sprout,
  ArrowRight,
  Zap,
  SlidersHorizontal,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';

import { useNavigate, Link } from 'react-router-dom';


const Marketplace = () => {

  // ============================================================
  // CONTEXT
  // ============================================================

  const { lang, changeLanguage, t } =
    useContext(LanguageContext);

  const { user, token, logout } =
    useContext(AuthContext);

  const navigate = useNavigate();


  // ============================================================
  // STATE
  // ============================================================

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const [theme, setTheme] = useState('cyber');

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [contactFarmer, setContactFarmer] =
    useState(null);

  const [quantity, setQuantity] = useState(1);

  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');


  // ============================================================
  // CATEGORIES
  // ============================================================

  const categories = [
    {
      id: 'All',
      label: t('all'),
      icon: '⚡',
    },
    {
      id: 'Vegetables',
      label: t('vegetables'),
      icon: '🥬',
    },
    {
      id: 'Fruits',
      label: t('fruits'),
      icon: '🍎',
    },
    {
      id: 'Grains',
      label: t('grains'),
      icon: '🌾',
    },
    {
      id: 'Pulses',
      label: t('pulses'),
      icon: '🫘',
    },
    {
      id: 'Spices',
      label: t('spices'),
      icon: '🌶️',
    },
  ];


  // ============================================================
  // FETCH PRODUCTS
  // ============================================================

  useEffect(() => {
    fetchProducts();
  }, []);


  const fetchProducts = async () => {

    try {

      setLoading(true);

      const res = await API.get('/products');

      console.log(
        'PRODUCT API RESPONSE:',
        res.data
      );


      // ----------------------------------------------------------
      // Make sure response is an array
      // ----------------------------------------------------------

      let productList = [];

      if (Array.isArray(res.data)) {

        productList = res.data;

      } else if (
        Array.isArray(res.data.products)
      ) {

        productList = res.data.products;

      } else if (
        Array.isArray(res.data.data)
      ) {

        productList = res.data.data;

      } else {

        console.error(
          'Unexpected products API response:',
          res.data
        );

        productList = [];
      }


      // ----------------------------------------------------------
      // Normalize backend fields
      // ----------------------------------------------------------

      const normalizedProducts =
        productList.map((item) => {

          return {
            ...item,

            title:
              item.title ??
              item.name ??
              item.crop_title ??
              'Crop',

            category:
              item.category ??
              'General',

            price_per_kg:
              Number(
                item.price_per_kg ??
                item.price_per_unit ??
                item.price ??
                0
              ),

            quantity_available:
              Number(
                item.quantity_available ??
                item.available_quantity ??
                item.quantity ??
                0
              ),

            location:
              item.location ??
              item.farm_location ??
              item.description ??
              'Location not specified',

            farmer_name:
              item.farmer_name ??
              item.farmer?.name ??
              item.farmer?.username ??
              'Farmer',

            image_url:
              item.image_url ??
              null,
          };

        });


      console.log(
        'NORMALIZED PRODUCTS:',
        normalizedProducts
      );

      setProducts(normalizedProducts);

    } catch (err) {

      console.error(
        'Failed to load marketplace products:',
        err.response?.data || err
      );

      setProducts([]);

    } finally {

      setLoading(false);

    }

  };


  // ============================================================
  // PLACE ORDER
  // ============================================================

  const handlePlaceOrder = async (e) => {

    e.preventDefault();

    setOrderError('');
    setOrderSuccess('');


    // User must be logged in

    if (!token) {

      navigate('/login');

      return;
    }


    // Validate product

    if (!selectedProduct) {

      setOrderError(
        'Please select a product.'
      );

      return;
    }


    // Validate quantity

    const requestedQuantity =
      parseFloat(quantity);

    if (
      !requestedQuantity ||
      requestedQuantity <= 0
    ) {

      setOrderError(
        'Please enter a valid quantity.'
      );

      return;
    }


    if (
      requestedQuantity >
      selectedProduct.quantity_available
    ) {

      setOrderError(
        `Only ${selectedProduct.quantity_available} kg is available.`
      );

      return;
    }


    // Send order to backend

    try {

      await API.post('/orders', {

        product_id:
          selectedProduct.id,

        quantity_kg:
          requestedQuantity,

      });


      setOrderSuccess(
        '⚡ Order Executed Successfully!'
      );


      // Close modal and refresh products

      setTimeout(() => {

        setSelectedProduct(null);

        setOrderSuccess('');

        setOrderError('');

        setQuantity(1);

        fetchProducts();

      }, 1500);


    } catch (err) {

      console.error(
        'ORDER ERROR:',
        err.response?.data || err
      );


      setOrderError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to execute order.'
      );

    }

  };


  // ============================================================
  // FILTER PRODUCTS
  // ============================================================

  const safeProducts =
    Array.isArray(products)
      ? products
      : [];


  const filteredProducts =
    safeProducts.filter((item) => {

      const title =
        String(
          item?.title ?? ''
        ).toLowerCase();

      const location =
        String(
          item?.location ?? ''
        ).toLowerCase();

      const category =
        String(
          item?.category ?? ''
        ).toLowerCase();

      const search =
        searchTerm
          .toLowerCase()
          .trim();


      const matchesSearch =
        title.includes(search) ||
        location.includes(search);


      const matchesCategory =
        activeCategory === 'All' ||
        category ===
          activeCategory.toLowerCase();


      return (
        matchesSearch &&
        matchesCategory
      );

    });


  // ============================================================
  // THEME STYLES
  // ============================================================

  const styles = {

    cyber: {

      bg:
        'bg-[#080d0a] text-slate-100 selection:bg-emerald-500 selection:text-black',

      ticker:
        'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',

      header:
        'bg-[#0b130e]/80 border-emerald-900/30 text-white',

      logoText:
        'text-white',

      accentText:
        'text-emerald-400',

      badgeBg:
        'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',

      heroOverlay:
        'from-emerald-950 via-[#0b1710] to-[#080d0a]',

      searchContainer:
        'bg-[#121f16]/80 border-emerald-500/30 shadow-emerald-950/80',

      searchInput:
        'bg-[#0a120c] text-white placeholder-slate-500 border-emerald-900/40',

      filterBorder:
        'border-emerald-950',

      filterActive:
        'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]',

      filterInactive:
        'bg-[#0f1a12] text-slate-400 border-emerald-900/40 hover:border-emerald-700 hover:text-emerald-300',

      cardBg:
        'bg-[#0d1711] border-emerald-900/40 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',

      cardTitle:
        'text-white group-hover:text-emerald-300',

      cardStatBg:
        'bg-[#080d0a] border-emerald-900/30',

      btnPrimary:
        'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20',

      modalBg:
        'bg-[#0d1711] border-emerald-500/40',

      modalInput:
        'bg-[#080d0a] border-emerald-900/60 text-white focus:border-emerald-400',

    },


    dark: {

      bg:
        'bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white',

      ticker:
        'bg-slate-900 border-slate-800 text-slate-300',

      header:
        'bg-slate-900/90 border-slate-800 text-white',

      logoText:
        'text-white',

      accentText:
        'text-teal-400',

      badgeBg:
        'bg-teal-500/10 text-teal-300 border-teal-500/20',

      heroOverlay:
        'from-slate-900 via-slate-950 to-black',

      searchContainer:
        'bg-slate-900/80 border-slate-800 shadow-slate-950',

      searchInput:
        'bg-slate-950 text-white placeholder-slate-500 border-slate-800',

      filterBorder:
        'border-slate-800',

      filterActive:
        'bg-teal-500 text-slate-950 border-teal-400 shadow-md',

      filterInactive:
        'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200',

      cardBg:
        'bg-slate-900 border-slate-800 hover:border-teal-500/40 hover:shadow-xl',

      cardTitle:
        'text-white group-hover:text-teal-400',

      cardStatBg:
        'bg-slate-950 border-slate-800',

      btnPrimary:
        'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20',

      modalBg:
        'bg-slate-900 border-slate-800',

      modalInput:
        'bg-slate-950 border-slate-800 text-white focus:border-teal-400',

    },


    light: {

      bg:
        'bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white',

      ticker:
        'bg-emerald-50 border-emerald-100 text-emerald-800',

      header:
        'bg-white/90 border-slate-200 text-slate-900',

      logoText:
        'text-slate-900',

      accentText:
        'text-emerald-600',

      badgeBg:
        'bg-emerald-100 text-emerald-800 border-emerald-200',

      heroOverlay:
        'from-emerald-800 via-emerald-700 to-teal-800 text-white',

      searchContainer:
        'bg-white/20 border-white/30 shadow-xl',

      searchInput:
        'bg-white text-slate-800 placeholder-slate-400 border-slate-200',

      filterBorder:
        'border-slate-200',

      filterActive:
        'bg-emerald-600 text-white border-emerald-600 shadow-md',

      filterInactive:
        'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-slate-100',

      cardBg:
        'bg-white border-slate-200/80 hover:border-emerald-400 hover:shadow-xl',

      cardTitle:
        'text-slate-800 group-hover:text-emerald-700',

      cardStatBg:
        'bg-slate-50 border-slate-100',

      btnPrimary:
        'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',

      modalBg:
        'bg-white border-slate-200',

      modalInput:
        'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500',

    },

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
          TOP TICKER
      ====================================================== */}

      <div
        className={`
          border-b
          py-1.5
          px-4
          overflow-hidden
          text-[11px]
          font-mono
          flex
          items-center
          gap-6
          justify-between
          ${styles.ticker}
        `}
      >

        <div
          className="
            flex
            items-center
            gap-2
            shrink-0
          "
        >

          <span
            className="
              w-2
              h-2
              rounded-full
              bg-emerald-400
              animate-ping
            "
          />

          <span
            className="
              font-bold
              uppercase
              tracking-wider
            "
          >
            LIVE AGRI-EXCHANGE
          </span>

        </div>


        <div
          className="
            flex
            gap-8
            overflow-x-auto
            whitespace-nowrap
            scrollbar-none
            font-medium
          "
        >

          <span>
            🍅 Tomatoes:
            <span className="font-bold">
              ₹42/kg ↑
            </span>
          </span>


          <span>
            🧅 Onions:
            <span className="font-bold">
              ₹28/kg ↑
            </span>
          </span>


          <span>
            🌾 Organic Wheat:
            <span className="font-bold">
              ₹35/kg
            </span>
          </span>


          <span>
            🌶️ Chili (Guntur):
            <span
              className="
                text-rose-400
                font-bold
              "
            >
              ₹190/kg ↓
            </span>
          </span>

        </div>


        <div
          className="
            hidden
            md:flex
            items-center
            gap-1
            text-[10px]
          "
        >

          <ShieldCheck
            className="
              w-3
              h-3
              text-emerald-400
            "
          />

          Verified Decentralized Node

        </div>

      </div>


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

          {/* Logo */}

          <div
            className="
              flex
              items-center
              space-x-3
              cursor-pointer
              group
            "
            onClick={() => navigate('/')}
          >

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
                className="
                  w-full
                  h-full
                  bg-[#0d1711]
                  rounded-[15px]
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

            </div>


            <div>

              <span
                className={`
                  text-xl
                  font-black
                  tracking-tight
                  flex
                  items-center
                  gap-1
                  ${styles.logoText}
                `}
              >

                FARM

                <span className={styles.accentText}>
                  2
                </span>

                MARKET

              </span>

            </div>

          </div>


          {/* ==================================================
              RIGHT SIDE
          ================================================== */}

          <div
            className="
              flex
              items-center
              gap-2
              sm:gap-3
            "
          >

            {/* ==================================================
                THEME + LANGUAGE
            ================================================== */}

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              {/* Theme */}

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
                  backdrop-blur-md
                "
              >

                {/* Cyber */}

                <button
                  type="button"
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
                  title="Cyber-Agri Mode"
                >

                  <Monitor
                    className="
                      w-3.5
                      h-3.5
                    "
                  />

                </button>


                {/* Dark */}

                <button
                  type="button"
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
                    className="
                      w-3.5
                      h-3.5
                    "
                  />

                </button>


                {/* Light */}

                <button
                  type="button"
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
                    className="
                      w-3.5
                      h-3.5
                    "
                  />

                </button>

              </div>


              {/* ==================================================
                  LANGUAGE SELECTOR
                  ================================================== */}

              <LanguageSelector />

            </div>


            {/* ==================================================
                AUTHENTICATION
            ================================================== */}

            {token ? (

              <div
                className="
                  flex
                  items-center
                  space-x-3
                  p-1.5
                  pl-3
                  rounded-2xl
                  border
                  border-slate-700/30
                  bg-black/10
                "
              >

                <span
                  className="
                    text-xs
                    font-mono
                    flex
                    items-center
                    gap-2
                  "
                >

                  <span
                    className="
                      w-2
                      h-2
                      rounded-full
                      bg-emerald-400
                    "
                  />

                  {user?.name || 'User'}

                </span>


                {user?.role === 'farmer' && (

                  <button
                    onClick={() =>
                      navigate(
                        '/farmer/dashboard'
                      )
                    }
                    className={`
                      px-3
                      py-1.5
                      rounded-xl
                      text-xs
                      font-bold
                      flex
                      items-center
                      gap-1
                      ${styles.btnPrimary}
                    `}
                  >

                    Dashboard

                    <ArrowRight
                      className="
                        w-3
                        h-3
                      "
                    />

                  </button>

                )}


                <button
                  onClick={() => {

                    logout();

                    navigate('/login');

                  }}
                  className="
                    p-1.5
                    text-slate-400
                    hover:text-rose-400
                  "
                  title="Logout"
                >

                  <LogOut
                    className="
                      w-4
                      h-4
                    "
                  />

                </button>

              </div>

            ) : (

              <div
                className="
                  flex
                  items-center
                  space-x-2
                "
              >

                <Link
                  to="/login"
                  className="
                    px-3
                    py-2
                    text-xs
                    font-bold
                  "
                >
                  Sign In
                </Link>


                <Link
                  to="/register"
                  className={`
                    px-4
                    py-2
                    rounded-xl
                    text-xs
                    font-bold
                    ${styles.btnPrimary}
                  `}
                >
                  Register
                </Link>

              </div>

            )}

          </div>

        </div>

      </header>


      {/* ======================================================
          HERO
      ====================================================== */}

      <section
        className={`
          relative
          overflow-hidden
          pt-12
          pb-16
          px-4
          bg-gradient-to-br
          ${styles.heroOverlay}
        `}
      >

        <div
          className="
            relative
            max-w-5xl
            mx-auto
            text-center
            space-y-6
          "
        >

          {/* IMPORTANT:
              Language selector has intentionally been removed
              from here.
          */}


          {/* Direct Protocol */}

          <span
            className="
              inline-flex
              items-center
              gap-2
              px-3.5
              py-1.5
              rounded-full
              bg-emerald-500/10
              border
              border-emerald-500/30
              text-xs
              font-mono
            "
          >

            <Zap
              className="
                w-3.5
                h-3.5
                text-amber-400
              "
            />

            {t('directProtocol')}

          </span>


          {/* Hero Title */}

          <h1
            className="
              text-4xl
              sm:text-6xl
              font-black
              tracking-tight
              leading-none
            "
          >

            {t('heroTitleLine1')}

            <br />

            <span
              className="
                bg-gradient-to-r
                from-emerald-400
                via-teal-300
                to-amber-300
                bg-clip-text
                text-transparent
              "
            >

              {t('heroTitleLine2')}

            </span>

          </h1>


          {/* Hero Subtitle */}

          <p
            className="
              opacity-80
              max-w-xl
              mx-auto
              text-sm
              sm:text-base
            "
          >

            {t('heroSubtitle')}

          </p>


          {/* Search */}

          <div
            className="
              max-w-2xl
              mx-auto
              pt-2
            "
          >

            <div
              className={`
                p-1.5
                backdrop-blur-2xl
                border
                rounded-2xl
                shadow-2xl
                ${styles.searchContainer}
              `}
            >

              <div
                className="
                  relative
                  flex
                  items-center
                "
              >

                <Search
                  className="
                    absolute
                    left-4
                    opacity-50
                    w-5
                    h-5
                  "
                />


                <input
                  type="text"
                  placeholder={t(
                    'searchPlaceholder'
                  )}
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                  className={`
                    w-full
                    pl-12
                    pr-4
                    py-3.5
                    rounded-xl
                    text-sm
                    border
                    outline-none
                    ${styles.searchInput}
                  `}
                />

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          pt-10
        "
      >

        {/* ==================================================
            CATEGORY FILTERS
        ================================================== */}

        <div
          className={`
            flex
            flex-col
            sm:flex-row
            justify-between
            items-start
            sm:items-center
            gap-4
            mb-8
            pb-4
            border-b
            ${styles.filterBorder}
          `}
        >

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <SlidersHorizontal
              className="
                w-4
                h-4
                text-emerald-400
              "
            />

            <h2
              className="
                text-xs
                font-mono
                font-bold
                uppercase
                tracking-wider
                opacity-80
              "
            >

              {t('filterByProduce')}

            </h2>

          </div>


          <div
            className="
              flex
              space-x-2
              overflow-x-auto
              pb-2
              w-full
              sm:w-auto
            "
          >

            {categories.map((cat) => (

              <button
                key={cat.id}
                onClick={() =>
                  setActiveCategory(
                    cat.id
                  )
                }
                className={`
                  px-4
                  py-2
                  rounded-xl
                  text-xs
                  font-bold
                  transition-all
                  flex
                  items-center
                  gap-2
                  whitespace-nowrap
                  border
                  ${
                    activeCategory === cat.id
                      ? styles.filterActive
                      : styles.filterInactive
                  }
                `}
              >

                <span>
                  {cat.icon}
                </span>

                <span>
                  {cat.label}
                </span>

              </button>

            ))}

          </div>

        </div>


        {/* ==================================================
            PRODUCT GRID
        ================================================== */}

        {loading ? (

          <div
            className="
              text-center
              py-20
            "
          >

            <div
              className="
                w-12
                h-12
                border-4
                border-emerald-900
                border-t-emerald-400
                rounded-full
                animate-spin
                mx-auto
                mb-4
              "
            />

            <p
              className="
                text-xs
                font-mono
                tracking-wider
                opacity-70
              "
            >
              FETCHING PRODUCE LISTINGS...
            </p>

          </div>

        ) : filteredProducts.length === 0 ? (

          <div
            className={`
              border
              rounded-3xl
              p-12
              text-center
              max-w-lg
              mx-auto
              ${styles.cardBg}
            `}
          >

            <div
              className="
                w-16
                h-16
                rounded-2xl
                flex
                items-center
                justify-center
                mx-auto
                mb-4
                text-3xl
                bg-black/10
              "
            >
              🌽
            </div>


            <h3
              className="
                text-base
                font-bold
                mb-1
              "
            >
              No Produce Found
            </h3>


            <p
              className="
                text-xs
                opacity-60
                mb-6
              "
            >
              No produce matches your
              search or category filter.
            </p>


            <button
              onClick={() => {

                setSearchTerm('');

                setActiveCategory('All');

              }}
              className="
                text-xs
                text-emerald-400
                font-bold
                hover:underline
                font-mono
              "
            >
              [RESET FILTERS]
            </button>

          </div>

        ) : (

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-6
            "
          >

            {filteredProducts.map((item) => (

              <div
                key={item.id}
                className={`
                  group
                  relative
                  border
                  rounded-3xl
                  overflow-hidden
                  transition-all
                  duration-300
                  flex
                  flex-col
                  justify-between
                  ${styles.cardBg}
                `}
              >

                <div>

                  {/* Product image */}

                  <div
                    className="
                      relative
                      h-48
                      bg-black/20
                      overflow-hidden
                    "
                  >

                    {item.image_url ? (

                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="
                          w-full
                          h-full
                          object-cover
                          group-hover:scale-110
                          transition-transform
                          duration-700
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
                          text-6xl
                        "
                      >
                        🥬
                      </div>

                    )}


                    <div
                      className="
                        absolute
                        top-3
                        right-3
                        bg-black/70
                        backdrop-blur-md
                        border
                        border-white/20
                        text-emerald-300
                        text-[10px]
                        font-mono
                        font-bold
                        px-3
                        py-1
                        rounded-full
                      "
                    >
                      {item.category}
                    </div>

                  </div>


                  {/* Product details */}

                  <div className="p-6">

                    <h3
                      className={`
                        font-extrabold
                        text-xl
                        transition-colors
                        mb-1
                        ${styles.cardTitle}
                      `}
                    >
                      {item.title}
                    </h3>


                    <p
                      className="
                        text-xs
                        opacity-60
                        mb-5
                      "
                    >

                      Farmer:

                      <span
                        className="
                          font-semibold
                          opacity-100
                          ml-1
                        "
                      >
                        {item.farmer_name}
                      </span>

                    </p>


                    {/* Price / Stock */}

                    <div
                      className={`
                        grid
                        grid-cols-2
                        gap-3
                        p-3.5
                        rounded-2xl
                        border
                        mb-4
                        ${styles.cardStatBg}
                      `}
                    >

                      <div>

                        <span
                          className="
                            text-[9px]
                            uppercase
                            font-mono
                            font-bold
                            opacity-50
                            block
                          "
                        >
                          Unit Price
                        </span>


                        <span
                          className="
                            font-black
                            text-emerald-400
                            text-lg
                            flex
                            items-center
                          "
                        >

                          <IndianRupee
                            className="
                              w-4
                              h-4
                            "
                          />

                          {Number(
                            item.price_per_kg || 0
                          ).toFixed(2)}

                          <span
                            className="
                              text-[10px]
                              font-normal
                              opacity-60
                              ml-1
                            "
                          >
                            /kg
                          </span>

                        </span>

                      </div>


                      <div>

                        <span
                          className="
                            text-[9px]
                            uppercase
                            font-mono
                            font-bold
                            opacity-50
                            block
                          "
                        >
                          In Stock
                        </span>


                        <span
                          className="
                            font-bold
                            text-xs
                            flex
                            items-center
                            gap-1
                            mt-1
                            font-mono
                          "
                        >

                          <Tag
                            className="
                              w-3
                              h-3
                              text-emerald-400
                            "
                          />

                          {Number(
                            item.quantity_available ||
                              0
                          )}

                          kg

                        </span>

                      </div>

                    </div>


                    {/* Location */}

                    <p
                      className="
                        text-xs
                        opacity-70
                        flex
                        items-center
                        gap-1.5
                        font-medium
                      "
                    >

                      <MapPin
                        className="
                          w-3.5
                          h-3.5
                          text-emerald-400
                        "
                      />

                      {item.location}

                    </p>

                  </div>

                </div>


                {/* Buy button */}

                <div
                  className="
                    p-6
                    pt-0
                  "
                >

                  <button
                    onClick={() => {

                      if (!token) {

                        navigate('/login');

                        return;
                      }

                      setSelectedProduct(item);

                      setQuantity(1);

                      setOrderError('');

                      setOrderSuccess('');

                    }}
                    disabled={
                      item.quantity_available <= 0
                    }
                    className={`
                      w-full
                      py-3.5
                      rounded-2xl
                      text-xs
                      font-black
                      uppercase
                      tracking-wider
                      flex
                      items-center
                      justify-center
                      gap-2
                      transition-all
                      disabled:opacity-50
                      ${styles.btnPrimary}
                    `}
                  >

                    <ShoppingBag
                      className="
                        w-4
                        h-4
                      "
                    />

                    {item.quantity_available > 0
                      ? 'BUY PRODUCE NOW'
                      : 'OUT OF STOCK'}

                  </button>


                  <button
                    type="button"
                    onClick={() => {

                      if (!token) {

                        navigate('/login');

                        return;
                      }

                      const conversationId =
                        createConversationId(
                          item.farmer_name,
                          item.title
                        );

                      upsertConversation({
                        id: conversationId,
                        farmerName: item.farmer_name,
                        productTitle: item.title,
                        buyerName: user?.name || 'Buyer'
                      });

                      setContactFarmer(item);

                    }}
                    className="
                      w-full
                      mt-2
                      py-3
                      rounded-2xl
                      text-xs
                      font-black
                      uppercase
                      tracking-wider
                      flex
                      items-center
                      justify-center
                      gap-2
                      transition-all
                      border
                      border-emerald-500/30
                      text-emerald-400
                      hover:bg-emerald-500/10
                      hover:border-emerald-400
                    "
                  >

                    Contact Farmer

                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </main>


      {/* ======================================================
          FARMER CONTACT MODAL
      ====================================================== */}

      {contactFarmer && (

        <FarmerContactModal
          farmerName={
            contactFarmer.farmer_name
          }
          productTitle={
            contactFarmer.title
          }
          buyerName={
            user?.name || 'Buyer'
          }
          theme={theme}
          onClose={() =>
            setContactFarmer(null)
          }
        />

      )}


      {/* ======================================================
          ORDER MODAL
      ====================================================== */}

      {selectedProduct && (

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
              max-w-md
              w-full
              p-6
              shadow-2xl
              border
              relative
              ${styles.modalBg}
            `}
          >

            {/* Modal header */}

            <div
              className="
                flex
                justify-between
                items-start
                mb-4
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
                  Direct Purchase Order
                </h3>


                <p
                  className="
                    text-xs
                    text-emerald-400
                    font-mono
                  "
                >

                  {selectedProduct.title}

                  {' • '}

                  ₹
                  {Number(
                    selectedProduct.price_per_kg ||
                      0
                  ).toFixed(2)}

                  {' / kg'}

                </p>

              </div>


              <button
                onClick={() =>
                  setSelectedProduct(null)
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


            {/* Error */}

            {orderError && (

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
                {orderError}
              </div>

            )}


            {/* Success */}

            {orderSuccess && (

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
                {orderSuccess}
              </div>

            )}


            {/* Order form */}

            <form
              onSubmit={handlePlaceOrder}
              className="space-y-4"
            >

              <div>

                <label
                  className="
                    block
                    text-[10px]
                    font-mono
                    font-bold
                    opacity-60
                    uppercase
                    tracking-wider
                    mb-1
                  "
                >
                  Select Quantity (kg)
                </label>


                <input
                  type="number"
                  min="1"
                  max={
                    selectedProduct.quantity_available
                  }
                  step="0.1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      e.target.value
                    )
                  }
                  className={`
                    w-full
                    px-4
                    py-3
                    border
                    rounded-xl
                    outline-none
                    text-sm
                    font-bold
                    font-mono
                    ${styles.modalInput}
                  `}
                  required
                />

              </div>


              {/* Order summary */}

              <div
                className={`
                  p-4
                  rounded-xl
                  text-xs
                  space-y-2
                  border
                  font-mono
                  ${styles.cardStatBg}
                `}
              >

                <div
                  className="
                    flex
                    justify-between
                    opacity-60
                  "
                >

                  <span>
                    Unit Price:
                  </span>

                  <span>

                    ₹
                    {Number(
                      selectedProduct.price_per_kg ||
                        0
                    ).toFixed(2)}

                    {' / kg'}

                  </span>

                </div>


                <div
                  className="
                    flex
                    justify-between
                    opacity-60
                  "
                >

                  <span>
                    Quantity:
                  </span>

                  <span>

                    {parseFloat(quantity) || 0}
                    {' kg'}

                  </span>

                </div>


                <div
                  className="
                    flex
                    justify-between
                    font-bold
                    text-base
                    border-t
                    border-slate-700/30
                    pt-2
                  "
                >

                  <span>
                    Total Payable:
                  </span>


                  <span
                    className="
                      text-emerald-400
                    "
                  >

                    ₹

                    {(
                      Number(
                        selectedProduct.price_per_kg ||
                          0
                      ) *
                      (parseFloat(quantity) || 0)
                    ).toFixed(2)}

                  </span>

                </div>

              </div>


              {/* Buttons */}

              <div
                className="
                  flex
                  justify-end
                  space-x-2
                  pt-2
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setSelectedProduct(null)
                  }
                  className="
                    px-4
                    py-3
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
                    py-3
                    rounded-xl
                    text-xs
                    font-black
                    uppercase
                    tracking-wider
                    ${styles.btnPrimary}
                  `}
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