const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Do not set Content-Type if FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.errors = data.errors || null;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me', { method: 'GET' }),

  // Applicant
  getApplicantProfile: () => request('/applicant/profile', { method: 'GET' }),
  updateApplicantProfile: (data) => request('/applicant/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getApplicantDashboard: () => request('/applicant/dashboard', { method: 'GET' }),
  getApplicantApplications: () => request('/applicant/applications', { method: 'GET' }),

  // Applications
  getLicenseTypes: () => request('/applications/license-types', { method: 'GET' }),
  createApplication: (appData) => request('/applications', { method: 'POST', body: JSON.stringify(appData) }),
  getApplicationById: (id) => request(`/applications/${id}`, { method: 'GET' }),
  updateApplication: (id, appData) => request(`/applications/${id}`, { method: 'PUT', body: JSON.stringify(appData) }),
  submitApplication: (id) => request(`/applications/${id}/submit`, { method: 'POST' }),
  trackApplication: (appNumber) => request(`/applications/track/${encodeURIComponent(appNumber)}`, { method: 'GET' }),

  // Documents
  uploadDocument: (applicationId, formData) => request(`/applications/${applicationId}/documents`, {
    method: 'POST',
    body: formData
  }),
  getApplicationDocuments: (applicationId) => request(`/applications/${applicationId}/documents`, { method: 'GET' }),
  deleteDocument: (documentId) => request(`/documents/${documentId}`, { method: 'DELETE' }),
  getDocumentDownloadUrl: (documentId) => `/api/documents/${documentId}/download`,

  // Appointments
  getAvailableSlots: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/appointments/available-slots${qs ? `?${qs}` : ''}`, { method: 'GET' });
  },
  bookAppointment: (bookingData) => request('/appointments', { method: 'POST', body: JSON.stringify(bookingData) }),
  getMyAppointments: () => request('/appointments/my-appointments', { method: 'GET' }),

  // Admin
  getAdminDashboard: () => request('/admin/dashboard', { method: 'GET' }),
  getAdminApplications: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/admin/applications${qs ? `?${qs}` : ''}`, { method: 'GET' });
  },
  getAdminApplicationDetails: (id) => request(`/admin/applications/${id}`, { method: 'GET' }),
  updateApplicationStatus: (id, statusData) => request(`/admin/applications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(statusData)
  }),
  verifyDocument: (docId, verificationData) => request(`/admin/documents/${docId}/verification`, {
    method: 'PATCH',
    body: JSON.stringify(verificationData)
  }),
  adminScheduleAppointment: (appointmentData) => request('/admin/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData)
  }),
  recordTestResult: (appointmentId, resultData) => request(`/admin/appointments/${appointmentId}/result`, {
    method: 'PATCH',
    body: JSON.stringify(resultData)
  }),
  issueLicense: (applicationId) => request(`/admin/applications/${applicationId}/issue-license`, {
    method: 'POST'
  }),
  getAdminReports: () => request('/admin/reports', { method: 'GET' }),
  getAdminApplicants: () => request('/admin/applicants', { method: 'GET' }),
  getAuditLogs: () => request('/admin/audit-logs', { method: 'GET' })
};
