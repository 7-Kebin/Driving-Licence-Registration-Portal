import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import ApplicationTable from '../components/ApplicationTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  Users,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  Calendar,
  XCircle,
  ArrowRight,
  ShieldAlert,
  BarChart3,
  History
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await api.getAdminDashboard();
        setData(res.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch admin metrics.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-5rem)]">
      <Sidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 overflow-x-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-gov-navy via-gov-navy-light to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-gov-gold">
              Administrative Control Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Licensing Scrutiny &amp; Verification Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Review citizen registrations, verify identity documents, schedule driving tests, and authorize license issuance.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/admin/applications"
              className="px-4 py-2.5 rounded-xl bg-gov-gold hover:bg-amber-400 text-gov-navy-dark font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> Review Queue
            </Link>
            <Link
              to="/admin/reports"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" /> Reports
            </Link>
          </div>
        </div>

        {error && <ErrorMessage type="error" message={error} />}

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Compiling administrative statistics and scrutiny queues..." />
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <DashboardCard
                title="Registered Citizens"
                value={data?.stats?.totalApplicants ?? 0}
                subtitle="Active applicant accounts"
                icon={Users}
                colorScheme="blue"
                link="/admin/applicants"
              />

              <DashboardCard
                title="Total Applications"
                value={data?.stats?.totalApplications ?? 0}
                subtitle="All time submissions"
                icon={FileText}
                colorScheme="navy"
                link="/admin/applications"
              />

              <DashboardCard
                title="Pending Scrutiny"
                value={data?.stats?.pendingReview ?? 0}
                subtitle="Requires officer action"
                icon={Clock}
                colorScheme="amber"
                badge="Action Needed"
                link="/admin/applications?status=Pending Review"
              />

              <DashboardCard
                title="Licenses Issued"
                value={data?.stats?.licenseIssued ?? 0}
                subtitle="Active driving licenses"
                icon={Award}
                colorScheme="emerald"
                link="/admin/applications?status=License Issued"
              />
            </div>

            {/* Secondary Status Counts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">Approved for Test</span>
                <p className="text-xl font-bold text-emerald-700 mt-1">
                  {data?.stats?.approved ?? 0}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">Driving Tests Scheduled</span>
                <p className="text-xl font-bold text-indigo-700 mt-1">
                  {data?.stats?.testScheduled ?? 0}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">Correction Required</span>
                <p className="text-xl font-bold text-amber-700 mt-1">
                  {data?.stats?.correctionRequired ?? 0}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">Rejected Applications</span>
                <p className="text-xl font-bold text-rose-700 mt-1">
                  {data?.stats?.rejected ?? 0}
                </p>
              </div>
            </div>

            {/* License Types Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Applications by License Type</h3>
                  <p className="text-xs text-slate-500">Volume distribution across motor vehicle classes</p>
                </div>
                <Link
                  to="/admin/reports"
                  className="text-xs font-semibold text-gov-navy hover:underline flex items-center gap-1"
                >
                  Detailed Analytics <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {(data?.byLicenseType || []).map((lt) => (
                  <div
                    key={lt.code}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">
                        {lt.code}
                      </span>
                      <h4 className="font-bold text-xs text-slate-800 mt-0.5 truncate max-w-[140px]">
                        {lt.name}
                      </h4>
                    </div>
                    <span className="text-2xl font-black text-gov-navy">
                      {lt.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Submissions Queue */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Recent Applications Scrutiny Queue</h2>
                  <p className="text-xs text-slate-500">Newly received citizen submissions awaiting evaluation</p>
                </div>
                <Link
                  to="/admin/applications"
                  className="text-xs font-semibold text-gov-navy hover:underline flex items-center gap-1"
                >
                  View All Submissions <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <ApplicationTable
                applications={data?.recentSubmissions || []}
                isAdmin={true}
              />
            </div>

            {/* Recent Audit Activities Feed */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-gov-navy" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Recent System Audit Trail</h3>
                    <p className="text-xs text-slate-500">Security-logged administrative actions and state modifications</p>
                  </div>
                </div>
                <Link
                  to="/admin/audit-logs"
                  className="text-xs font-semibold text-gov-navy hover:underline flex items-center gap-1"
                >
                  Full Audit Trail <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {(data?.recentAudits || []).map((audit) => (
                  <div key={audit.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-700">
                        {audit.action}
                      </span>
                      <span className="text-slate-800 font-medium">
                        By: <span className="font-semibold text-gov-navy">{audit.user_name || 'System / Citizen'}</span>
                      </span>
                    </div>

                    <span className="text-slate-400 font-mono text-[11px] shrink-0">
                      {new Date(audit.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
