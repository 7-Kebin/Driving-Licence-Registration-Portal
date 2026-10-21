import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function ErrorMessage({ type = 'error', message, errors = null, onDismiss = null }) {
  if (!message && (!errors || Object.keys(errors).length === 0)) return null;

  const styles = {
    error: {
      bg: 'bg-red-50 border-red-200 text-red-800',
      icon: AlertCircle,
      iconColor: 'text-red-500'
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: AlertTriangle,
      iconColor: 'text-amber-500'
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: CheckCircle,
      iconColor: 'text-emerald-500'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: Info,
      iconColor: 'text-blue-500'
    }
  }[type] || styles.error;

  const Icon = styles.icon;

  return (
    <div className={`p-4 rounded-xl border ${styles.bg} text-sm mb-4 relative transition-all shadow-sm`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 ${styles.iconColor} mt-0.5`} />
        <div className="flex-1">
          {message && <p className="font-medium">{message}</p>}
          {errors && typeof errors === 'object' && Object.keys(errors).length > 0 && (
            <ul className="mt-2 list-disc list-inside space-y-1 text-xs opacity-90">
              {Object.entries(errors).map(([field, err]) => (
                <li key={field}>
                  <strong className="capitalize">{field.replace(/_/g, ' ')}:</strong> {err}
                </li>
              ))}
            </ul>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
