import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
          <span className="text-2xl">🌱</span> {t('brand')}
        </Link>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className="text-sm font-medium hover:text-emerald-400 transition-colors">
            {t('marketplace')}
          </Link>

          {user && (
            <>
              {user.role === 'farmer' ? (
                <Link to="/farmer/dashboard" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
                  {t('farmerDashboard')}
                </Link>
              ) : (
                <Link to="/buyer/dashboard" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
                  {t('buyerDashboard')}
                </Link>
              )}
            </>
          )}

          {/* Language Selector Dropdown */}
          <LanguageSelector />

          {/* User Auth Info & Actions */}
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-gray-800">
              <span className="text-xs font-bold text-gray-300 hidden sm:inline">{user.name}</span>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg border border-gray-700 transition-all"
              >
                {t('logout')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium hover:text-emerald-400 transition-colors">
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-xl shadow-md shadow-emerald-500/20 transition-all"
              >
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;