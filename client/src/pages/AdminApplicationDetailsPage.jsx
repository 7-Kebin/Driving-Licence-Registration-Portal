import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ReceiptModal from '../components/ReceiptModal';
import {
  FileText,
  User,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Clock,
  Printer,
  ChevronLeft,
  Eye,
  ShieldCheck,
  Send,
  Phone,
  Mail,
  ShieldAlert
} from 'lucide-react';

export default function AdminApplicationDetailsPage() {
  const { id } = useParams();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modals state
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    confirmVariant: 'primary',
    requireInput: false,
    inputLabel: '',
    inputPlaceholder: '',
    actionType: null,
    targetDocId: null
  });

  const [testResultModal, setTestResultModal] = useState({
    isOpen: false,
    appointmentId: null,
    result: 'Passed',
    remarks: ''
  });

  const [scheduleModal, setScheduleModal] = useState({
    isOpen: false,
    date: '',
    time: '10:00 AM - 11:00 AM',
    center: ''
  });

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminApplicationDetails(id);
      setApplication(res.application);
      if (res.application?.application_data?.testCenter) {
        setScheduleModal(prev => ({ ...prev, center: res.application.application_data.testCenter }));
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch application details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  // Handle Document Verification
  const handleVerifyDocument = async (docId, status, remarks = '') => {
    try {
      setActionLoading(true);
      setError(null);
      await api.verifyDocument(docId, { status, remarks });
      setSuccessMessage(`Document successfully marked as ${status}.`);
      await fetchApplication();
    } catch (err) {
      setError(err.message || 'Failed to update document status.');
    } finally {
      setActionLoading(false);
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    }
  };

  // Handle Status Update (Approve, Correction Required, Reject)
  const handleStatusTransition = async (newStatus, inputData = '') => {
    try {
      setActionLoading(true);
      setError(null);

      const payload = { status: newStatus };
      if (newStatus === 'Correction Required') {
        payload.correction_instructions = inputData;
      } else if (newStatus === 'Rejected') {
        payload.rejection_reason = inputData;
      } else if (newStatus === 'Approved') {
        payload.remarks = inputData || 'Documents verified and approved for driving test.';
      }

      await api.updateApplicationStatus(id, payload);
      setSuccessMessage(`Application status transitioned to '${newStatus}'.`);
      await fetchApplication();
    } catch (err) {
      setError(err.message || 'Status transition failed.');
    } finally {
      setActionLoading(false);
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    }
  };

  // Handle Issue License
  const handleIssueLicense = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await api.issueLicense(id);
      setSuccessMessage(`Smart Driving License ${res.licenseNumber} issued successfully!`);
      await fetchApplication();
    } catch (err) {
      setError(err.message || 'Failed to issue driving license.');
    } finally {
      setActionLoading(false);
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    }
  };

  // Handle Test Result Recording
  const handleRecordTestResult = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError(null);
      await api.recordTestResult(testResultModal.appointmentId, {
        test_result: testResultModal.result,
        remarks: testResultModal.remarks
      });
      setSuccessMessage(`Driving test recorded as '${testResultModal.result}'.`);
      setTestResultModal(prev => ({ ...prev, isOpen: false }));
      await fetchApplication();
    } catch (err) {
      setError(err.message || 'Failed to record test result.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Admin Scheduling Appointment
  const handleAdminSchedule = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError(null);
      await api.adminScheduleAppointment({
        application_id: application.id,
        appointment_date: scheduleModal.date,
        appointment_time: scheduleModal.time,
        test_center: scheduleModal.center
      });
      setSuccessMessage('Driving test appointment scheduled successfully by administrator.');
      setScheduleModal(prev => ({ ...prev, isOpen: false }));
      await fetchApplication();
    } catch (err) {
      setError(err.message || 'Failed to schedule appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-slate-50 min-h-[calc(100vh-5rem)]">
        <Sidebar role="admin" />
        <main className="flex-1 py-24 flex justify-center">
          <LoadingSpinner text="Retrieving complete applicant dossier and document verification status..." />
        </main>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex bg-slate-50 min-h-[calc(100vh-5rem)]">
        <Sidebar role="admin" />
        <main className="flex-1 p-8 text-center text-slate-500">
          <p>Application record not found.</p>
          <Link to="/admin/applications" className="mt-4 text-gov-navy font-semibold text-xs">
            Back to Applications
          </Link>
        </main>
      </div>
    );
  }

  const appData = application.application_data || {};
  const activeAppointment = (application.appointments || [])[0] || null;

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-5rem)]">
      <Sidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 overflow-x-hidden">
        {/* Top Back Link & Header */}
        <div className="space-y-4">
          <Link
            to="/admin/applications"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gov-navy hover:underline"
          >
            <ChevronLeft className="w-4 h-4" /> Back to All Applications
          </Link>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-base font-extrabold text-gov-navy">
                  {application.application_number}
                </span>
                <StatusBadge status={application.status} size="md" />
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {application.applicant_name}
              </h1>

              <p className="text-xs text-slate-500 mt-0.5">
                {application.license_type_name} • {application.vehicle_category}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setReceiptModalOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                {application.status === 'License Issued' ? 'View License Card' : 'Print Receipt'}
              </button>

              {/* Status Action Buttons */}
              {['Submitted', 'Pending Review'].includes(application.status) && (
                <>
                  <button
                    onClick={() => setModalConfig({
                      isOpen: true,
                      title: 'Approve Application Scrutiny',
                      message: 'Confirm that all documents meet regulatory verification standards. This will permit the citizen to book their driving test appointment.',
                      confirmText: 'Approve Application',
                      confirmVariant: 'success',
                      requireInput: true,
                      inputLabel: 'Officer Verification Remarks (Optional)',
                      inputPlaceholder: 'All documents physically checked and approved.',
                      actionType: 'APPROVE'
                    })}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve Application
                  </button>

                  <button
                    onClick={() => setModalConfig({
                      isOpen: true,
                      title: 'Request Applicant Corrections',
                      message: 'Please provide clear instructions indicating which document or field must be corrected and re-uploaded.',
                      confirmText: 'Send Correction Request',
                      confirmVariant: 'warning',
                      requireInput: true,
                      inputLabel: 'Mandatory Correction Instructions',
                      inputPlaceholder: 'e.g. Uploaded address proof is unreadable. Please upload a clear color scan of Aadhaar.',
                      actionType: 'REQUEST_CORRECTION'
                    })}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Request Correction
                  </button>

                  <button
                    onClick={() => setModalConfig({
                      isOpen: true,
                      title: 'Reject Application',
                      message: 'Rejecting this application will terminate the process. Please specify statutory grounds for rejection.',
                      confirmText: 'Confirm Rejection',
                      confirmVariant: 'danger',
                      requireInput: true,
                      inputLabel: 'Mandatory Statutory Rejection Reason',
                      inputPlaceholder: 'e.g. Underage applicant or fraudulent documentation provided.',
                      actionType: 'REJECT'
                    })}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </>
              )}

              {application.status === 'Approved' && (
                <button
                  onClick={() => setScheduleModal(prev => ({ ...prev, isOpen: true }))}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" /> Schedule Driving Test
                </button>
              )}

              {application.status === 'Test Scheduled' && activeAppointment && (
                <button
                  onClick={() => setTestResultModal({
                    isOpen: true,
                    appointmentId: activeAppointment.id,
                    result: 'Passed',
                    remarks: 'Candidate successfully completed parallel parking and road evaluation tracks.'
                  })}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" /> Record Driving Test Result
                </button>
              )}

              {['Test Passed', 'Approved'].includes(application.status) && (
                <button
                  onClick={() => setModalConfig({
                    isOpen: true,
                    title: 'Authorize and Issue Smart Driving License',
                    message: `Generate official permanent driving license registration number for ${application.applicant_name} under the National Registry.`,
                    confirmText: 'Generate & Issue License',
                    confirmVariant: 'success',
                    requireInput: false,
                    actionType: 'ISSUE_LICENSE'
                  })}
                  className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-gov-gold" /> Issue Driving License
                </button>
              )}
            </div>
          </div>
        </div>

        {error && <ErrorMessage type="error" message={error} onDismiss={() => setError(null)} />}
        {successMessage && <ErrorMessage type="success" message={successMessage} onDismiss={() => setSuccessMessage(null)} />}

        {/* Dossier Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Applicant & Application Details (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Applicant Personal Particulars */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-gov-navy" /> Applicant Particulars
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Full Name</span>
                  <p className="font-bold text-slate-900 text-sm">{application.applicant_name}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Date of Birth</span>
                  <p className="font-semibold text-slate-900">
                    {application.applicant_dob} (DOB)
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Mobile Phone</span>
                  <p className="font-semibold text-slate-900 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {application.applicant_mobile}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Email Address</span>
                  <p className="font-semibold text-slate-900 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {application.applicant_email}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Residential Address</span>
                <p className="font-semibold text-slate-800 mt-0.5">{application.applicant_address}</p>
              </div>
            </div>

            {/* Application Data */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-gov-navy" /> Application Parameters
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">License Type</span>
                  <p className="font-bold text-gov-navy">{application.license_type_name}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Vehicle Class</span>
                  <p className="font-semibold text-slate-800">{application.vehicle_category}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Parent / Guardian</span>
                  <p className="font-semibold text-slate-800">
                    {appData.guardianName || 'N/A'} ({appData.relation || 'Father'})
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Blood Group / Gender</span>
                  <p className="font-semibold text-slate-800">
                    {appData.bloodGroup || 'O+'} / {appData.gender || 'Not specified'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Designated RTO Authority</span>
                  <p className="font-semibold text-slate-800">{appData.testCenter || 'Central RTO'}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Emergency Phone</span>
                  <p className="font-semibold text-slate-800">{appData.emergencyContact || 'N/A'}</p>
                </div>
              </div>

              {appData.licenseNumberIssued && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3.5 text-xs space-y-1">
                  <span className="text-green-800 font-bold uppercase text-[10px]">Official Smart License Issued</span>
                  <p className="text-lg font-mono font-extrabold text-green-900">{appData.licenseNumberIssued}</p>
                  <p className="text-green-700">Valid until {appData.validTill} across Republic of India.</p>
                </div>
              )}
            </div>

            {/* Document Scrutiny Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-gov-navy" /> Document Verification Panel
                  </h3>
                  <p className="text-xs text-slate-500">Inspect uploaded citizen files and record officer verification</p>
                </div>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                  {(application.documents || []).filter(d => d.verification_status === 'Verified').length} / {(application.documents || []).length} Verified
                </span>
              </div>

              <div className="space-y-3">
                {(application.documents || []).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No documents uploaded yet.</p>
                ) : (
                  (application.documents || []).map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-gov-navy shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                              {doc.document_type.replace('_', ' ')}
                            </span>
                            <h4 className="font-bold text-xs text-slate-900 mt-0.5">
                              {doc.original_filename}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-mono">
                              Uploaded: {new Date(doc.uploaded_at).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={doc.verification_status} size="sm" />
                          <a
                            href={`/api/documents/${doc.id}/download`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-600 hover:text-gov-navy hover:bg-white rounded-lg border border-slate-200 shadow-2xs"
                            title="Preview File"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        </div>
                      </div>

                      {doc.verification_remarks && (
                        <div className="text-[11px] bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700">
                          <strong>Verification Note:</strong> {doc.verification_remarks}
                        </div>
                      )}

                      {/* Officer verification controls */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleVerifyDocument(doc.id, 'Verified', 'Valid document verified by officer.')}
                          disabled={actionLoading || doc.verification_status === 'Verified'}
                          className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
                        >
                          Verify Document
                        </button>
                        <button
                          type="button"
                          onClick={() => setModalConfig({
                            isOpen: true,
                            title: `Reject ${doc.document_type.replace('_', ' ').toUpperCase()}`,
                            message: 'Specify reason for rejection so the citizen can provide an acceptable document.',
                            confirmText: 'Reject Document',
                            confirmVariant: 'danger',
                            requireInput: true,
                            inputLabel: 'Document Rejection Remark',
                            inputPlaceholder: 'e.g. Blurry scan or name mismatch with application.',
                            actionType: 'VERIFY_DOC_REJECT',
                            targetDocId: doc.id
                          })}
                          disabled={actionLoading}
                          className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-semibold rounded-md transition-colors"
                        >
                          Reject Document
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Appointments & Status History (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Driving Test Appointment Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gov-navy" /> Driving Test Appointment
              </h3>

              {activeAppointment ? (
                <div className="bg-indigo-50/60 rounded-xl border border-indigo-200 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950">Scheduled Slot</span>
                    <StatusBadge status={activeAppointment.appointment_status} size="sm" />
                  </div>
                  <p className="font-semibold text-slate-900">
                    {activeAppointment.appointment_date} ({activeAppointment.appointment_time})
                  </p>
                  <p className="text-slate-600">{activeAppointment.test_center}</p>
                  <div className="pt-2 border-t border-indigo-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Test Result:</span>
                    <span className={`font-bold ${
                      activeAppointment.test_result === 'Passed'
                        ? 'text-emerald-700'
                        : activeAppointment.test_result === 'Failed'
                        ? 'text-rose-700'
                        : 'text-amber-700'
                    }`}>
                      {activeAppointment.test_result || 'Pending'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No driving test currently scheduled.</p>
              )}
            </div>

            {/* Status History Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-gov-navy" /> Status Transition Audit Log
              </h3>

              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {(application.history || []).map((h) => (
                  <div key={h.id} className="relative group">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-2 border-gov-navy flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-gov-navy" />
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900">{h.new_status}</span>
                        {h.previous_status && (
                          <span className="text-[10px] text-slate-400">
                            (from {h.previous_status})
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 font-mono">
                        {new Date(h.changed_at).toLocaleString()} • By: {h.changed_by_name || 'System / Citizen'}
                      </p>

                      {h.remarks && (
                        <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {h.remarks}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal for Actions */}
        <ConfirmationModal
          isOpen={modalConfig.isOpen}
          onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
          onConfirm={(inputValue) => {
            if (modalConfig.actionType === 'APPROVE') {
              handleStatusTransition('Approved', inputValue);
            } else if (modalConfig.actionType === 'REQUEST_CORRECTION') {
              handleStatusTransition('Correction Required', inputValue);
            } else if (modalConfig.actionType === 'REJECT') {
              handleStatusTransition('Rejected', inputValue);
            } else if (modalConfig.actionType === 'ISSUE_LICENSE') {
              handleIssueLicense();
            } else if (modalConfig.actionType === 'VERIFY_DOC_REJECT') {
              handleVerifyDocument(modalConfig.targetDocId, 'Rejected', inputValue);
            }
          }}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmText={modalConfig.confirmText}
          confirmVariant={modalConfig.confirmVariant}
          requireInput={modalConfig.requireInput}
          inputLabel={modalConfig.inputLabel}
          inputPlaceholder={modalConfig.inputPlaceholder}
          loading={actionLoading}
        />

        {/* Record Test Result Modal */}
        {testResultModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900">Record Driving Test Result</h3>
              <p className="text-xs text-slate-500">Record practical driving road track evaluation for this applicant.</p>

              <form onSubmit={handleRecordTestResult} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Test Result Evaluation *</label>
                  <select
                    value={testResultModal.result}
                    onChange={(e) => setTestResultModal(prev => ({ ...prev, result: e.target.value }))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 outline-none"
                  >
                    <option value="Passed">Passed (Eligible for Smart Driving License)</option>
                    <option value="Failed">Failed (Mandatory 7-day re-test required)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Examiner Remarks *</label>
                  <textarea
                    rows={3}
                    value={testResultModal.remarks}
                    onChange={(e) => setTestResultModal(prev => ({ ...prev, remarks: e.target.value }))}
                    placeholder="Evaluation notes, test track score, road conduct..."
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 outline-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setTestResultModal(prev => ({ ...prev, isOpen: false }))}
                    className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 text-xs font-bold bg-gov-navy text-white rounded-lg hover:bg-gov-navy-light"
                  >
                    {actionLoading ? 'Recording...' : 'Submit Evaluation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Schedule Test Modal */}
        {scheduleModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900">Admin Driving Test Scheduling</h3>
              <p className="text-xs text-slate-500">Fix an appointment slot on behalf of the applicant.</p>

              <form onSubmit={handleAdminSchedule} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Test Center *</label>
                  <input
                    type="text"
                    value={scheduleModal.center}
                    onChange={(e) => setScheduleModal(prev => ({ ...prev, center: e.target.value }))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Date *</label>
                    <input
                      type="date"
                      value={scheduleModal.date}
                      onChange={(e) => setScheduleModal(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2.5 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Time Slot *</label>
                    <input
                      type="text"
                      value={scheduleModal.time}
                      onChange={(e) => setScheduleModal(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2.5 outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setScheduleModal(prev => ({ ...prev, isOpen: false }))}
                    className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 text-xs font-bold bg-gov-navy text-white rounded-lg hover:bg-gov-navy-light"
                  >
                    {actionLoading ? 'Scheduling...' : 'Confirm Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Printable Receipt Modal */}
        <ReceiptModal
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          application={application}
        />
      </main>
    </div>
  );
}
