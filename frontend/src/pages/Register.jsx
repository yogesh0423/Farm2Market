import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout, User, Mail, Lock, Phone, ArrowRight, Sun, Moon, Monitor, ShieldCheck, UserCheck } from 'lucide-react';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
    phone: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('cyber'); // 'cyber', 'dark', 'light'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.phone
      );

      if (res.user.role === 'farmer') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    cyber: {
      bg: 'bg-[#080d0a] text-slate-100 selection:bg-emerald-500 selection:text-black',
      card: 'bg-[#0d1711] border-emerald-900/40 shadow-[0_0_40px_rgba(16,185,129,0.1)]',
      input: 'bg-[#080d0a] border-emerald-900/60 text-white focus:border-emerald-400 placeholder-slate-600',
      btn: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20',
      roleActive: 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-extrabold',
      roleInactive: 'bg-[#080d0a] text-slate-400 border-emerald-900/40 hover:text-white',
      subText: 'text-slate-400',
      accentText: 'text-emerald-400'
    },
    dark: {
      bg: 'bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white',
      card: 'bg-slate-900 border-slate-800 shadow-2xl',
      input: 'bg-slate-950 border-slate-800 text-white focus:border-teal-400 placeholder-slate-600',
      btn: 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20',
      roleActive: 'bg-teal-500 text-slate-950 border-teal-400 shadow-md font-extrabold',
      roleInactive: 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white',
      subText: 'text-slate-400',
      accentText: 'text-teal-400'
    },
    light: {
      bg: 'bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white',
      card: 'bg-white border-slate-200/80 shadow-2xl shadow-slate-200/50',
      input: 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500 placeholder-slate-400',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
      roleActive: 'bg-emerald-600 text-white border-emerald-600 shadow-md font-extrabold',
      roleInactive: 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900',
      subText: 'text-slate-500',
      accentText: 'text-emerald-600'
    }
  }[theme];

  return (
    <div className={`min-h-screen flex flex-col justify-between font-sans transition-colors duration-300 relative overflow-hidden py-4 ${styles.bg}`}>
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full z-10">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 p-[1px] shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-[#0d1711] rounded-[15px] flex items-center justify-center">
              <Sprout className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <span className="text-xl font-black tracking-tight">
            FARM<span className={styles.accentText}>2</span>MARKET
          </span>
        </Link>

        {/* Theme Switcher */}
        <div className="flex items-center p-1 rounded-2xl border border-slate-700/30 bg-black/10 backdrop-blur-md">
          <button
            onClick={() => setTheme('cyber')}
            className={`p-1.5 rounded-xl text-xs font-bold transition ${theme === 'cyber' ? 'bg-emerald-500 text-black shadow-md' : 'text-slate-400'}`}
            title="Cyber-Agri Mode"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-xl text-xs font-bold transition ${theme === 'dark' ? 'bg-teal-500 text-black shadow-md' : 'text-slate-400'}`}
            title="Dark Mode"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-xl text-xs font-bold transition ${theme === 'light' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}
            title="Light Mode"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Registration Card */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 my-4">
        <div className={`w-full max-w-md border rounded-3xl p-8 backdrop-blur-xl transition-all duration-300 ${styles.card}`}>
          
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold tracking-wider uppercase mb-3">
              <UserCheck className="w-3.5 h-3.5" /> Join Direct Network
            </div>
            <h2 className="text-2xl font-black tracking-tight">Create Account</h2>
            <p className={`text-xs mt-1 ${styles.subText}`}>Select your role and start trading produce</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3.5 rounded-xl text-xs font-medium mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Selection Toggle */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-2 opacity-70">
                I am registering as:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'buyer' })}
                  className={`py-2.5 rounded-xl text-xs transition border flex items-center justify-center gap-2 ${
                    formData.role === 'buyer' ? styles.roleActive : styles.roleInactive
                  }`}
                >
                  🛒 Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'farmer' })}
                  className={`py-2.5 rounded-xl text-xs transition border flex items-center justify-center gap-2 ${
                    formData.role === 'farmer' ? styles.roleActive : styles.roleInactive
                  }`}
                >
                  👨‍🌾 Farmer
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-1 opacity-70">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-4 w-4 h-4 opacity-40" />
                <input
                  type="text"
                  name="name"
                  placeholder="Yogesh Patil"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm font-medium outline-none transition ${styles.input}`}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-1 opacity-70">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-4 h-4 opacity-40" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@domain.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm font-medium outline-none transition ${styles.input}`}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-1 opacity-70">
                Phone Number
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-4 w-4 h-4 opacity-40" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm font-medium outline-none transition ${styles.input}`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-1 opacity-70">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-4 h-4 opacity-40" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm font-medium outline-none transition ${styles.input}`}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 mt-2 disabled:opacity-50 ${styles.btn}`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Register Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/30 text-center">
            <p className={`text-xs ${styles.subText}`}>
              Already registered?{' '}
              <Link to="/login" className={`font-bold hover:underline ${styles.accentText}`}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-[10px] font-mono opacity-50 z-10 flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Secure Direct Registration Protocol
      </footer>
    </div>
  );
};

export default Register;