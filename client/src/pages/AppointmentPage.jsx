import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export default function AppointmentPage() {
  const [searchParams] = useSearchParams();
  const preselectedAppId = searchParams.get('appId');
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState(preselectedAppId || '');
  const [slotData, setSlotData] = useState(null);
  const [myAppointments, setMyAppointments] = useState([]);

  const [selectedCenter, setSelectedCenter] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);

  // Load applicant's applications and existing appointments
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [appsRes, apptsRes] = await Promise.all([
          api.getApplicantApplications(),
          api.getMyAppointments()
        ]);

        const allApps = appsRes.applications || [];
        setApplications(allApps);
        setMyAppointments(apptsRes.appointments || []);

        if (preselectedAppId) {
          const match = allApps.find(a => a.id.toString() === preselectedAppId || a.application_number === preselectedAppId);
          if (match) setSelectedAppId(match.id.toString());
        } else if (allApps.length > 0) {
          // Default to first approved application or first application
          const approved = allApps.find(a => ['Approved', 'Test Failed'].includes(a.status));
          setSelectedAppId(approved ? approved.id.toString() : allApps[0].id.toString());
        }
      } catch (err) {
        setError(err.message || 'Failed to load appointments.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [preselectedAppId]);

  // Load available slots when test center or date changes
  useEffect(() => {
    async function fetchSlots() {
      try {
        const params = {};
        if (selectedCenter) params.test_center = selectedCenter;
        if (selectedDate) params.date = selectedDate;

        const res = await api.getAvailableSlots(params);
        setSlotData(res);
        if (!selectedCenter && res.centers?.[0]) {
          setSelectedCenter(res.centers[0].name);
        }
        if (!selectedDate && res.availableDates?.[0]) {
          setSelectedDate(res.availableDates[0]);
        }
      } catch (err) {
        console.warn('Failed to fetch available slots:', err);
      }
    }

    fetchSlots();
  }, [selectedCenter, selectedDate]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!selectedAppId) {
      setError('Please select an eligible application.');
      return;
    }
    if (!selectedDate || !selectedTimeSlot || !selectedCenter) {
      setError('Please select date, time slot, and test center.');
      return;
    }

    try {
      setBookingLoading(true);
      const res = await api.bookAppointment({
        application_id: parseInt(selectedAppId, 10),
        appointment_date: selectedDate,
        appointment_time: selectedTimeSlot,
        test_center: selectedCenter
      });

      setSuccessMessage('Driving test appointment confirmed successfully!');

      // Refresh appointments and applications
      const [appsRes, apptsRes] = await Promise.all([
        api.getApplicantApplications(),
        api.getMyAppointments()
      ]);
      setApplications(appsRes.applications || []);
      setMyAppointments(apptsRes.appointments || []);
    } catch (err) {
      setError(err.message || 'Slot booking failed. Please select an alternate slot.');
    } finally {
      setBookingLoading(false);
    }
  };

  const selectedApp = applications.find(a => a.id.toString() === selectedAppId);
  const isEligible = selectedApp && ['Approved', 'Test Failed'].includes(selectedApp.status);

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-5rem)]">
      <Sidebar role="applicant" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 overflow-x-hidden">
        {/* Header */}
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-gov-navy">
            Driving Evaluation Slot Reservation
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Driving Test Appointments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Select an approved application, choose your preferred RTO test center, and confirm your driving evaluation slot without queueing.
          </p>
        </div>

        <ErrorMessage type="error" message={error} onDismiss={() => setError(null)} />
        <ErrorMessage type="success" message={successMessage} onDismiss={() => setSuccessMessage(null)} />

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Loading appointment slots..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Booking Form (Left 7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Book Driving Test Slot</h3>
                <p className="text-xs text-slate-500">Only applications with Approved verification status are eligible for booking</p>
              </div>

              <form onSubmit={handleBooking} className="space-y-6">
                {/* Application Selector */}
                <div className="space-y-1.5">
                  <label htmlFor="selectApp" className="block text-xs font-semibold text-slate-700">
                    Select Application <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="selectApp"
                    value={selectedAppId}
                    onChange={(e) => {
                      setSelectedAppId(e.target.value);
                      setError(null);
                    }}
                    className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:border-gov-navy outline-none"
                  >
                    <option value="">-- Choose Application --</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.application_number} — {app.license_type_name} ({app.vehicle_category}) [Status: {app.status}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Eligibility Check Notice */}
                {selectedApp && !isEligible && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" /> Application Ineligible for Test Booking
                    </p>
                    <p>
                      Current Status: <span className="font-semibold text-slate-900">'{selectedApp.status}'</span>. A driving test can only be scheduled once your documents have been scrutinized and Approved by the Licensing Officer.
                    </p>
                  </div>
                )}

                {/* Test Center Selector */}
                <div className="space-y-1.5">
                  <label htmlFor="selectCenter" className="block text-xs font-semibold text-slate-700">
                    RTO Test Center <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="selectCenter"
                    value={selectedCenter}
                    onChange={(e) => setSelectedCenter(e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:border-gov-navy outline-none"
                  >
                    {(slotData?.centers || []).map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} — {c.address}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Available Dates */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Select Appointment Date (Next 14 Days) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(slotData?.availableDates || []).slice(0, 10).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDate(d)}
                        className={`px-3 py-2 rounded-lg font-mono text-xs font-semibold transition-all ${
                          selectedDate === d
                            ? 'bg-gov-navy text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {new Date(d).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short'
                        })}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Available Time Slots Grid */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Available Time Slots (Conflict Prevention Enforced) <span className="text-red-500">*</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(slotData?.slots || []).map((slot) => {
                      const isSelected = selectedTimeSlot === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedTimeSlot(slot.time)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-gov-navy bg-blue-50/60 shadow-xs'
                              : slot.available
                              ? 'border-slate-200 hover:border-slate-300 bg-white'
                              : 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-gov-navy" /> {slot.time}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {slot.remainingSlots} of {slot.totalCapacity} slots remaining
                            </p>
                          </div>

                          {slot.available ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Available
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                              Booked
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading || !isEligible || !selectedTimeSlot}
                  className="w-full py-3.5 px-4 rounded-xl bg-gov-navy hover:bg-gov-navy-light text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Confirming Slot Reservation...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Confirm Driving Test Slot
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* My Scheduled Appointments (Right 5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                My Test Appointments History
              </h3>

              {myAppointments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                  <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">No appointments scheduled</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Book an eligible slot from the form to view confirmation details here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myAppointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono text-[11px] font-bold text-gov-navy">
                            {appt.application_number}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 mt-0.5">
                            {appt.license_type_name}
                          </h4>
                          <p className="text-xs text-slate-500">{appt.vehicle_category}</p>
                        </div>
                        <StatusBadge status={appt.appointment_status} size="sm" />
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-gov-navy shrink-0" />
                          <span className="font-semibold text-slate-800">
                            {appt.appointment_date} ({appt.appointment_time})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gov-navy shrink-0" />
                          <span className="text-slate-600 truncate">{appt.test_center}</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                          <span className="text-slate-500">Test Result:</span>
                          <span className={`font-bold ${
                            appt.test_result === 'Passed'
                              ? 'text-emerald-700'
                              : appt.test_result === 'Failed'
                              ? 'text-rose-700'
                              : 'text-amber-700'
                          }`}>
                            {appt.test_result || 'Pending Evaluation'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
