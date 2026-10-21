import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';
import ApplicationTable from '../components/ApplicationTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ReceiptModal from '../components/ReceiptModal';
import { FilePlus, Search, ArrowRight, ClipboardList } from 'lucide-react';

export default function ApplicationHistoryPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReceiptApp, setSelectedReceiptApp] = useState(null);

  useEffect(() => {
    async function loadApplications() {
      try {
        setLoading(true);
        const res = await api.getApplicantApplications();
        setApplications(res.applications || []);
      } catch (err) {
        setError(err.message || 'Failed to load applications history.');
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-5rem)]">
      <Sidebar role="applicant" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-gov-navy">
              Citizen Registry Records
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Application History
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Complete archive of your past and active driving license registrations.
            </p>
          </div>

          <Link
            to="/apply"
            className="px-4 py-2.5 rounded-xl bg-gov-navy hover:bg-gov-navy-light text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
          >
            <FilePlus className="w-4 h-4" /> Apply for New License
          </Link>
        </div>

        {error && <ErrorMessage type="error" message={error} />}

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Retrieving citizen application archive..." />
          </div>
        ) : (
          <ApplicationTable
            applications={applications}
            isAdmin={false}
            onViewReceipt={(app) => setSelectedReceiptApp(app)}
          />
        )}

        <ReceiptModal
          isOpen={!!selectedReceiptApp}
          onClose={() => setSelectedReceiptApp(null)}
          application={selectedReceiptApp}
        />
      </main>
    </div>
  );
}
