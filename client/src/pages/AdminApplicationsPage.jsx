import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';
import ApplicationTable from '../components/ApplicationTable';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Search, Filter, RotateCcw, FileText, CheckCircle2 } from 'lucide-react';

const STATUSES = [
  'All',
  'Submitted',
  'Pending Review',
  'Correction Required',
  'Approved',
  'Test Scheduled',
  'Test Passed',
  'Test Failed',
  'License Issued',
  'Rejected',
  'Draft'
];

export default function AdminApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlStatus = searchParams.get('status') || 'All';

  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0, limit: 10 });
  const [licenseTypes, setLicenseTypes] = useState([]);

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(urlStatus);
  const [selectedType, setSelectedType] = useState('');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch license types for filter
  useEffect(() => {
    async function fetchTypes() {
      try {
        const res = await api.getLicenseTypes();
        setLicenseTypes(res.licenseTypes || []);
      } catch (_) {}
    }
    fetchTypes();
  }, []);

  const fetchApplications = async (pageToFetch = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: pageToFetch,
        limit: 10
      };
      if (search.trim()) params.search = search.trim();
      if (selectedStatus && selectedStatus !== 'All') params.status = selectedStatus;
      if (selectedType) params.license_type_id = selectedType;

      const res = await api.getAdminApplications(params);
      setApplications(res.data.applications || []);
      setPagination(res.data.pagination || { currentPage: 1, totalPages: 1, totalCount: 0, limit: 10 });
    } catch (err) {
      setError(err.message || 'Failed to fetch applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(page);
  }, [page, selectedStatus, selectedType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchApplications(1);
  };

  const handleReset = () => {
    setSearch('');
    setSelectedStatus('All');
    setSelectedType('');
    setPage(1);
    setSearchParams({});
    fetchApplications(1);
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-5rem)]">
      <Sidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 overflow-x-hidden">
        {/* Header */}
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-gov-navy">
            Scrutiny &amp; Verification Registry
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage Driving License Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Search, filter, inspect uploaded documents, and process status transitions for all registered applications.
          </p>
        </div>

        {error && <ErrorMessage type="error" message={error} />}

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by App No, Name, Email, or Mobile..."
                className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-gov-navy focus:ring-2 focus:ring-gov-navy/20 outline-none"
              />
            </div>

            {/* Status Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs rounded-xl border border-slate-300 py-2.5 px-3 bg-white text-slate-800 outline-none"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st === 'All' ? 'All Statuses' : st}
                  </option>
                ))}
              </select>
            </div>

            {/* License Type Dropdown */}
            <div className="md:col-span-2">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs rounded-xl border border-slate-300 py-2.5 px-3 bg-white text-slate-800 outline-none"
              >
                <option value="">All License Types</option>
                {licenseTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code} — {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter buttons */}
            <div className="md:col-span-2 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-3 bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" /> Filter
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Applications Table */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Querying applications database..." />
          </div>
        ) : (
          <div className="space-y-4">
            <ApplicationTable
              applications={applications}
              isAdmin={true}
            />

            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
              limit={pagination.limit}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </main>
    </div>
  );
}
