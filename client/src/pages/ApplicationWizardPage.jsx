import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import FormInput from '../components/FormInput';
import DocumentUploader from '../components/DocumentUploader';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FilePlus,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  User,
  Car,
  MapPin,
  FileText,
  AlertCircle,
  Award
} from 'lucide-react';

const VEHICLE_CATEGORIES_MAP = {
  1: [ // Learner's License
    'Motorcycle without Gear (MCWOG - Engine <= 50cc)',
    'Motorcycle with Gear (MCWG)',
    'Light Motor Vehicle (LMV - Car/Van)',
    'MCWG + LMV (Two Wheeler & Private Car)'
  ],
  2: [ // Permanent Driving License
    'Motorcycle with Gear (MCWG)',
    'Light Motor Vehicle (LMV - Private Car)',
    'LMV + MCWG (Car & Two Wheeler)',
    'Invalid Carriage / Adapted Vehicle'
  ],
  3: [ // Commercial
    'Medium Goods Vehicle (MGV)',
    'Heavy Goods Vehicle (HGV)',
    'Heavy Passenger Motor Vehicle (HPMV - Bus)',
    'Commercial Cab / Maxi Cab'
  ],
  4: [ // IDP
    'International Driving Permit (All Categories Validated)'
  ]
};

const TEST_CENTERS = [
  'RTO Ahmedabad West (GJ-01)',
  'RTO Bangalore Central (KA-01)',
  'RTO Delhi Central (DL-01)',
  'RTO Mumbai Central (MH-01)',
  'RTO Kolkata South (WB-02)',
  'RTO Chennai Central (TN-01)'
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function ApplicationWizardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');

  const [step, setStep] = useState(1);
  const [licenseTypes, setLicenseTypes] = useState([]);
  const [createdApplicationId, setCreatedApplicationId] = useState(editId || null);
  const [createdAppNumber, setCreatedAppNumber] = useState('');
  const [uploadedDocsMap, setUploadedDocsMap] = useState({});

  const [formData, setFormData] = useState({
    license_type_id: 1,
    vehicle_category: 'Motorcycle with Gear (MCWG)',
    applicantName: user?.full_name || '',
    guardianName: '',
    relation: 'Father',
    gender: 'Male',
    bloodGroup: 'B+',
    emergencyContact: '',
    identificationMarks: 'None',
    address: user?.address || '',
    testCenter: TEST_CENTERS[0],
    existingLicenseNumber: '',
    declared: false
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load license types and existing application if editing
  useEffect(() => {
    async function init() {
      try {
        setInitialLoading(true);
        const typesRes = await api.getLicenseTypes();
        setLicenseTypes(typesRes.licenseTypes || []);

        if (editId) {
          const appRes = await api.getApplicationById(editId);
          const app = appRes.application;
          setCreatedApplicationId(app.id);
          setCreatedAppNumber(app.application_number);

          const data = app.application_data || {};
          setFormData({
            license_type_id: app.license_type_id,
            vehicle_category: app.vehicle_category,
            applicantName: data.applicantName || user?.full_name || '',
            guardianName: data.guardianName || '',
            relation: data.relation || 'Father',
            gender: data.gender || 'Male',
            bloodGroup: data.bloodGroup || 'B+',
            emergencyContact: data.emergencyContact || '',
            identificationMarks: data.identificationMarks || 'None',
            address: user?.address || '',
            testCenter: data.testCenter || TEST_CENTERS[0],
            existingLicenseNumber: data.existingLicenseNumber || '',
            declared: !!data.declared
          });

          // Map documents
          const docsMap = {};
          (app.documents || []).forEach(doc => {
            docsMap[doc.document_type] = doc;
          });
          setUploadedDocsMap(docsMap);
        }
      } catch (err) {
        setGeneralError(err.message || 'Failed to load initial data.');
      } finally {
        setInitialLoading(false);
      }
    }

    init();
  }, [editId, user]);

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

  // Step 1 -> Step 2 validation
  const validateStep1 = () => {
    const errs = {};
    if (!formData.license_type_id) errs.license_type_id = 'Please select a license type.';
    if (!formData.vehicle_category) errs.vehicle_category = 'Please select vehicle category.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 -> Step 3 validation
  const validateStep2 = () => {
    const errs = {};
    if (!formData.applicantName.trim()) errs.applicantName = 'Applicant name is required.';
    if (!formData.guardianName.trim()) errs.guardianName = 'Parent / Guardian name is required.';
    if (!formData.emergencyContact.trim()) errs.emergencyContact = 'Emergency contact number is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 3 -> Step 4 validation & save draft
  const validateStep3AndSave = async () => {
    const errs = {};
    if (!formData.address.trim()) errs.address = 'Residential address is required.';
    if (!formData.testCenter) errs.testCenter = 'Please select your preferred RTO test center.';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return false;
    }

    // Save or update draft in database
    try {
      setLoading(true);
      if (!createdApplicationId) {
        const payload = {
          license_type_id: parseInt(formData.license_type_id, 10),
          vehicle_category: formData.vehicle_category,
          application_data: formData,
          submit_now: false
        };
        const res = await api.createApplication(payload);
        setCreatedApplicationId(res.application.id);
        setCreatedAppNumber(res.application.application_number);
      } else {
        await api.updateApplication(createdApplicationId, {
          vehicle_category: formData.vehicle_category,
          application_data: formData
        });
      }
      return true;
    } catch (err) {
      setGeneralError(err.message || 'Failed to save application draft.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Document upload handler
  const handleDocumentUpload = async (docType, file) => {
    if (!createdApplicationId) {
      throw new Error('Application draft must be saved first.');
    }

    const form = new FormData();
    form.append('document_type', docType);
    form.append('file', file);

    const res = await api.uploadDocument(createdApplicationId, form);
    setUploadedDocsMap(prev => ({
      ...prev,
      [docType]: res.document
    }));
  };

  // Final submission
  const handleFinalSubmit = async () => {
    if (!formData.declared) {
      setGeneralError('Please check the declaration box before submitting.');
      return;
    }

    // Ensure mandatory documents uploaded
    const mandatory = ['identity_proof', 'address_proof', 'photograph', 'signature'];
    const missing = mandatory.filter(m => !uploadedDocsMap[m]);
    if (missing.length > 0) {
      setGeneralError(`Please upload all mandatory documents (${missing.join(', ')}).`);
      return;
    }

    try {
      setLoading(true);
      // If editing correction required, call updateApplication with resubmit=true
      if (editId) {
        await api.updateApplication(createdApplicationId, {
          vehicle_category: formData.vehicle_category,
          application_data: formData,
          resubmit: true
        });
      } else {
        await api.submitApplication(createdApplicationId);
      }
      navigate(`/track?app=${createdAppNumber || createdApplicationId}`);
    } catch (err) {
      setGeneralError(err.message || 'Submission failed. Please verify all requirements.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner text="Loading license application form..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-gov-navy uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Form 2 / Form 4 Licensing Application
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Application for Driving License
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Please fill in all mandatory particulars truthfully under the provisions of the Motor Vehicles Act
        </p>
        {createdAppNumber && (
          <div className="inline-block mt-2 font-mono text-xs font-bold text-gov-navy bg-slate-100 px-3 py-1 rounded-lg border border-slate-300">
            Application Reference: {createdAppNumber}
          </div>
        )}
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          {[
            { num: 1, title: 'Category' },
            { num: 2, title: 'Personal' },
            { num: 3, title: 'RTO & Address' },
            { num: 4, title: 'Documents' },
            { num: 5, title: 'Declaration' }
          ].map((st, i) => (
            <React.Fragment key={st.num}>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    step === st.num
                      ? 'bg-gov-navy text-white ring-4 ring-gov-navy/20'
                      : step > st.num
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {step > st.num ? <CheckCircle2 className="w-4 h-4" /> : st.num}
                </div>
                <span className={`text-[11px] font-semibold hidden sm:inline ${
                  step === st.num ? 'text-gov-navy' : 'text-slate-500'
                }`}>
                  {st.title}
                </span>
              </div>
              {i < 4 && <div className="flex-1 h-0.5 bg-slate-200 mx-2 hidden sm:block" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <ErrorMessage type="error" message={generalError} onDismiss={() => setGeneralError(null)} />

      {/* Form Steps Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
        {/* Step 1: License Type & Vehicle Category */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Step 1: License Type &amp; Vehicle Category</h3>
              <p className="text-xs text-slate-500">Select the type of license you wish to obtain</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {licenseTypes.map((type) => {
                const selected = parseInt(formData.license_type_id, 10) === type.id;
                return (
                  <label
                    key={type.id}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between ${
                      selected
                        ? 'border-gov-navy bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                          {type.code}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 mt-0.5">{type.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{type.description}</p>
                      </div>
                      <input
                        type="radio"
                        name="license_type_id"
                        value={type.id}
                        checked={selected}
                        onChange={(e) => {
                          const newTypeId = parseInt(e.target.value, 10);
                          const categories = VEHICLE_CATEGORIES_MAP[newTypeId] || [];
                          setFormData(prev => ({
                            ...prev,
                            license_type_id: newTypeId,
                            vehicle_category: categories[0] || ''
                          }));
                        }}
                        className="mt-1 text-gov-navy"
                      />
                    </div>
                    <span className="mt-3 text-[11px] font-semibold text-gov-navy">
                      Minimum Age: {type.minimum_age} years
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Vehicle Category Selector */}
            <div className="space-y-1.5 pt-2">
              <label htmlFor="vehicle_category" className="block text-xs font-semibold text-slate-700">
                Class of Vehicle (COV) <span className="text-red-500">*</span>
              </label>
              <select
                id="vehicle_category"
                name="vehicle_category"
                value={formData.vehicle_category}
                onChange={handleChange}
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:border-gov-navy focus:ring-2 focus:ring-gov-navy/20 outline-none"
              >
                {(VEHICLE_CATEGORIES_MAP[formData.license_type_id] || []).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Personal Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Step 2: Applicant &amp; Guardian Details</h3>
              <p className="text-xs text-slate-500">Provide personal particulars as reflected on official ID proofs</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Applicant Full Name"
                name="applicantName"
                value={formData.applicantName}
                onChange={handleChange}
                placeholder="Full Name"
                required
                error={errors.applicantName}
                icon={User}
              />

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 space-y-1.5">
                  <label htmlFor="relation" className="block text-xs font-semibold text-slate-700">Relation</label>
                  <select
                    id="relation"
                    name="relation"
                    value={formData.relation}
                    onChange={handleChange}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 outline-none"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <FormInput
                    label="Parent / Guardian Name"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleChange}
                    placeholder="Guardian Name"
                    required
                    error={errors.guardianName}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="gender" className="block text-xs font-semibold text-slate-700">Gender *</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Transgender</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="bloodGroup" className="block text-xs font-semibold text-slate-700">Blood Group *</label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 outline-none"
                >
                  {BLOOD_GROUPS.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <FormInput
                label="Emergency Contact Phone"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="+91 98765 00000"
                required
                error={errors.emergencyContact}
              />
            </div>

            <FormInput
              label="Visible Identification Marks (if any)"
              name="identificationMarks"
              value={formData.identificationMarks}
              onChange={handleChange}
              placeholder="e.g. Mole on right wrist / Scar on forehead"
            />
          </div>
        )}

        {/* Step 3: Address & RTO Selection */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Step 3: Residential Address &amp; RTO Jurisdiction</h3>
              <p className="text-xs text-slate-500">Choose the regional transport office where your driving test will be conducted</p>
            </div>

            <FormInput
              label="Permanent Residential Address"
              name="address"
              type="textarea"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder="Flat No, Street, Landmark, City, State, PIN code"
              required
              error={errors.address}
              icon={MapPin}
            />

            <div className="space-y-1.5">
              <label htmlFor="testCenter" className="block text-xs font-semibold text-slate-700">
                Designated RTO Test Center <span className="text-red-500">*</span>
              </label>
              <select
                id="testCenter"
                name="testCenter"
                value={formData.testCenter}
                onChange={handleChange}
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:border-gov-navy focus:ring-2 focus:ring-gov-navy/20 outline-none"
              >
                {TEST_CENTERS.map(tc => (
                  <option key={tc} value={tc}>{tc}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">
                Your practical test evaluation and physical license card dispatch will be processed by this authority.
              </p>
            </div>

            {formData.license_type_id === 2 && (
              <FormInput
                label="Existing Learner's License Number (if already issued)"
                name="existingLicenseNumber"
                value={formData.existingLicenseNumber}
                onChange={handleChange}
                placeholder="e.g. KA01-LL-2025-99812"
              />
            )}
          </div>
        )}

        {/* Step 4: Document Uploads */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Step 4: Upload Verification Documents</h3>
              <p className="text-xs text-slate-500">
                All 4 mandatory documents must be uploaded before submitting your application for scrutiny.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DocumentUploader
                documentType="identity_proof"
                title="Proof of Identity (POI)"
                description="Aadhaar Card, Indian Passport, or Voter ID Card"
                existingDoc={uploadedDocsMap['identity_proof']}
                onUpload={handleDocumentUpload}
                required
              />

              <DocumentUploader
                documentType="address_proof"
                title="Proof of Address (POA)"
                description="Utility Bill, Rent Agreement, or Aadhaar"
                existingDoc={uploadedDocsMap['address_proof']}
                onUpload={handleDocumentUpload}
                required
              />

              <DocumentUploader
                documentType="photograph"
                title="Passport-Size Photograph"
                description="Clear color frontal photo (plain white background)"
                existingDoc={uploadedDocsMap['photograph']}
                onUpload={handleDocumentUpload}
                required
              />

              <DocumentUploader
                documentType="signature"
                title="Specimen Signature"
                description="Handwritten signature on plain white paper"
                existingDoc={uploadedDocsMap['signature']}
                onUpload={handleDocumentUpload}
                required
              />
            </div>

            {/* Optional Age Proof */}
            <DocumentUploader
              documentType="age_proof"
              title="Proof of Age (Optional if verified by POI)"
              description="10th Marksheet, Birth Certificate, or PAN Card"
              existingDoc={uploadedDocsMap['age_proof']}
              onUpload={handleDocumentUpload}
              required={false}
            />
          </div>
        )}

        {/* Step 5: Review & Declaration */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Step 5: Review &amp; Statutory Declaration</h3>
              <p className="text-xs text-slate-500">Review your entered particulars before final submission</p>
            </div>

            {/* Review Summary Card */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">Applicant Name</span>
                  <p className="font-bold text-slate-900 text-sm">{formData.applicantName}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">License Class</span>
                  <p className="font-bold text-gov-navy">{formData.vehicle_category}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">Guardian</span>
                  <p className="font-semibold text-slate-800">{formData.guardianName} ({formData.relation})</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">RTO Center</span>
                  <p className="font-semibold text-slate-800">{formData.testCenter}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">Gender / Blood Group</span>
                  <p className="font-semibold text-slate-800">{formData.gender} / {formData.bloodGroup}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">Emergency Phone</span>
                  <p className="font-semibold text-slate-800">{formData.emergencyContact}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Residential Address</span>
                <p className="font-semibold text-slate-800 mt-0.5">{formData.address}</p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Uploaded Documents:</span>
                <span className="font-bold text-emerald-700">
                  {Object.keys(uploadedDocsMap).length} Verified Files Attached
                </span>
              </div>
            </div>

            {/* Declaration Checkbox */}
            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="declared"
                  checked={formData.declared}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-gov-navy focus:ring-gov-navy"
                />
                <span className="text-xs text-slate-700 leading-relaxed font-medium">
                  I solemnly declare that I do not suffer from any epilepsy or sudden attacks of giddiness, that my eyesight and hearing are normal, and that I am physically fit to hold a driving license. All information provided above is authentic and verifiable.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                setGeneralError(null);
                setStep(step - 1);
              }}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Step
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            {step < 5 ? (
              <button
                type="button"
                onClick={async () => {
                  setGeneralError(null);
                  if (step === 1 && !validateStep1()) return;
                  if (step === 2 && !validateStep2()) return;
                  if (step === 3) {
                    const saved = await validateStep3AndSave();
                    if (!saved) return;
                  }
                  if (step === 4) {
                    const mandatory = ['identity_proof', 'address_proof', 'photograph', 'signature'];
                    const missing = mandatory.filter(m => !uploadedDocsMap[m]);
                    if (missing.length > 0) {
                      setGeneralError(`Please upload all 4 required documents before proceeding. Missing: ${missing.join(', ')}.`);
                      return;
                    }
                  }
                  setStep(step + 1);
                }}
                disabled={loading}
                className="px-5 py-2.5 text-xs font-semibold bg-gov-navy hover:bg-gov-navy-light text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
              >
                {loading ? 'Saving...' : 'Save & Continue'} <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading || !formData.declared}
                className="px-6 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 shadow-md transition-all disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Submit Application Officially
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
