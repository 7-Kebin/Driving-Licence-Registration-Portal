import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Users, Phone, Mail, MapPin, Calendar, FileText } from 'lucide-react';

export default function AdminApplicantsPage() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchApplicants() {
      try {
        setLoading(true);
        const res = await api.getAdminApplicants();
        setApplicants(res.applicants || []);
      } catch (err) {
        setError(err.message || 'Failed to load applicant accounts.');
      } finally {
        setLoading(false);
      }
    }

    fetchApplicants();
  }, []);

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-5rem)]">
      <Sidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 overflow-x-hidden">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-gov-navy">
            Citizen Registry
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Registered Applicant Accounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Directory of registered citizens, contact details, and their application counts.
          </p>
        </div>

        {error && <ErrorMessage type="error" message={error} />}

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Retrieving registered citizen directory..." />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">Citizen Name</th>
                    <th scope="col" className="px-5 py-3.5">Email &amp; Mobile</th>
                    <th scope="col" className="px-5 py-3.5">Date of Birth</th>
                    <th scope="col" className="px-5 py-3.5">Residential Address</th>
                    <th scope="col" className="px-5 py-3.5">Applications</th>
                    <th scope="col" className="px-5 py-3.5">Registered On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applicants.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gov-navy/10 text-gov-navy font-bold flex items-center justify-center shrink-0">
                          {a.full_name?.charAt(0) || 'U'}
                        </div>
                        <span>{a.full_name}</span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{a.email}</p>
                        <p className="text-[11px] text-slate-500">{a.mobile_number}</p>
                      </td>

                      <td className="px-5 py-4 text-slate-600 font-mono">
                        {a.date_of_birth}
                      </td>

                      <td className="px-5 py-4 text-slate-600 truncate max-w-xs">
                        {a.address}
                      </td>

                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full font-bold text-[11px] bg-blue-50 text-gov-navy border border-blue-200">
                          {a.application_count} Submissions
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-500 font-mono text-[11px]">
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
