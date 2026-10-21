import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Menu,
  X,
  User,
  LogOut,
  Search,
  FilePlus,
  Calendar,
  LayoutDashboard,
  ClipboardList,
  PhoneCall,
  CheckCircle,
  FileCheck
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickTrackNo, setQuickTrackNo] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleQuickTrack = (e) => {
    e.preventDefault();
    if (quickTrackNo.trim()) {
      navigate(`/track?app=${encodeURIComponent(quickTrackNo.trim())}`);
      setQuickTrackNo('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
      {/* Top official banner */}
      <div className="bg-gov-navy text-white text-xs px-4 py-1.5 flex justify-between items-center border-b border-gov-navy-light">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Ministry of Road Transport & Highways
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden sm:inline text-slate-300">Digital Government Services Portal</span>
          </div>
          <div className="flex items-center gap-4 text-slate-200">
            <a href="tel:1800180035" className="hover:text-white flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-gov-gold" />
              <span className="hidden md:inline">Toll-Free Helpline:</span> 1800-180-035
            </a>
            <span className="hidden lg:inline text-gov-gold font-medium">Standard Operating Hours: 9 AM - 6 PM</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Portal Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-gov-navy to-gov-navy-light flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-7 h-7 text-gov-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-gov-navy">SARATHI</span>
                <span className="text-xs px-2 py-0.5 font-bold uppercase rounded bg-gov-navy-light text-slate-100 tracking-wider">
                  National Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Driving License Registration & Verification</p>
            </div>
          </Link>

          {/* Quick Track Search (Desktop) */}
          <form onSubmit={handleQuickTrack} className="hidden xl:flex items-center relative w-72">
            <input
              type="text"
              placeholder="Track App No (e.g. DL-2026-...)"
              value={quickTrackNo}
              onChange={(e) => setQuickTrackNo(e.target.value)}
              className="w-full text-xs bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 pl-3 pr-9 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gov-navy focus:border-gov-navy transition-all"
            />
            <button
              type="submit"
              aria-label="Track Application"
              className="absolute right-1.5 text-slate-400 hover:text-gov-navy p-1"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 font-medium text-sm text-slate-600">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive('/') ? 'text-gov-navy font-semibold bg-slate-100' : 'hover:text-gov-navy hover:bg-slate-50'
              }`}
            >
              Home
            </Link>

            <Link
              to="/track"
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive('/track') ? 'text-gov-navy font-semibold bg-slate-100' : 'hover:text-gov-navy hover:bg-slate-50'
              }`}
            >
              Track Application
            </Link>

            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                        isActive('/admin/dashboard') ? 'text-gov-navy font-semibold bg-slate-100' : 'hover:text-gov-navy hover:bg-slate-50'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 text-gov-navy-light" />
                      Admin Dashboard
                    </Link>
                    <Link
                      to="/admin/applications"
                      className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                        isActive('/admin/applications') ? 'text-gov-navy font-semibold bg-slate-100' : 'hover:text-gov-navy hover:bg-slate-50'
                      }`}
                    >
                      <ClipboardList className="w-4 h-4 text-gov-navy-light" />
                      Applications
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/applicant/dashboard"
                      className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                        isActive('/applicant/dashboard') ? 'text-gov-navy font-semibold bg-slate-100' : 'hover:text-gov-navy hover:bg-slate-50'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 text-gov-navy-light" />
                      My Dashboard
                    </Link>
                    <Link
                      to="/apply"
                      className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                        isActive('/apply') ? 'text-gov-navy font-semibold bg-slate-100' : 'hover:text-gov-navy hover:bg-slate-50'
                      }`}
                    >
                      <FilePlus className="w-4 h-4 text-gov-navy-light" />
                      Apply for License
                    </Link>
                    <Link
                      to="/appointments"
                      className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                        isActive('/appointments') ? 'text-gov-navy font-semibold bg-slate-100' : 'hover:text-gov-navy hover:bg-slate-50'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-gov-navy-light" />
                      Book Test
                    </Link>
                  </>
                )}
              </>
            ) : null}
          </nav>

          {/* User Profile / Auth Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <Link
                  to={isAdmin ? '/admin/dashboard' : '/profile'}
                  className="flex items-center gap-2 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    isAdmin ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-gov-navy-light text-white'
                  }`}>
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-slate-800 leading-tight">{user?.full_name?.split(' ')[0]}</p>
                    <p className="text-slate-500 capitalize">{user?.role}</p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="text-slate-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-gov-navy hover:bg-slate-100 rounded-lg transition-colors border border-slate-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gov-navy hover:bg-gov-navy-light rounded-lg shadow-sm transition-all"
                >
                  Register Citizen
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-gov-navy rounded-lg hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleQuickTrack} className="flex items-center relative w-full mb-3">
            <input
              type="text"
              placeholder="Track Application No..."
              value={quickTrackNo}
              onChange={(e) => setQuickTrackNo(e.target.value)}
              className="w-full text-sm bg-slate-100 text-slate-800 placeholder-slate-400 pl-3 pr-9 py-2 rounded-lg border border-slate-300 focus:outline-none"
            />
            <button type="submit" className="absolute right-2 text-slate-500 p-1">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="flex flex-col space-y-1 text-sm font-medium">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700"
            >
              Home
            </Link>
            <Link
              to="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700"
            >
              Track Application
            </Link>

            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <>
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700"
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      to="/admin/applications"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700"
                    >
                      Manage Applications
                    </Link>
                    <Link
                      to="/admin/reports"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700"
                    >
                      Statistical Reports
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/applicant/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700"
                    >
                      My Dashboard
                    </Link>
                    <Link
                      to="/apply"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700"
                    >
                      Apply for License
                    </Link>
                    <Link
                      to="/appointments"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700"
                    >
                      Book Test Appointment
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700"
                    >
                      My Profile
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50 font-semibold"
                >
                  Sign Out ({user?.full_name})
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold border border-slate-300 rounded-lg text-gov-navy"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold bg-gov-navy text-white rounded-lg shadow-sm"
                >
                  Register Citizen
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
