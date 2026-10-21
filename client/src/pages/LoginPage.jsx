import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import ErrorMessage from '../components/ErrorMessage';
import { ShieldCheck, Mail, Lock, LogIn, Key, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(formData);
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/applicant/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (email, password) => {
    setFormData({ email, password });
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gov-navy to-gov-navy-light flex items-center justify-center text-gov-gold mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Citizen &amp; Official Sign In</h2>
          <p className="text-xs text-slate-500">Access your driving license applications and administrative tools</p>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-gov-navy" /> Instant Test Accounts
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@portal.gov', 'Admin@Secure2026')}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold text-left transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <div>
                <p className="text-[11px] font-bold">Admin Officer</p>
                <p className="text-[10px] text-amber-700">admin@portal.gov</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('rahul.sharma@example.com', 'Applicant@123')}
              className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-semibold text-left transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0 text-blue-600" />
              <div>
                <p className="text-[11px] font-bold">Citizen Applicant</p>
                <p className="text-[10px] text-blue-700">rahul.sharma@...</p>
              </div>
            </button>
          </div>
        </div>

        <ErrorMessage type="error" message={error} onDismiss={() => setError(null)} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Email Address / Username"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="citizen@example.com"
            required
            icon={Mail}
            autoComplete="email"
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            icon={Lock}
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gov-navy hover:bg-gov-navy-light text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Sign In Securely
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-gov-navy hover:underline">
            Register as a New Citizen
          </Link>
        </div>
      </div>
    </div>
  );
}
