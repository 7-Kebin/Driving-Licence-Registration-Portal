import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ApplicationStatusPage from './pages/ApplicationStatusPage';
import ApplicantDashboardPage from './pages/ApplicantDashboardPage';
import ApplicationWizardPage from './pages/ApplicationWizardPage';
import AppointmentPage from './pages/AppointmentPage';
import ProfilePage from './pages/ProfilePage';
import ApplicationHistoryPage from './pages/ApplicationHistoryPage';

// Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminApplicationsPage from './pages/AdminApplicationsPage';
import AdminApplicationDetailsPage from './pages/AdminApplicationDetailsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminApplicantsPage from './pages/AdminApplicantsPage';
import AdminAuditLogsPage from './pages/AdminAuditLogsPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans selection:bg-gov-navy selection:text-white">
          <Navbar />
          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/track" element={<ApplicationStatusPage />} />

              {/* Applicant Protected Routes */}
              <Route
                path="/applicant/dashboard"
                element={
                  <ProtectedRoute>
                    <ApplicantDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/apply"
                element={
                  <ProtectedRoute>
                    <ApplicationWizardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute>
                    <AppointmentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applicant/history"
                element={
                  <ProtectedRoute>
                    <ApplicationHistoryPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/applications"
                element={
                  <AdminRoute>
                    <AdminApplicationsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/applications/:id"
                element={
                  <AdminRoute>
                    <AdminApplicationDetailsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <AdminRoute>
                    <AdminReportsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/applicants"
                element={
                  <AdminRoute>
                    <AdminApplicantsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <AdminRoute>
                    <AdminAuditLogsPage />
                  </AdminRoute>
                }
              />

              {/* Catch-all 404 */}
              <Route
                path="*"
                element={
                  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <h2 className="text-4xl font-extrabold text-gov-navy font-mono">404</h2>
                    <h3 className="text-xl font-bold text-slate-800">Page Not Found</h3>
                    <p className="text-xs text-slate-500 max-w-sm">
                      The official page or service record you requested does not exist on this portal.
                    </p>
                    <a
                      href="/"
                      className="px-5 py-2.5 rounded-xl bg-gov-navy text-white text-xs font-semibold hover:bg-gov-navy-light"
                    >
                      Return to Portal Home
                    </a>
                  </div>
                }
              />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
