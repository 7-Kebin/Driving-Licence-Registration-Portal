import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Calendar,
  Award,
  AlertCircle
} from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  }[size] || 'text-xs px-2.5 py-1 gap-1.5';

  const statusConfig = {
    'Draft': {
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: FileText,
      label: 'Draft'
    },
    'Submitted': {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock,
      label: 'Submitted'
    },
    'Pending Review': {
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: Clock,
      label: 'Pending Review'
    },
    'Correction Required': {
      bg: 'bg-orange-50 text-orange-800 border-orange-300',
      icon: AlertTriangle,
      label: 'Correction Required'
    },
    'Approved': {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      icon: CheckCircle2,
      label: 'Approved'
    },
    'Test Scheduled': {
      bg: 'bg-indigo-50 text-indigo-800 border-indigo-300',
      icon: Calendar,
      label: 'Test Scheduled'
    },
    'Test Passed': {
      bg: 'bg-teal-50 text-teal-800 border-teal-300',
      icon: CheckCircle2,
      label: 'Test Passed'
    },
    'Test Failed': {
      bg: 'bg-rose-50 text-rose-800 border-rose-300',
      icon: XCircle,
      label: 'Test Failed'
    },
    'License Issued': {
      bg: 'bg-green-100 text-green-900 border-green-400 font-semibold shadow-sm',
      icon: Award,
      label: 'License Issued'
    },
    'Rejected': {
      bg: 'bg-red-50 text-red-800 border-red-300',
      icon: XCircle,
      label: 'Rejected'
    },
    // Document verification statuses
    'Pending': {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock,
      label: 'Pending'
    },
    'Verified': {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      label: 'Verified'
    }
  };

  const config = statusConfig[status] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: AlertCircle,
    label: status || 'Unknown'
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses} transition-all`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
}
