import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios'; // Import your axios instance

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call Flask login endpoint (/api/v1/auth/login)
      const response = await API.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      const { user, token, access_token } = response.data;
      const authToken = token || access_token;

      // Update AuthContext state with user data and token
      login(user, authToken);

      // Navigate based on user role
      if (user?.role === 'farmer') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login Error:', err.response);
      setError(
        err.response?.data?.error || 
        'Login failed. Please check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
        <h2 className="text-3xl font-bold text-center mb-6 text-green-400">
          Welcome Back
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-2 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password *</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-green-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 font-semibold py-2 rounded transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-green-400 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;