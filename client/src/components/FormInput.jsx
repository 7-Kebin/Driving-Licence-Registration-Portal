import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error = null,
  helperText = null,
  disabled = false,
  icon: Icon = null,
  autoComplete = 'off',
  min,
  max,
  rows
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-xs font-semibold text-slate-700 tracking-wide">
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        {type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            rows={rows || 3}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`w-full text-sm rounded-lg border px-3.5 py-2.5 transition-all outline-none ${
              Icon ? 'pl-10' : ''
            } ${
              error
                ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-400'
                : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:border-gov-navy focus:ring-2 focus:ring-gov-navy/20'
            } ${disabled ? 'bg-slate-100 cursor-not-allowed text-slate-400' : ''}`}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={inputType}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            min={min}
            max={max}
            autoComplete={autoComplete}
            className={`w-full text-sm rounded-lg border px-3.5 py-2.5 transition-all outline-none ${
              Icon ? 'pl-10' : ''
            } ${isPassword ? 'pr-10' : ''} ${
              error
                ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-400'
                : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:border-gov-navy focus:ring-2 focus:ring-gov-navy/20'
            } ${disabled ? 'bg-slate-100 cursor-not-allowed text-slate-400' : ''}`}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {error ? (
        <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
          <span>•</span> {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}
