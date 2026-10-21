import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';
import FormInput from '../components/FormInput';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Phone, MapPin, Lock, Save, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    mobile_number: '',
    address: '',
    current_password: '',
    new_password: '',
    confirm_new_password: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await api.getApplicantProfile();
        setFormData(prev => ({
          ...prev,
          full_name: res.profile.full_name || '',
          mobile_number: res.profile.mobile_number || '',
          address: res.profile.address || ''
        }));
      } catch (err) {
        setError(err.message || 'Failed to fetch profile.');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (formData.new_password) {
      if (!formData.current_password) {
        setError('Please enter your current password to change password.');
        return;
      }
      if (formData.new_password !== formData.confirm_new_password) {
        setError('New passwords do not match.');
        return;
      }
      if (formData.new_password.length < 8) {
        setError('New password must be at least 8 characters.');
        return;
      }
    }

    try {
      setSaving(true);
      const res = await api.updateApplicantProfile({
        full_name: formData.full_name,
        mobile_number: formData.mobile_number,
        address: formData.address,
        current_password: formData.current_password || null,
        new_password: formData.new_password || null
      });

      updateUser(res.profile);
      setMessage('Profile particulars updated successfully.');
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_new_password: ''
      }));
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-5rem)]">
      <Sidebar role="applicant" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 overflow-x-hidden">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-gov-navy">
            Citizen Profile &amp; Credentials
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage Citizen Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Keep your residential address and contact information up-to-date for physical license card dispatches.
          </p>
        </div>

        <ErrorMessage type="error" message={error} onDismiss={() => setError(null)} />
        <ErrorMessage type="success" message={message} onDismiss={() => setMessage(null)} />

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Loading profile details..." />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-full bg-gov-navy text-white text-2xl font-bold flex items-center justify-center shadow-md">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{user?.full_name}</h3>
                <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Citizen Account Verified
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  icon={User}
                />

                <FormInput
                  label="Mobile Number"
                  name="mobile_number"
                  type="tel"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  required
                  icon={Phone}
                />
              </div>

              <FormInput
                label="Permanent Residential Address"
                name="address"
                type="textarea"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                required
                icon={MapPin}
              />

              {/* Password update section */}
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-gov-navy" /> Change Security Password
                  </h4>
                  <p className="text-xs text-slate-500">Leave blank if you do not want to alter your password</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormInput
                    label="Current Password"
                    name="current_password"
                    type="password"
                    value={formData.current_password}
                    onChange={handleChange}
                    placeholder="Current"
                  />

                  <FormInput
                    label="New Password (min 8)"
                    name="new_password"
                    type="password"
                    value={formData.new_password}
                    onChange={handleChange}
                    placeholder="New password"
                  />

                  <FormInput
                    label="Confirm New Password"
                    name="confirm_new_password"
                    type="password"
                    value={formData.confirm_new_password}
                    onChange={handleChange}
                    placeholder="Confirm new"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gov-navy hover:bg-gov-navy-light text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Profile Details
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
