import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  limit = 10,
  onPageChange
}) {
  if (totalPages <= 1) return null;

  const startRecord = (currentPage - 1) * limit + 1;
  const endRecord = Math.min(currentPage * limit, totalCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-xs text-slate-600">
      <div>
        Showing <span className="font-bold text-slate-900">{startRecord}</span> to{' '}
        <span className="font-bold text-slate-900">{endRecord}</span> of{' '}
        <span className="font-bold text-slate-900">{totalCount}</span> records
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
          .map((page, idx, arr) => {
            const showEllipsisBefore = idx > 0 && page - arr[idx - 1] > 1;
            return (
              <React.Fragment key={page}>
                {showEllipsisBefore && <span className="px-1 text-slate-400">...</span>}
                <button
                  onClick={() => onPageChange(page)}
                  className={`w-7 h-7 rounded-lg font-semibold transition-all ${
                    currentPage === page
                      ? 'bg-gov-navy text-white shadow-2xs'
                      : 'border border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {page}
                </button>
              </React.Fragment>
            );
          })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
