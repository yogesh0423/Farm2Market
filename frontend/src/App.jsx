import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-800">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Marketplace />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Farmer Routes */}
            <Route element={<ProtectedRoute allowedRole="farmer" />}>
              <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
            </Route>

            {/* Protected Buyer Routes */}
            <Route element={<ProtectedRoute allowedRole="buyer" />}>
              <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
              <Route path="/orders" element={<BuyerDashboard />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;