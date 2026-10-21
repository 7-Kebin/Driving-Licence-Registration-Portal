import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Phone, Mail, MapPin, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gov-navy-dark text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800 text-sm">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gov-navy flex items-center justify-center text-gov-gold border border-slate-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base tracking-wide">SARATHI PORTAL</h3>
                <p className="text-xs text-slate-400">Ministry of Road Transport & Highways</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Official centralized citizen portal for online learner's driving licenses, permanent driving licenses, document verification, and road driving test appointment booking.
            </p>
            <div className="inline-flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              RDBMS Verified &amp; Encrypted End-to-End
            </div>
          </div>

          {/* Quick citizen services */}
          <div>
            <h4 className="font-bold text-white mb-4 tracking-wide text-xs uppercase">Citizen Services</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/apply" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-gov-gold">›</span> Apply for Learner's License (LL)
                </Link>
              </li>
              <li>
                <Link to="/apply" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-gov-gold">›</span> Apply for Permanent Driving License
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-gov-gold">›</span> Track Live Application Status
                </Link>
              </li>
              <li>
                <Link to="/appointments" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-gov-gold">›</span> Book Driving Test Slot
                </Link>
              </li>
              <li>
                <a href="#eligibility" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-gov-gold">›</span> Minimum Age &amp; Category Rules
                </a>
              </li>
              <li>
                <a href="#documents-info" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-gov-gold">›</span> Required Documents Checklist
                </a>
              </li>
            </ul>
          </div>

          {/* Guidelines & Policies */}
          <div>
            <h4 className="font-bold text-white mb-4 tracking-wide text-xs uppercase">Legal &amp; Governance</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#faq" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-gov-gold">›</span> Frequently Asked Questions (FAQ)
                </a>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white cursor-pointer transition-colors flex items-center gap-1.5">
                  <span className="text-gov-gold">›</span> Motor Vehicles Act &amp; Guidelines
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white cursor-pointer transition-colors flex items-center gap-1.5">
                  <span className="text-gov-gold">›</span> Citizen Charter &amp; Service Standards
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white cursor-pointer transition-colors flex items-center gap-1.5">
                  <span className="text-gov-gold">›</span> Data Privacy &amp; Security Policy
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white cursor-pointer transition-colors flex items-center gap-1.5">
                  <span className="text-gov-gold">›</span> Terms of Electronic Service
                </span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-bold text-white mb-4 tracking-wide text-xs uppercase">Central Helpdesk</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-gov-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">1800-180-035 (Toll-Free)</p>
                  <p className="text-slate-500">Mon - Sat: 9:00 AM to 6:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-gov-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">helpdesk-license@portal.gov</p>
                  <p className="text-slate-500">24x7 Automated Status Response</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gov-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Transport Bhawan</p>
                  <p className="text-slate-500">1, Parliament Street, New Delhi 110001</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Ministry of Road Transport &amp; Highways, Government of India. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <span>Powered by National Informatics Framework</span>
            <span className="text-slate-700">|</span>
            <span>Version 2.4.0 (Secure Build)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
