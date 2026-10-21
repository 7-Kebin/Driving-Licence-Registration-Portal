import React from 'react';
import { X, Printer, ShieldCheck, QrCode, CheckCircle2, Award, Download } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, application }) {
  if (!isOpen || !application) return null;

  const appData = application.application_data || {};
  const isLicenseIssued = application.status === 'License Issued';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Actions bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2">
            {isLicenseIssued ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Award className="w-4 h-4 text-emerald-600" /> Digital Driving License
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                <ShieldCheck className="w-4 h-4 text-blue-600" /> Official Application Receipt
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold bg-gov-navy hover:bg-gov-navy-light text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="pt-6 space-y-6 print-card">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gov-navy flex items-center justify-center text-gov-gold">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gov-navy tracking-tight uppercase">
                  Government of India
                </h2>
                <p className="text-xs font-semibold text-slate-700">
                  Ministry of Road Transport &amp; Highways
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                  SARATHI CITIZEN LICENSING REGISTRY
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block p-1 bg-white border border-slate-300 rounded shadow-2xs">
                <QrCode className="w-12 h-12 text-slate-800" />
              </div>
              <p className="text-[9px] text-slate-400 font-mono mt-1">VERIFIED CRYPTO SEAL</p>
            </div>
          </div>

          {/* Conditional View: Smart License Card vs Application Receipt */}
          {isLicenseIssued ? (
            /* Digital Smart Card */
            <div className="bg-gradient-to-br from-slate-900 via-gov-navy to-slate-800 text-white rounded-2xl p-6 sm:p-7 shadow-xl border-2 border-gov-gold/40 relative overflow-hidden">
              {/* Card watermark/graphic */}
              <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute top-4 right-6 text-right">
                <span className="text-[10px] tracking-widest text-gov-gold uppercase font-bold">
                  UNION OF INDIA / SMART CARD
                </span>
                <p className="font-mono text-sm font-extrabold text-white tracking-wider mt-0.5">
                  {appData.licenseNumberIssued || 'DL-PENDING'}
                </p>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded bg-gov-gold/20 border border-gov-gold/40 flex items-center justify-center text-gov-gold font-bold text-xs">
                  DL
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Driving License (Form 7)
                  </h4>
                  <p className="text-[10px] text-slate-400">Valid throughout the Republic of India</p>
                </div>
              </div>

              {/* Chip Graphic */}
              <div className="w-10 h-7 rounded bg-amber-400/90 border border-amber-300/80 mb-6 flex items-center justify-center shadow-inner">
                <div className="w-5 h-4 border border-amber-600/40 rounded-xs" />
              </div>

              {/* License Details Grid */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Holder's Name</p>
                  <p className="font-bold text-white text-sm">
                    {appData.applicantName || application.applicant_name}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Vehicle Class (COV)</p>
                  <p className="font-bold text-gov-gold truncate">{application.vehicle_category}</p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Father / Guardian</p>
                  <p className="font-medium text-slate-200">{appData.guardianName || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Blood Group / Gender</p>
                  <p className="font-medium text-slate-200">
                    {appData.bloodGroup || 'O+'} / {appData.gender || 'Not specified'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Issue Date</p>
                  <p className="font-mono font-medium text-slate-200">
                    {appData.issueDate || new Date().toISOString().split('T')[0]}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Valid Till (Non-Transport)</p>
                  <p className="font-mono font-bold text-emerald-400">
                    {appData.validTill || '2046-12-31'}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                <span>RTO Jurisdiction: {appData.testCenter || 'Central Licensing Authority'}</span>
                <span className="font-mono text-gov-gold">AUTHENTIC CITIZEN CREDENTIAL</span>
              </div>
            </div>
          ) : (
            /* Official Application Acknowledgment Receipt */
            <div className="space-y-5 text-xs text-slate-800">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Application Reference No</span>
                  <p className="text-lg font-mono font-extrabold text-gov-navy">
                    {application.application_number}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Application Status</span>
                  <p className="text-sm font-bold text-emerald-700">{application.status}</p>
                </div>
              </div>

              {/* Data Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-slate-200">
                    <tr className="bg-slate-50/50">
                      <td className="px-4 py-2.5 font-semibold text-slate-500 w-1/3">Applicant Full Name</td>
                      <td className="px-4 py-2.5 font-bold text-slate-900">
                        {appData.applicantName || application.applicant_name}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-500">License Applied For</td>
                      <td className="px-4 py-2.5 font-semibold text-gov-navy">{application.license_type_name}</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="px-4 py-2.5 font-semibold text-slate-500">Vehicle Category</td>
                      <td className="px-4 py-2.5">{application.vehicle_category}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-500">Parent / Guardian Name</td>
                      <td className="px-4 py-2.5">{appData.guardianName || 'N/A'} ({appData.relation || 'Father'})</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="px-4 py-2.5 font-semibold text-slate-500">Designated RTO Authority</td>
                      <td className="px-4 py-2.5 font-semibold">{appData.testCenter || 'Central RTO Complex'}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-500">Submission Timestamp</td>
                      <td className="px-4 py-2.5 font-mono">
                        {application.submitted_at
                          ? new Date(application.submitted_at).toLocaleString()
                          : new Date(application.created_at).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="px-4 py-2.5 font-semibold text-slate-500">Government Portal Fee Status</td>
                      <td className="px-4 py-2.5 font-semibold text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> EXEMPT / FULLY SETTLED (Gov Ref: TXN-DL-{application.id}829)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Instructions */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-[11px] text-amber-900 space-y-1">
                <p className="font-bold">Important Instructions for the Citizen:</p>
                <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                  <li>Keep this system-generated application receipt for your physical or online test appointment.</li>
                  <li>Carry original verification documents and proof of identity when appearing at the test center.</li>
                  <li>Track real-time progress anytime using your application number on the portal home page.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono">
            This is a computer-generated official document under the Information Technology Act. No physical signature is required.
          </div>
        </div>
      </div>
    </div>
  );
}
