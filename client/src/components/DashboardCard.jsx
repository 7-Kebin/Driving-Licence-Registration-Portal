import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardCard({
  title,
  value,
  subtitle = null,
  icon: Icon,
  colorScheme = 'blue',
  link = null,
  badge = null
}) {
  const colorStyles = {
    navy: {
      border: 'border-slate-200 hover:border-gov-navy',
      iconBg: 'bg-gov-navy/10 text-gov-navy',
      badge: 'bg-slate-100 text-gov-navy'
    },
    blue: {
      border: 'border-slate-200 hover:border-blue-500',
      iconBg: 'bg-blue-50 text-blue-600',
      badge: 'bg-blue-50 text-blue-700'
    },
    amber: {
      border: 'border-slate-200 hover:border-amber-500',
      iconBg: 'bg-amber-50 text-amber-700',
      badge: 'bg-amber-50 text-amber-800'
    },
    emerald: {
      border: 'border-slate-200 hover:border-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-700',
      badge: 'bg-emerald-50 text-emerald-800'
    },
    rose: {
      border: 'border-slate-200 hover:border-rose-500',
      iconBg: 'bg-rose-50 text-rose-700',
      badge: 'bg-rose-50 text-rose-800'
    },
    purple: {
      border: 'border-slate-200 hover:border-purple-500',
      iconBg: 'bg-purple-50 text-purple-700',
      badge: 'bg-purple-50 text-purple-800'
    }
  }[colorScheme] || {
    border: 'border-slate-200 hover:border-gov-navy',
    iconBg: 'bg-slate-100 text-slate-700',
    badge: 'bg-slate-100 text-slate-700'
  };

  const CardContent = (
    <div
      className={`bg-white rounded-xl border p-5 transition-all duration-200 shadow-sm hover:shadow-md ${colorStyles.border} relative group overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorStyles.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
        <span className="text-slate-500 truncate">{subtitle || 'Updated just now'}</span>
        {badge && (
          <span className={`px-2 py-0.5 rounded-full font-semibold ${colorStyles.badge}`}>
            {badge}
          </span>
        )}
        {link && (
          <span className="text-gov-navy font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            View Details <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </div>
  );

  if (link) {
    return <Link to={link}>{CardContent}</Link>;
  }

  return CardContent;
}
