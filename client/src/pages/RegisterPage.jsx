import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import ErrorMessage from '../components/ErrorMessage';
import { ShieldCheck, User, Mail, Phone, Calendar, Lock, MapPin, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile_number: '',
    date_of_birth: '',
    password: '',
    confirm_password: '',
    address: '',
    terms_accepted: false
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateClient = () => {
    const errs = {};
    if (!formData.full_name.trim() || formData.full_name.trim().length < 3) {
      errs.full_name = 'Full name must be at least 3 characters.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }
    const phoneRegex = /^[+]?[0-9\s-]{10,15}$/;
    if (!formData.mobile_number.trim() || !phoneRegex.test(formData.mobile_number.trim())) {
      errs.mobile_number = 'Please provide a valid 10-digit mobile number.';
    }
    if (!formData.date_of_birth) {
      errs.date_of_birth = 'Date of birth is required.';
    } else {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 16) {
        errs.date_of_birth = 'You must be at least 16 years of age to register.';
      }
    }
    if (!formData.password || formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    }
    if (formData.password !== formData.confirm_password) {
      errs.confirm_password = 'Passwords do not match.';
    }
    if (!formData.address.trim() || formData.address.trim().length < 10) {
      errs.address = 'Please enter complete residential address (min 10 chars).';
    }
    if (!formData.terms_accepted) {
      errs.terms_accepted = 'You must accept the portal terms and declaration.';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/applicant/dashboard', { replace: true });
    } catch (err) {
      setGeneralError(err.message || 'Registration failed.');
      if (err.errors) setErrors(err.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-xl space-y-8">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gov-navy to-gov-navy-light flex items-center justify-center text-gov-gold mx-auto shadow-md">
            <UserPlus className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Citizen Registration</h2>
          <p className="text-xs text-slate-500">
            Create an official account to apply for driving licenses, book tests, and track applications
          </p>
        </div>

        <ErrorMessage type="error" message={generalError} onDismiss={() => setGeneralError(null)} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Full Name (as per ID proof)"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="e.g. Ramesh Kumar"
              required
              error={errors.full_name}
              icon={User}
            />

            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ramesh@example.com"
              required
              error={errors.email}
              icon={Mail}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Mobile Number"
              name="mobile_number"
              type="tel"
              value={formData.mobile_number}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              required
              error={errors.mobile_number}
              icon={Phone}
            />

            <FormInput
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleChange}
              required
              error={errors.date_of_birth}
              icon={Calendar}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Password (min 8 chars)"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              error={errors.password}
              icon={Lock}
            />

            <FormInput
              label="Confirm Password"
              name="confirm_password"
              type="password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              error={errors.confirm_password}
              icon={Lock}
            />
          </div>

          <FormInput
            label="Complete Residential Address"
            name="address"
            type="textarea"
            rows={3}
            value={formData.address}
            onChange={handleChange}
            placeholder="Flat/House No., Street Name, Area, City, State, PIN Code"
            required
            error={errors.address}
            icon={MapPin}
          />

          {/* Terms and conditions checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="terms_accepted"
                checked={formData.terms_accepted}
                onChange={handleChange}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-gov-navy focus:ring-gov-navy"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I hereby declare that the particulars provided by me are true and accurate to the best of my knowledge. I understand that submitting fraudulent details or documents constitutes an offense under the Motor Vehicles Act.
              </span>
            </label>
            {errors.terms_accepted && (
              <p className="text-xs text-red-600 font-medium mt-1">
                • {errors.terms_accepted}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gov-navy hover:bg-gov-navy-light text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Registering Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Create Citizen Account
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-gov-navy hover:underline">
            Sign In to Your Account
          </Link>
        </div>
      </div>
    </div>
  );
}
