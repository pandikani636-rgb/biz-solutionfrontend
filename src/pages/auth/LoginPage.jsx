import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layers, Mail, Lock, LogIn, ShieldAlert, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { showErrorAlert, showToast } from '../../utils/alerts';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        showToast(`Welcome back, ${res.user.name}!`);
        if (res.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(from !== '/' ? from : '/customer/bookings');
        }
      }
    } catch (err) {
      showErrorAlert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Fill
  const fillCredentials = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center text-white shadow">
              <Layers className="w-6 h-6 text-accent" />
            </div>
            <span className="text-2xl font-black text-navy tracking-tight">
              Biz<span className="text-primary">Zolution</span>
            </span>
          </Link>
          <h2 className="text-2xl font-black text-darkText pt-2">Sign in to your account</h2>
          <p className="text-xs text-secondaryText">
            Access your service orders, active recharges, and invoices.
          </p>
        </div>

        {/* Quick Demo Credentials Pill */}
        <div className="p-3 bg-lightBlue/60 rounded-2xl border border-blue-200/80 space-y-2 text-xs">
          <p className="font-bold text-navy text-[11px] uppercase tracking-wider">
            ⚡ Quick Test Drive:
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@bizzolution.com', 'Admin@123456')}
              className="flex-1 py-1.5 px-2 bg-navy text-accent font-bold rounded-lg text-[11px] hover:bg-navy-dark transition-smooth flex items-center justify-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Demo Admin
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('customer@example.com', 'Customer@123456')}
              className="flex-1 py-1.5 px-2 bg-white text-primary font-bold rounded-lg text-[11px] border border-blue-200 hover:bg-slate-50 transition-smooth flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" /> Demo Customer
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-darkText">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-darkText">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center mt-2"
            isLoading={loading}
          >
            <LogIn className="w-4 h-4 mr-2" />
            <span>Sign In</span>
          </Button>
        </form>

        {/* Switch to Register */}
        <div className="text-center text-xs text-secondaryText pt-2">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-primary hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
