import React from 'react';
import { Languages, ChevronDown } from 'lucide-react';
import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

const LanguageSelector = () => {
  const { lang, changeLanguage } = useContext(LanguageContext);

  return (
    <div
      className="
        relative
        flex
        items-center
        rounded-2xl
        border
        border-slate-700/30
        bg-black/10
        backdrop-blur-md
      "
    >
      <Languages
        className="
          ml-2.5
          w-3.5
          h-3.5
          text-emerald-400
          pointer-events-none
        "
      />

      <select
        value={lang}
        onChange={(e) => changeLanguage(e.target.value)}
        className="
          appearance-none
          bg-transparent
          outline-none
          cursor-pointer
          text-xs
          font-bold
          text-slate-200
          pl-1.5
          pr-7
          py-2
        "
        aria-label="Select language"
      >
        <option
          value="en"
          className="bg-slate-900 text-white"
        >
          EN
        </option>

        <option
          value="hi"
          className="bg-slate-900 text-white"
        >
          हिंदी
        </option>

        <option
          value="mr"
          className="bg-slate-900 text-white"
        >
          मराठी
        </option>
      </select>

      <ChevronDown
        className="
          absolute
          right-2
          w-3
          h-3
          text-slate-400
          pointer-events-none
        "
      />
    </div>
  );
};

export default LanguageSelector;