import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout, AuthLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Auth Pages
import { CitizenLogin, OfficerLogin } from './pages/auth/CitizenLogin';
import { CitizenRegister } from './pages/auth/CitizenRegister';

// Citizen Pages
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { MyProfile } from './pages/citizen/MyProfile';
import { RecommendedSchemes } from './pages/citizen/RecommendedSchemes';
import { SchemeDetails } from './pages/citizen/SchemeDetails';
import { ApplyScheme } from './pages/citizen/ApplyScheme';
import { MyApplications } from './pages/citizen/MyApplications';
import { ApplicationDetails } from './pages/citizen/ApplicationDetails';
import { Certificates } from './pages/citizen/Certificates';
import { Grievances } from './pages/citizen/Grievances';
import { Suggestions } from './pages/citizen/Suggestions';

// Officer Pages
import { OfficerDashboard } from './pages/officer/OfficerDashboard';
import { OfficerApplications } from './pages/officer/OfficerApplications';
import { OfficerApplicationDetails } from './pages/officer/OfficerApplicationDetails';
import { OfficerCertificates } from './pages/officer/OfficerCertificates';
import { OfficerGrievances } from './pages/officer/OfficerGrievances';
import { OfficerSuggestions } from './pages/officer/OfficerSuggestions';
import { VillageDashboard } from './pages/officer/VillageDashboard';
import { DevelopmentWorks } from './pages/officer/DevelopmentWorks';
import { BudgetTransparency } from './pages/officer/BudgetTransparency';

const RootRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={role === 'OFFICER' ? '/officer/dashboard' : '/citizen/dashboard'} replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root Navigation Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<CitizenLogin />} />
            <Route path="/register" element={<CitizenRegister />} />
            <Route path="/officer/login" element={<OfficerLogin />} />
          </Route>

          {/* Citizen Protected Routes */}
          <Route element={<ProtectedRoute allowedRole="CITIZEN" />}>
            <Route element={<MainLayout />}>
              <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
              <Route path="/citizen/profile" element={<MyProfile />} />
              <Route path="/citizen/schemes" element={<RecommendedSchemes />} />
              <Route path="/citizen/schemes/:id" element={<SchemeDetails />} />
              <Route path="/citizen/apply/:id" element={<ApplyScheme />} />
              <Route path="/citizen/applications" element={<MyApplications />} />
              <Route path="/citizen/applications/:id" element={<ApplicationDetails />} />
              <Route path="/citizen/certificates" element={<Certificates />} />
              <Route path="/citizen/grievances" element={<Grievances />} />
              <Route path="/citizen/suggestions" element={<Suggestions />} />
            </Route>
          </Route>

          {/* Officer Protected Routes */}
          <Route element={<ProtectedRoute allowedRole="OFFICER" />}>
            <Route element={<MainLayout />}>
              <Route path="/officer/dashboard" element={<OfficerDashboard />} />
              <Route path="/officer/applications" element={<OfficerApplications />} />
              <Route path="/officer/applications/:id" element={<OfficerApplicationDetails />} />
              <Route path="/officer/certificates" element={<OfficerCertificates />} />
              <Route path="/officer/grievances" element={<OfficerGrievances />} />
              <Route path="/officer/suggestions" element={<OfficerSuggestions />} />
              <Route path="/officer/village" element={<VillageDashboard />} />
              <Route path="/officer/development-works" element={<DevelopmentWorks />} />
              <Route path="/officer/budget" element={<BudgetTransparency />} />
            </Route>
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
