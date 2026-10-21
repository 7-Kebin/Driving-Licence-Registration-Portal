import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import ApplicationTable from '../components/ApplicationTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ReceiptModal from '../components/ReceiptModal';
import {
  FilePlus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function ApplicantDashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppForReceipt, setSelectedAppForReceipt] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await api.getApplicantDashboard();
        setDashboardData(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-5rem)]">
      <Sidebar role="applicant" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 overflow-x-hidden">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-gov-navy to-gov-navy-light text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-gov-gold">
              Citizen Portal Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.full_name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Manage your driving licenses, track real-time applications, and attend scheduled test appointments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/apply"
              className="px-4 py-2.5 rounded-xl bg-gov-gold hover:bg-amber-400 text-gov-navy-dark font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <FilePlus className="w-4 h-4" /> New Application
            </Link>
            <Link
              to="/appointments"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" /> Book Test Slot
            </Link>
          </div>
        </div>

        {error && <ErrorMessage type="error" message={error} />}

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Retrieving citizen profile and applications..." />
          </div>
        ) : (
          <>
            {/* Upcoming Appointments Alert (if any) */}
            {dashboardData?.upcomingAppointments?.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-indigo-950">
                      Driving Test Appointment Confirmed
                    </h4>
                    <p className="text-xs text-indigo-800 mt-0.5">
                      Date: <span className="font-bold">{dashboardData.upcomingAppointments[0].appointment_date}</span> ({dashboardData.upcomingAppointments[0].appointment_time}) at <span className="font-bold">{dashboardData.upcomingAppointments[0].test_center}</span>.
                    </p>
                    <p className="text-[11px] text-indigo-600 mt-1">
                      Please carry your vehicle, original documents, and application receipt.
                    </p>
                  </div>
                </div>

                <Link
                  to="/appointments"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors"
                >
                  View Details
                </Link>
              </div>
            )}

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <DashboardCard
                title="Total Applications"
                value={dashboardData?.stats?.total ?? 0}
                subtitle="All submitted & drafts"
                icon={FileText}
                colorScheme="blue"
                link="/applicant/history"
              />

              <DashboardCard
                title="Pending Scrutiny"
                value={dashboardData?.stats?.pending ?? 0}
                subtitle="Under review by RTO"
                icon={Clock}
                colorScheme="amber"
              />

              <DashboardCard
                title="Approved & Issued"
                value={dashboardData?.stats?.approved ?? 0}
                subtitle="Eligible or completed"
                icon={CheckCircle2}
                colorScheme="emerald"
              />

              <DashboardCard
                title="Needs Attention"
                value={dashboardData?.stats?.correctionOrRejected ?? 0}
                subtitle="Corrections / Re-tests"
                icon={AlertTriangle}
                colorScheme="rose"
              />
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Link
                to="/apply"
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-gov-navy hover:shadow-md transition-all group flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-gov-navy flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FilePlus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-gov-navy transition-colors">
                    Apply for New License
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Begin an application for Learner's or Permanent Driving License.
                  </p>
                </div>
              </Link>

              <Link
                to="/track"
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-gov-navy hover:shadow-md transition-all group flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-gov-navy transition-colors">
                    Track Application Status
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Check status timeline, officer remarks, and next required steps.
                  </p>
                </div>
              </Link>

              <Link
                to="/appointments"
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-gov-navy hover:shadow-md transition-all group flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-gov-navy transition-colors">
                    Book Driving Test
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Choose test center and confirm your road practical evaluation date.
                  </p>
                </div>
              </Link>
            </div>

            {/* Recent Application Activity */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Recent Applications Activity</h2>
                  <p className="text-xs text-slate-500">Track and view your recent submissions</p>
                </div>
                <Link
                  to="/applicant/history"
                  className="text-xs font-semibold text-gov-navy hover:underline flex items-center gap-1"
                >
                  View All History <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <ApplicationTable
                applications={dashboardData?.recentActivity || []}
                isAdmin={false}
                onViewReceipt={(app) => setSelectedAppForReceipt(app)}
              />
            </div>
          </>
        )}

        {/* Receipt / Digital License Modal */}
        <ReceiptModal
          isOpen={!!selectedAppForReceipt}
          onClose={() => setSelectedAppForReceipt(null)}
          application={selectedAppForReceipt}
        />
      </main>
    </div>
  );
}
