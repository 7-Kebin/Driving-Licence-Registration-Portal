import React from 'react';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const spinnerSize = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  }[size] || 'w-8 h-8 border-3';

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-3">
      <div
        className={`${spinnerSize} rounded-full border-slate-200 border-t-gov-navy animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="text-xs text-slate-500 font-medium tracking-wide">{text}</p>}
    </div>
  );
}
