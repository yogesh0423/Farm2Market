import React, { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

export const translations = {
  en: {
    // Navbar
    brand: "Farm2Market",
    marketplace: "Marketplace",
    farmerDashboard: "Farmer Dashboard",
    buyerDashboard: "Buyer Dashboard",
    myOrders: "My Orders",
    login: "Sign In",
    register: "Register",
    logout: "Logout",

    // Hero Section
    directProtocol: "DIRECT FARMER-TO-BUYER PROTOCOL",
    heroTitleLine1: "Cut Out The Middlemen.",
    heroTitleLine2: "Empower Direct Farmers.",
    heroSubtitle: "Buy farm-fresh harvests directly from verified regional cultivators with zero markups.",
    searchPlaceholder: "Search organic produce, crops, locations...",

    // Categories
    filterByProduce: "FILTER BY PRODUCE",
    all: "All",
    vegetables: "Vegetables",
    fruits: "Fruits",
    grains: "Grains",
    pulses: "Pulses",
    spices: "Spices",

    // Product Card
    perKg: "per kg",
    availableQty: "Available Qty",
    farmLocation: "Farm Location",
    buyNow: "Place Order",
    outOfStock: "Out of Stock",

    // Buyer Dashboard
    welcomeBack: "Welcome back",
    buyerSubtext: "Track your fresh produce purchases and order history from local farmers.",
    totalOrders: "Total Orders",
    activeOrders: "Active Orders",
    totalSpent: "Total Spent",
    orderId: "Order ID",
    productDetails: "Product / Details",
    quantity: "Quantity",
    totalPrice: "Total Price",
    status: "Status",
    date: "Date",
    noOrders: "No orders found matching this status.",

    // Order Statuses
    pending: "Pending",
    confirmed: "Confirmed",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  },
  hi: {
    // Navbar
    brand: "फार्म2मार्केट",
    marketplace: "मार्केटप्लेस",
    farmerDashboard: "किसान डैशबोर्ड",
    buyerDashboard: "खरीदार डैशबोर्ड",
    myOrders: "मेरे ऑर्डर",
    login: "साइन इन करें",
    register: "पंजीकरण करें",
    logout: "लॉगआउट",

    // Hero Section
    directProtocol: "प्रत्यक्ष किसान-से-खरीदार नेटवर्क",
    heroTitleLine1: "बिचौलियों को हटाएं।",
    heroTitleLine2: "किसानों को सशक्त बनाएं।",
    heroSubtitle: "बिना किसी बिचौलिये के सीधे सत्यापित स्थानीय किसानों से ताज़ा फसल खरीदें।",
    searchPlaceholder: "जैविक उपज, फसलें, या स्थान खोजें...",

    // Categories
    filterByProduce: "उपज के अनुसार फ़िल्टर करें",
    all: "सभी",
    vegetables: "सब्‍जि‍याँ",
    fruits: "फल",
    grains: "अनाज",
    pulses: "दालें",
    spices: "मसाले",

    // Product Card
    perKg: "प्रति किलो",
    availableQty: "उपलब्ध मात्रा",
    farmLocation: "खेत का स्थान",
    buyNow: "ऑर्डर करें",
    outOfStock: "स्टॉक समाप्त",

    // Buyer Dashboard
    welcomeBack: "आपका स्वागत है",
    buyerSubtext: "स्थानीय किसानों से अपने खरीदे गए ताज़े सामान और ऑर्डर इतिहास को ट्रैक करें।",
    totalOrders: "कुल ऑर्डर",
    activeOrders: "सक्रिय ऑर्डर",
    totalSpent: "कुल खर्च",
    orderId: "ऑर्डर आईडी",
    productDetails: "उत्पाद विवरण",
    quantity: "मात्रा",
    totalPrice: "कुल मूल्य",
    status: "स्थिति",
    date: "दिनांक",
    noOrders: "इस स्थिति से मेल खाता हुआ कोई ऑर्डर नहीं मिला।",

    // Order Statuses
    pending: "लंबित",
    confirmed: "पुष्टि की गई",
    shipped: "भेज दिया गया",
    delivered: "पहुंच गया",
    cancelled: "रद्द किया गया",
  },
  mr: {
    // Navbar
    brand: "फार्म2मार्केट",
    marketplace: "मार्केटप्लेस",
    farmerDashboard: "शेतकरी डॅशबोर्ड",
    buyerDashboard: "ग्राहक डॅशबोर्ड",
    myOrders: "माझे ऑर्डर",
    login: "साइन इन करा",
    register: "नोंदणी करा",
    logout: "लॉगआउट",

    // Hero Section
    directProtocol: "थेट शेतकरी-ते-ग्राहक नेटवर्क",
    heroTitleLine1: "मध्यस्थांना हटवा.",
    heroTitleLine2: "शेतकऱ्यांना सक्षम करा.",
    heroSubtitle: "कोणत्याही दलालांशिवाय थेट स्थानिक शेतकऱ्यांकडून ताजा शेतीमाल खरेदी करा.",
    searchPlaceholder: "सेंद्रिय शेतीमाल, पिके, किंवा ठिकाण शोधा...",

    // Categories
    filterByProduce: "शेतीमालानुसार निवडा",
    all: "सर्व",
    vegetables: "भाजीपाला",
    fruits: "फळे",
    grains: "धान्य",
    pulses: "डाळी",
    spices: "मसाले",

    // Product Card
    perKg: "प्रति किलो",
    availableQty: "उपलब्ध प्रमाण",
    farmLocation: "शेताचे ठिकाण",
    buyNow: "ऑर्डर करा",
    outOfStock: "साठा संपला",

    // Buyer Dashboard
    welcomeBack: "पुन्हा स्वागत आहे",
    buyerSubtext: "स्थानिक शेतकऱ्यांकडून खरेदी केलेल्या शेतीमालाची माहिती आणि ऑर्डर इतिहास पहा.",
    totalOrders: "एकूण ऑर्डर",
    activeOrders: "सक्रिय ऑर्डर",
    totalSpent: "एकूण खर्च",
    orderId: "ऑर्डर आयडी",
    productDetails: "शेतीमाल विवरण",
    quantity: "प्रमाण",
    totalPrice: "एकूण किंमत",
    status: "स्थिती",
    date: "दिनांक",
    noOrders: "या स्थितीशी जुळणारी कोणतीही ऑर्डर सापडली नाही.",

    // Order Statuses
    pending: "प्रलंबित",
    confirmed: "निश्चित झाले",
    shipped: "पाठवले",
    delivered: "पोहोचले",
    cancelled: "रद्द केले",
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const changeLanguage = (newLang) => {
    setLang(newLang);
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};