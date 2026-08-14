import React, { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

const LanguageSelector = () => {
  const { lang, changeLanguage } = useContext(LanguageContext);

  return (
    <div className="relative inline-block text-left">
      <select
        value={lang}
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-gray-800/80 text-gray-200 border border-gray-700/80 px-3 py-1.5 text-xs font-semibold rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition-all hover:bg-gray-800"
      >
        <option value="en" className="bg-gray-900 text-gray-100">🌐 English</option>
        <option value="hi" className="bg-gray-900 text-gray-100">🇮🇳 हिंदी (Hindi)</option>
        <option value="mr" className="bg-gray-900 text-gray-100">🚩 मराठी (Marathi)</option>
      </select>
    </div>
  );
};

export default LanguageSelector;