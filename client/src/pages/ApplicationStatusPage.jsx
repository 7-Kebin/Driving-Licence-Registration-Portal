import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ReceiptModal from '../components/ReceiptModal';
import {
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  Award,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  UserCheck
} from 'lucide-react';

export default function ApplicationStatusPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialAppNo = searchParams.get('app') || '';

  const [inputAppNumber, setInputAppNumber] = useState(initialAppNo);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedReceiptApp, setSelectedReceiptApp] = useState(null);

  const fetchTracking = async (appNo) => {
    if (!appNo || !appNo.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.trackApplication(appNo.trim());
      setTrackingData(res.data);
    } catch (err) {
      setError(err.message || 'No application record found with this reference number.');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialAppNo) {
      fetchTracking(initialAppNo);
    }
  }, [initialAppNo]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputAppNumber.trim()) {
      setSearchParams({ app: inputAppNumber.trim() });
      fetchTracking(inputAppNumber.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-gov-navy uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Citizen Services
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Track Driving License Application Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Enter your Application Reference Number to view real-time scrutiny status, officer remarks, and scheduled tests.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={inputAppNumber}
              onChange={(e) => setInputAppNumber(e.target.value)}
              placeholder="Enter Application No. (e.g. DL-2026-104921)"
              className="w-full text-sm font-mono pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:border-gov-navy focus:ring-2 focus:ring-gov-navy/20 outline-none uppercase transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="py-3 px-6 rounded-xl bg-gov-navy hover:bg-gov-navy-light text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-70"
          >
            {loading ? 'Searching...' : 'Track Application'}
          </button>
        </form>

        {/* Quick test buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">Test Reference Numbers:</span>
          {['DL-2026-104921', 'DL-2026-108234', 'DL-2026-102115', 'DL-2026-109982'].map(no => (
            <button
              key={no}
              onClick={() => {
                setInputAppNumber(no);
                setSearchParams({ app: no });
                fetchTracking(no);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-gov-navy rounded-md font-mono text-[11px] border border-slate-200 transition-colors"
            >
              {no}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorMessage type="error" message={error} onDismiss={() => setError(null)} />}

      {loading && (
        <div className="py-12 flex justify-center">
          <LoadingSpinner text="Retrieving official records from National Licensing Registry..." />
        </div>
      )}

      {/* Tracking Results Card */}
      {trackingData && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-gov-navy to-gov-navy-light text-white p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-gov-gold font-bold uppercase tracking-wider">
                  Reference No.
                </span>
                <span className="text-lg font-mono font-extrabold tracking-wide">
                  {trackingData.application_number}
                </span>
              </div>
              <h2 className="text-xl font-bold mt-1">{trackingData.applicant_name}</h2>
              <p className="text-xs text-slate-300">
                {trackingData.license_type} • {trackingData.vehicle_category}
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <StatusBadge status={trackingData.status} size="lg" />
              <button
                onClick={() => setSelectedReceiptApp({
                  ...trackingData,
                  applicant_name: trackingData.applicant_name,
                  license_type_name: trackingData.license_type,
                  application_data: trackingData.timeline?.[0] || {}
                })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors"
              >
                {trackingData.status === 'License Issued' ? (
                  <>
                    <Award className="w-3.5 h-3.5 text-gov-gold" /> View Smart Card
                  </>
                ) : (
                  <>
                    <Printer className="w-3.5 h-3.5" /> Print Receipt
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Next Action Banner */}
            {trackingData.nextAction && (
              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-5 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gov-navy text-white flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gov-navy-light">
                        Next Required Action
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                        {trackingData.nextAction.step}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {trackingData.nextAction.instruction}
                      </p>
                    </div>
                  </div>

                  {/* Contextual Action Button */}
                  {trackingData.nextAction.actionType === 'BOOK_APPOINTMENT' && (
                    <Link
                      to={`/appointments?appId=${trackingData.application_number}`}
                      className="px-4 py-2 rounded-xl bg-gov-navy hover:bg-gov-navy-light text-white font-bold text-xs shadow-sm transition-all shrink-0 flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Book Slot Now
                    </Link>
                  )}

                  {trackingData.nextAction.actionType === 'CORRECT_APPLICATION' && (
                    <Link
                      to={`/apply?editId=${trackingData.application_number}`}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all shrink-0 flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Submit Corrections
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Scheduled Appointment Details (if any) */}
            {trackingData.appointment && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" /> Driving Test Appointment Confirmed
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-200 text-indigo-900">
                    Status: {trackingData.appointment.appointment_status}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-indigo-600 font-semibold">Date &amp; Time:</span>
                    <p className="font-bold text-slate-900">
                      {trackingData.appointment.appointment_date} ({trackingData.appointment.appointment_time})
                    </p>
                  </div>
                  <div>
                    <span className="text-indigo-600 font-semibold">Test Center:</span>
                    <p className="font-bold text-slate-900">{trackingData.appointment.test_center}</p>
                  </div>
                  <div>
                    <span className="text-indigo-600 font-semibold">Evaluation Result:</span>
                    <p className="font-bold text-slate-900">{trackingData.appointment.test_result || 'Pending'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Status History Timeline */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Application Progress History &amp; Official Audit Log
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {(trackingData.timeline || []).map((step, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-2 border-gov-navy flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-gov-navy" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          Status updated to: <span className="text-gov-navy font-semibold">{step.new_status}</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          • {new Date(step.changed_at).toLocaleString()}
                        </span>
                      </div>

                      {step.remarks && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                          {step.remarks}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata Footer */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-500">
              <div>
                <span className="text-slate-400">Created:</span>
                <p className="font-semibold text-slate-800">
                  {new Date(trackingData.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Submitted:</span>
                <p className="font-semibold text-slate-800">
                  {trackingData.submitted_at ? new Date(trackingData.submitted_at).toLocaleDateString() : 'Draft'}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Last Updated:</span>
                <p className="font-semibold text-slate-800">
                  {new Date(trackingData.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Documents Verified:</span>
                <p className="font-semibold text-emerald-700">
                  {trackingData.documents?.verified_docs ?? 0} / {trackingData.documents?.total_docs ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedReceiptApp}
        onClose={() => setSelectedReceiptApp(null)}
        application={selectedReceiptApp}
      />
    </div>
  );
}
