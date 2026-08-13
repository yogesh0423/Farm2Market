import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout, Mail, Lock, ArrowRight, Sun, Moon, Monitor, ShieldCheck, Zap } from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
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
      const res = await login(formData.email, formData.password);
      if (res.user.role === 'farmer') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
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
      subText: 'text-slate-400',
      accentText: 'text-emerald-400'
    },
    dark: {
      bg: 'bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white',
      card: 'bg-slate-900 border-slate-800 shadow-2xl',
      input: 'bg-slate-950 border-slate-800 text-white focus:border-teal-400 placeholder-slate-600',
      btn: 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20',
      subText: 'text-slate-400',
      accentText: 'text-teal-400'
    },
    light: {
      bg: 'bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white',
      card: 'bg-white border-slate-200/80 shadow-2xl shadow-slate-200/50',
      input: 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500 placeholder-slate-400',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
      subText: 'text-slate-500',
      accentText: 'text-emerald-600'
    }
  }[theme];

  return (
    <div className={`min-h-screen flex flex-col justify-between font-sans transition-colors duration-300 relative overflow-hidden ${styles.bg}`}>
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header Bar */}
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

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className={`w-full max-w-md border rounded-3xl p-8 backdrop-blur-xl transition-all duration-300 ${styles.card}`}>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold tracking-wider uppercase mb-3">
              <Zap className="w-3 h-3 text-amber-400" /> Direct Agri Network
            </div>
            <h2 className="text-2xl font-black tracking-tight">Welcome Back</h2>
            <p className={`text-xs mt-1 ${styles.subText}`}>Sign in to manage your harvests and orders</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3.5 rounded-xl text-xs font-medium mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5 opacity-70">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-4 h-4 opacity-40" />
                <input
                  type="email"
                  name="email"
                  placeholder="farmer@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-medium outline-none transition ${styles.input}`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5 opacity-70">
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
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-medium outline-none transition ${styles.input}`}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 disabled:opacity-50 ${styles.btn}`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/30 text-center">
            <p className={`text-xs ${styles.subText}`}>
              Don't have an account?{' '}
              <Link to="/register" className={`font-bold hover:underline ${styles.accentText}`}>
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-[10px] font-mono opacity-50 z-10 flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Encrypted Direct Node Access
      </footer>
    </div>
  );
};

export default Login;