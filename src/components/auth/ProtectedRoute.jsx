import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Check if email verification is required (defaults to true for high security)
  const requireEmailVerification = import.meta.env.VITE_REQUIRE_EMAIL_VERIFICATION !== 'false';

  // 1. Loading State while Firebase restores authentication state
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--slate-50)',
          gap: '16px'
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
          }}
        >
          <Shield size={26} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate-600)', fontSize: '0.9rem', fontWeight: 600 }}>
          <Loader2 size={18} className="animate-spin" />
          <span>Restoring encrypted vault session...</span>
        </div>
      </div>
    );
  }

  // 2. Not Authenticated: redirect to /login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Email Verification Check: do not allow unverified users into protected areas
  if (requireEmailVerification && !currentUser.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

