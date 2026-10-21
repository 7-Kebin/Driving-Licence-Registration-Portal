import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { Eye, Edit3, Calendar, FileText, Download, Award, ArrowRight } from 'lucide-react';

export default function ApplicationTable({
  applications = [],
  isAdmin = false,
  onViewReceipt = null
}) {
  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
          <FileText className="w-7 h-7" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">No applications found</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          {isAdmin
            ? 'There are currently no submitted driving license applications matching your filter criteria.'
            : 'You have not submitted any driving license applications yet. Click below to begin.'}
        </p>
        {!isAdmin && (
          <Link
            to="/apply"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gov-navy text-white text-xs font-semibold hover:bg-gov-navy-light shadow-sm transition-all"
          >
            Apply for License Now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
            <tr>
              <th scope="col" className="px-5 py-3.5">Application No</th>
              {isAdmin && <th scope="col" className="px-5 py-3.5">Applicant Name</th>}
              <th scope="col" className="px-5 py-3.5">License Type &amp; Category</th>
              <th scope="col" className="px-5 py-3.5">Submission Date</th>
              <th scope="col" className="px-5 py-3.5">Documents</th>
              <th scope="col" className="px-5 py-3.5">Current Status</th>
              <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-4 font-bold text-gov-navy font-mono">
                  <Link
                    to={isAdmin ? `/admin/applications/${app.id}` : `/track?app=${app.application_number}`}
                    className="hover:underline flex items-center gap-1.5"
                  >
                    {app.application_number}
                  </Link>
                </td>

                {isAdmin && (
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{app.applicant_name}</p>
                    <p className="text-[11px] text-slate-500">{app.applicant_email}</p>
                  </td>
                )}

                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-800">{app.license_type_name}</p>
                  <p className="text-[11px] text-slate-500 truncate max-w-xs">{app.vehicle_category}</p>
                </td>

                <td className="px-5 py-4 text-slate-500">
                  {app.submitted_at
                    ? new Date(app.submitted_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })
                    : new Date(app.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }) + ' (Draft)'}
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex items-center text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    {app.verified_documents_count ?? app.verified_docs ?? 0} / {app.documents_count ?? app.total_docs ?? 0} verified
                  </span>
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={app.status} size="sm" />
                </td>

                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {isAdmin ? (
                      <Link
                        to={`/admin/applications/${app.id}`}
                        className="p-1.5 text-slate-600 hover:text-gov-navy hover:bg-slate-100 rounded-md transition-colors"
                        title="Review Application"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    ) : (
                      <>
                        <Link
                          to={`/track?app=${app.application_number}`}
                          className="p-1.5 text-slate-600 hover:text-gov-navy hover:bg-slate-100 rounded-md transition-colors"
                          title="Track Application"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {['Draft', 'Correction Required'].includes(app.status) && (
                          <Link
                            to={`/apply?editId=${app.id}`}
                            className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                            title="Edit / Correct Application"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                        )}

                        {app.status === 'Approved' && (
                          <Link
                            to={`/appointments?appId=${app.id}`}
                            className="p-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Book Test Slot"
                          >
                            <Calendar className="w-4 h-4" />
                          </Link>
                        )}

                        {onViewReceipt && (
                          <button
                            onClick={() => onViewReceipt(app)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                            title={app.status === 'License Issued' ? 'View Digital License' : 'Print Receipt'}
                          >
                            {app.status === 'License Issued' ? <Award className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden divide-y divide-slate-200">
        {applications.map((app) => (
          <div key={app.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-gov-navy">{app.application_number}</span>
                <h4 className="font-bold text-sm text-slate-900 mt-0.5">{app.license_type_name}</h4>
                <p className="text-xs text-slate-500">{app.vehicle_category}</p>
              </div>
              <StatusBadge status={app.status} size="sm" />
            </div>

            {isAdmin && (
              <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                <span className="font-semibold text-slate-900">{app.applicant_name}</span> ({app.applicant_email})
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>
                {app.submitted_at
                  ? new Date(app.submitted_at).toLocaleDateString()
                  : new Date(app.created_at).toLocaleDateString() + ' (Draft)'}
              </span>
              <div className="flex items-center gap-2">
                <Link
                  to={isAdmin ? `/admin/applications/${app.id}` : `/track?app=${app.application_number}`}
                  className="px-3 py-1 bg-slate-100 text-slate-800 rounded-md font-semibold text-xs hover:bg-slate-200"
                >
                  {isAdmin ? 'Review' : 'Track'}
                </Link>
                {onViewReceipt && (
                  <button
                    onClick={() => onViewReceipt(app)}
                    className="px-3 py-1 bg-gov-navy text-white rounded-md font-semibold text-xs"
                  >
                    Receipt
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
