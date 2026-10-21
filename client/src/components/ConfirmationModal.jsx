import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  confirmVariant = 'primary', // 'primary' | 'danger' | 'success' | 'warning'
  requireInput = false,
  inputLabel = 'Remarks / Reason',
  inputPlaceholder = 'Please enter details...',
  loading = false
}) {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireInput && !inputValue.trim()) {
      setInputError('This field is mandatory to proceed.');
      return;
    }
    onConfirm(inputValue);
  };

  const variantStyles = {
    primary: {
      button: 'bg-gov-navy hover:bg-gov-navy-light text-white',
      icon: AlertCircle,
      iconBg: 'bg-blue-100 text-gov-navy'
    },
    danger: {
      button: 'bg-red-600 hover:bg-red-700 text-white',
      icon: AlertCircle,
      iconBg: 'bg-red-100 text-red-600'
    },
    success: {
      button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-100 text-emerald-600'
    },
    warning: {
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
      icon: AlertTriangle,
      iconBg: 'bg-amber-100 text-amber-600'
    }
  }[confirmVariant] || {
    button: 'bg-gov-navy hover:bg-gov-navy-light text-white',
    icon: AlertCircle,
    iconBg: 'bg-slate-100 text-slate-700'
  };

  const Icon = variantStyles.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 transform transition-all animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${variantStyles.iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>

          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{message}</p>

            {requireInput && (
              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {inputLabel} <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setInputError(null);
                  }}
                  placeholder={inputPlaceholder}
                  disabled={loading}
                  className={`w-full text-xs rounded-lg border p-2.5 outline-none transition-all ${
                    inputError
                      ? 'border-red-400 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-400'
                      : 'border-slate-300 focus:border-gov-navy focus:ring-2 focus:ring-gov-navy/20'
                  }`}
                />
                {inputError && <p className="text-xs text-red-600 font-medium mt-1">{inputError}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 ${variantStyles.button} ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
