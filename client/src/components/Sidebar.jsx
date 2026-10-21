import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FilePlus,
  ClipboardList,
  Calendar,
  Search,
  User,
  LogOut,
  ShieldCheck,
  BarChart3,
  Users,
  History,
  FileCheck2
} from 'lucide-react';

export default function Sidebar({ role = 'applicant' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const applicantLinks = [
    { name: 'My Dashboard', path: '/applicant/dashboard', icon: LayoutDashboard },
    { name: 'Apply for License', path: '/apply', icon: FilePlus },
    { name: 'My Applications', path: '/applicant/history', icon: ClipboardList },
    { name: 'Driving Test Booking', path: '/appointments', icon: Calendar },
    { name: 'Track Status', path: '/track', icon: Search },
    { name: 'Citizen Profile', path: '/profile', icon: User }
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'All Applications', path: '/admin/applications', icon: ClipboardList },
    { name: 'Statistical Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Applicant Accounts', path: '/admin/applicants', icon: Users },
    { name: 'System Audit Logs', path: '/admin/audit-logs', icon: History }
  ];

  const links = role === 'admin' ? adminLinks : applicantLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-5rem)] flex flex-col justify-between p-4 shrink-0 shadow-sm hidden md:flex">
      <div className="space-y-6">
        {/* User Card */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
            role === 'admin' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-gov-navy text-white'
          }`}>
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-slate-900 text-xs truncate">{user?.full_name}</h4>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            <span className="inline-block mt-0.5 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Links Navigation */}
        <nav className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            {role === 'admin' ? 'Administration' : 'Services Menu'}
          </p>
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin/dashboard' || item.path === '/applicant/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gov-navy text-white shadow-sm'
                      : 'text-slate-600 hover:text-gov-navy hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout button */}
      <div className="pt-4 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
