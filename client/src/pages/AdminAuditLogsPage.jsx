import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { History, ShieldAlert, User, Clock, Terminal } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const res = await api.getAuditLogs();
        setLogs(res.logs || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch audit trails.');
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, []);

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-5rem)]">
      <Sidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 overflow-x-hidden">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-gov-navy">
            Security &amp; Compliance Audit
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            System Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Immutable log of user registrations, application submissions, officer approvals, and test results.
          </p>
        </div>

        {error && <ErrorMessage type="error" message={error} />}

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Retrieving security audit logs..." />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">Timestamp</th>
                    <th scope="col" className="px-5 py-3.5">Action</th>
                    <th scope="col" className="px-5 py-3.5">Operator / User</th>
                    <th scope="col" className="px-5 py-3.5">Entity</th>
                    <th scope="col" className="px-5 py-3.5">IP Address</th>
                    <th scope="col" className="px-5 py-3.5">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>

                      <td className="px-5 py-3.5 font-bold text-gov-navy">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {log.action}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-sans">
                        <span className="font-semibold text-slate-900">{log.user_name || 'System / Guest'}</span>
                        {log.user_role && (
                          <span className="text-[10px] text-slate-400 block capitalize">
                            ({log.user_role})
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-slate-600">
                        {log.entity_type} #{log.entity_id || '0'}
                      </td>

                      <td className="px-5 py-3.5 text-slate-500">
                        {log.ip_address || '127.0.0.1'}
                      </td>

                      <td className="px-5 py-3.5 text-slate-600 font-sans truncate max-w-xs">
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || '—'}
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
