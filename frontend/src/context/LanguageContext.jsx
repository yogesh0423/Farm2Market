import React, { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

// Translation Dictionary
export const translations = {
  en: {
    brand: "Farm2Market",
    marketplace: "Marketplace",
    farmerDashboard: "Farmer Dashboard",
    buyerDashboard: "Buyer Dashboard",
    myOrders: "My Orders",
    login: "Sign In",
    register: "Register",
    logout: "Logout",
    welcome: "Welcome back",
    totalOrders: "Total Orders",
    activeOrders: "Active Orders",
    totalSpent: "Total Spent",
    searchPlaceholder: "Search produce, farmers...",
    selectRole: "I am a...",
    buyerRole: "Buyer / Customer",
    farmerRole: "Farmer / Seller",
  },
  hi: {
    brand: "फार्म2मार्केट",
    marketplace: "मार्केटप्लेस",
    farmerDashboard: "किसान डैशबोर्ड",
    buyerDashboard: "खरीदार डैशबोर्ड",
    myOrders: "मेरे ऑर्डर",
    login: "साइन इन करें",
    register: "पंजीकरण करें",
    logout: "लॉगआउट",
    welcome: "आपका स्वागत है",
    totalOrders: "कुल ऑर्डर",
    activeOrders: "सक्रिय ऑर्डर",
    totalSpent: "कुल खर्च",
    searchPlaceholder: "फसल, फल या किसान खोजें...",
    selectRole: "मैं हूँ...",
    buyerRole: "खरीदार / ग्राहक",
    farmerRole: "किसान / विक्रेता",
  },
  mr: {
    brand: "फार्म2मार्केट",
    marketplace: "मार्केटप्लेस",
    farmerDashboard: "शेतकरी डॅशबोर्ड",
    buyerDashboard: "ग्राहक डॅशबोर्ड",
    myOrders: "माझे ऑर्डर",
    login: "साइन इन करा",
    register: "नोंदणी करा",
    logout: "लॉगआउट",
    welcome: "पुन्हा स्वागत आहे",
    totalOrders: "एकूण ऑर्डर",
    activeOrders: "सक्रिय ऑर्डर",
    totalSpent: "एकूण खर्च",
    searchPlaceholder: "शेतीमाल, फळे किंवा शेतकरी शोधा...",
    selectRole: "मी आहे...",
    buyerRole: "ग्राहक / खरेदीदार",
    farmerRole: "शेतकरी / विक्रेता",
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