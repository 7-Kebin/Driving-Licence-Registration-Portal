import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  FilePlus,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  ChevronDown,
  ArrowRight,
  Car,
  Bike,
  Truck,
  Globe2,
  FileText,
  UserCheck,
  PhoneCall,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  const [trackNumber, setTrackNumber] = useState('');
  const [openFaq, setOpenFaq] = useState(0);
  const navigate = useNavigate();

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackNumber.trim()) {
      navigate(`/track?app=${encodeURIComponent(trackNumber.trim())}`);
    }
  };

  const steps = [
    {
      step: '01',
      title: 'Online Registration',
      description: 'Create your authenticated citizen profile with basic identity and residential details.',
      icon: UserCheck
    },
    {
      step: '02',
      title: 'Submit Application',
      description: 'Select your license category, vehicle class (LMV, MCWG), and complete the digital application.',
      icon: FilePlus
    },
    {
      step: '03',
      title: 'Upload Documents',
      description: 'Upload digital copies of proof of identity, address, age, photo, and signature for verification.',
      icon: FileText
    },
    {
      step: '04',
      title: 'Book Driving Test',
      description: 'Upon document approval, select your preferred RTO test center, date, and convenient slot.',
      icon: Calendar
    },
    {
      step: '05',
      title: 'Receive Smart License',
      description: 'Pass the practical evaluation track and download your authenticated Smart Driving License.',
      icon: Award
    }
  ];

  const licenseCategories = [
    {
      title: "Learner's License (LL)",
      code: "LL",
      age: "Min 16 / 18 Years",
      icon: Bike,
      desc: "Provisional permit valid for 6 months. Required before appearing for the permanent driving license test.",
      badge: "Step 1 Requirement"
    },
    {
      title: "Permanent Driving License (DL)",
      code: "DL",
      age: "Min 18 Years",
      icon: Car,
      desc: "Standard 20-year valid license for operating private light motor vehicles (cars) and motorcycles.",
      badge: "Most Popular"
    },
    {
      title: "Commercial & Transport (TR)",
      code: "TR",
      age: "Min 20 Years",
      icon: Truck,
      desc: "Professional driving authorization for commercial transport, passenger cabs, and heavy goods vehicles.",
      badge: "Commercial Grade"
    },
    {
      title: "International Driving Permit",
      code: "IDP",
      age: "Min 18 Years",
      icon: Globe2,
      desc: "Official multilingual permit allowing verified license holders to legally drive in over 150 foreign nations.",
      badge: "Global Travel"
    }
  ];

  const faqs = [
    {
      q: "What is the procedure to get a new permanent driving license?",
      a: "First, apply for a Learner's License (LL). Once issued, practice driving under supervision for a minimum of 30 days. Within 6 months, apply for the Permanent Driving License (DL), book an appointment slot at your designated RTO, and clear the practical road driving test."
    },
    {
      q: "What documents are mandatory for verification?",
      a: "You must provide: (1) Identity Proof (Aadhaar, Passport, or Voter ID), (2) Address Proof (Electricity bill, rental deed, or Aadhaar), (3) Age Proof (Birth certificate, 10th marksheet, or PAN card), (4) Passport-size photograph, and (5) Specimen signature scan."
    },
    {
      q: "How can I track the live status of my application?",
      a: "You can enter your unique Application Reference Number (e.g., DL-2026-104921) in the tracking search bar on this home page or the 'Track Application' section to view the live status, admin remarks, and next required steps."
    },
    {
      q: "What happens if an officer requests corrections on my application?",
      a: "If corrections are requested, your application moves to 'Correction Required' status with specific officer remarks. You can log into your account, re-upload the corrected document, and resubmit immediately without paying any penalty."
    },
    {
      q: "Can I reschedule my driving test appointment?",
      a: "Yes, you can reschedule your test appointment up to 24 hours prior to the booked time slot by visiting the Appointment section in your dashboard."
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gov-navy via-gov-navy-light to-slate-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle patterned background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-slate-200">
              <Sparkles className="w-4 h-4 text-gov-gold" />
              <span>Next-Gen Smart Citizen Licensing Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Apply Online for Your <br className="hidden sm:inline" />
              <span className="text-gov-gold">National Driving License</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              A seamless, paperless government service enabling citizens to register online, apply for Learner's &amp; Permanent Driving Licenses, upload verification documents, book driving test slots, and track application status in real-time.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/apply"
                className="px-6 py-3.5 rounded-xl bg-gov-gold hover:bg-amber-400 text-gov-navy-dark font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                Apply for License Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm border border-white/30 transition-all"
              >
                New Citizen Registration
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-xs">
              <div>
                <p className="font-extrabold text-lg text-white">100%</p>
                <p className="text-slate-400">Digital Paperless</p>
              </div>
              <div>
                <p className="font-extrabold text-lg text-white">&lt; 48 Hrs</p>
                <p className="text-slate-400">Average Scrutiny</p>
              </div>
              <div>
                <p className="font-extrabold text-lg text-white">24x7</p>
                <p className="text-slate-400">Real-Time Tracking</p>
              </div>
            </div>
          </div>

          {/* Hero Right: Live Status Tracking Card */}
          <div className="lg:col-span-5">
            <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gov-navy/10 flex items-center justify-center text-gov-navy">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Application Status Tracker</h3>
                  <p className="text-xs text-slate-500">Know your current application progress</p>
                </div>
              </div>

              <form onSubmit={handleTrackSubmit} className="space-y-4">
                <div>
                  <label htmlFor="heroTrackNo" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Application Reference Number
                  </label>
                  <input
                    id="heroTrackNo"
                    type="text"
                    value={trackNumber}
                    onChange={(e) => setTrackNumber(e.target.value)}
                    placeholder="e.g. DL-2026-104921"
                    className="w-full text-sm font-mono px-4 py-3 rounded-xl border border-slate-300 focus:border-gov-navy focus:ring-2 focus:ring-gov-navy/20 outline-none uppercase transition-all"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Check your receipt or SMS acknowledgment for your 14-digit reference number.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gov-navy hover:bg-gov-navy-light text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" /> Track Status Now
                </button>
              </form>

              {/* Sample quick numbers for instant demonstration */}
              <div className="pt-4 border-t border-slate-100 text-xs">
                <p className="font-semibold text-slate-600 mb-2">Try sample demonstration numbers:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { no: 'DL-2026-104921', label: 'Test Scheduled' },
                    { no: 'DL-2026-108234', label: 'Pending Review' },
                    { no: 'DL-2026-102115', label: 'License Issued' },
                    { no: 'DL-2026-109982', label: 'Correction Req.' }
                  ].map((item) => (
                    <button
                      key={item.no}
                      onClick={() => setTrackNumber(item.no)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-gov-navy rounded-md font-mono text-[11px] transition-colors border border-slate-200"
                    >
                      {item.no} <span className="text-[10px] text-slate-400">({item.label})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Process Roadmap */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="text-xs font-bold text-gov-navy-light uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Simplified Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            5 Simple Steps to Get Your Driving License
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A transparent and structured licensing system designed for citizen convenience and road safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.step}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 relative group"
              >
                <span className="text-3xl font-black text-slate-200 group-hover:text-gov-navy/20 transition-colors">
                  {st.step}
                </span>
                <div className="w-12 h-12 rounded-xl bg-gov-navy/10 text-gov-navy flex items-center justify-center my-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-2">{st.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{st.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* License Categories & Eligibility */}
      <section id="eligibility" className="bg-slate-100/70 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-gov-navy-light uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-slate-200">
              License Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Choose the Appropriate License Type
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Review eligibility age criteria and operational permissions for vehicle classes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {licenseCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.code}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-gov-navy transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-gov-navy">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        {cat.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-slate-900">{cat.title}</h3>
                      <p className="text-xs font-semibold text-gov-navy mt-0.5">Eligibility: {cat.age}</p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{cat.desc}</p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <Link
                      to="/apply"
                      className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-gov-navy hover:text-white text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      Apply for {cat.code} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mandatory Documents Checklist */}
      <section id="documents-info" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-gov-navy to-gov-navy-light text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gov-gold">
                Mandatory Documentation
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Required Verification Documents
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Ensure clear color scans (PDF, JPG, or PNG up to 5MB) of the following mandatory proofs before beginning your application to avoid correction delays.
              </p>
              <div className="pt-2">
                <Link
                  to="/apply"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gov-navy font-bold text-xs hover:bg-slate-100 shadow-sm transition-all"
                >
                  Start Application with Documents <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {[
                { title: 'Proof of Identity (POI)', desc: 'Aadhaar Card, Indian Passport, or Voter ID Card.' },
                { title: 'Proof of Address (POA)', desc: 'Aadhaar, Utility Bill (Electricity/Water), or Bank Statement.' },
                { title: 'Proof of Date of Birth (DOB)', desc: '10th Marksheet, Birth Certificate, or PAN Card.' },
                { title: 'Passport-Size Photograph', desc: 'Recent color photograph with plain white background.' },
                { title: 'Specimen Signature', desc: 'Clear handwritten signature on clean white paper.' },
                { title: 'Physical Fitness Declaration', desc: 'Self-declaration Form 1 included within application.' }
              ].map((doc, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 space-y-1">
                  <div className="flex items-center gap-2 text-gov-gold font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{doc.title}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed pl-6">{doc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-gov-navy-light uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Answers to common questions regarding driving licenses, documents, tests, and regulations.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all shadow-2xs"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-gov-navy transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-gov-navy' : 'text-slate-400'
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
