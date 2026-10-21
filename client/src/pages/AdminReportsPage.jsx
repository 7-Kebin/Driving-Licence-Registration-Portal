import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  BarChart3,
  Download,
  Award,
  CheckCircle2,
  XCircle,
  MapPin,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

export default function AdminReportsPage() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const res = await api.getAdminReports();
        setReports(res.reports);
      } catch (err) {
        setError(err.message || 'Failed to load statistical reports.');
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  const exportToJson = () => {
    if (!reports) return;
    const blob = new Blob([JSON.stringify(reports, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sarathi_license_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-5rem)]">
      <Sidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-gov-navy">
              National Informatics &amp; Analytics
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Statistical Reports &amp; Registry Volume
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Audited metrics on license issuance, test performance rates, and regional RTO capacity.
            </p>
          </div>

          <button
            onClick={exportToJson}
            disabled={!reports}
            className="px-4 py-2.5 rounded-xl bg-gov-navy hover:bg-gov-navy-light text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Report (JSON)
          </button>
        </div>

        {error && <ErrorMessage type="error" message={error} />}

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Aggregating statistical models and pass/fail distributions..." />
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1. Status Breakdown Bars */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Application Pipeline by Processing Status
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
                {(reports?.byStatus || []).map((item) => (
                  <div key={item.status} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 truncate block">
                      {item.status}
                    </span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{item.count}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. License Types Volume */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                License Type Distribution
              </h3>

              <div className="divide-y divide-slate-100 text-xs">
                {(reports?.byType || []).map((t) => (
                  <div key={t.code} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{t.name}</span>
                      <span className="ml-2 font-mono text-[10px] text-slate-400">({t.code})</span>
                    </div>
                    <span className="font-extrabold text-sm text-gov-navy">{t.count} Applications</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Test Pass vs Fail & Center Utilization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pass / Fail Rate */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Driving Test Evaluation Outcome
                </h3>

                <div className="space-y-3 pt-2">
                  {(reports?.testStats || []).map((ts) => (
                    <div
                      key={ts.test_result}
                      className={`p-4 rounded-xl border flex items-center justify-between ${
                        ts.test_result === 'Passed'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm">
                        {ts.test_result === 'Passed' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600" />
                        )}
                        <span>Test Result: {ts.test_result}</span>
                      </div>
                      <span className="text-2xl font-black">{ts.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RTO Center Utilization */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Test Center Utilization
                </h3>

                <div className="divide-y divide-slate-100 text-xs">
                  {(reports?.centerStats || []).map((c) => (
                    <div key={c.test_center} className="py-3 flex items-center justify-between">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5 truncate max-w-xs">
                        <MapPin className="w-3.5 h-3.5 text-gov-navy shrink-0" /> {c.test_center}
                      </span>
                      <span className="font-mono font-bold text-gov-navy">{c.count} Tests</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
