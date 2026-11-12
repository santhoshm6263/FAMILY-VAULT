import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { VaultProvider } from './context/VaultContext';

// Protected Route Guard
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Layouts
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { FamilyPage } from './pages/family/FamilyPage';
import { DocumentsPage } from './pages/documents/DocumentsPage';
import { SettingsPage } from './pages/settings/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <VaultProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Authenticated & Verified Protected Dashboard Routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<Navigate to="/app" replace />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="family" element={<FamilyPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </VaultProvider>
    </AuthProvider>
  );
}
