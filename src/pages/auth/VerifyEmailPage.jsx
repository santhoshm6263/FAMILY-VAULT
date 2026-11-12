import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, RotateCw, LogOut, Shield, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVault } from '../../context/VaultContext';
import { Button } from '../../components/common/Button';

export const VerifyEmailPage = () => {
  const { currentUser, resendVerificationEmail, reloadUser, logout, isFirebaseConfigured } = useAuth();
  const { showToast } = useVault();
  const navigate = useNavigate();

  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResending(true);
    try {
      await resendVerificationEmail();
      showToast(`Verification link resent to ${currentUser?.email}`, 'success');
      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      showToast(err.message || 'Failed to resend verification email', 'error');
    } finally {
      setResending(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const isVerified = await reloadUser();
      if (isVerified) {
        showToast('Email verified successfully! Welcome to FamilyVault.', 'success');
        navigate('/app');
      } else {
        showToast('Email is not verified yet. Please check your inbox or spam folder.', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Error checking verification status', 'error');
    } finally {
      setChecking(false);
    }
  };

  const handleSimulateVerify = async () => {
    await reloadUser();
    showToast('Email marked as verified (Development Simulation)', 'success');
    navigate('/app');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--slate-50)',
        padding: '24px 16px'
      }}
    >
      <div
        className="fv-card"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '36px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--slate-200)',
          textAlign: 'center'
        }}
      >
        {/* Email Icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-50)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            border: '2px solid var(--primary-100)'
          }}
        >
          <Mail size={32} />
        </div>

        {/* Heading */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
          Verify Your Email Address
        </h2>

        <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginTop: '8px', lineHeight: 1.6 }}>
          We have sent a confirmation link to:
        </p>

        <div
          style={{
            display: 'inline-block',
            margin: '10px 0 16px 0',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--slate-100)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '0.85rem',
            color: 'var(--slate-800)'
          }}
        >
          {currentUser?.email || 'your-email@domain.com'}
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', lineHeight: 1.5, marginBottom: '24px' }}>
          Please click the verification link in the email to unlock full access to your family vault. If you don't see it, be sure to check your spam or junk folder.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Button
            variant="primary"
            size="lg"
            icon={ArrowRight}
            iconPosition="right"
            loading={checking}
            onClick={handleCheckStatus}
            style={{ width: '100%' }}
          >
            I've Verified My Email / Check Again
          </Button>

          <Button
            variant="secondary"
            icon={RotateCw}
            loading={resending}
            disabled={resendCooldown > 0}
            onClick={handleResend}
            style={{ width: '100%' }}
          >
            {resendCooldown > 0 ? `Resend Available in ${resendCooldown}s` : 'Resend Verification Email'}
          </Button>

          {/* Dev Mode instant bypass if running locally without real SMTP */}
          {!isFirebaseConfigured && (
            <button
              type="button"
              onClick={handleSimulateVerify}
              style={{
                marginTop: '6px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--emerald-50)',
                border: '1px solid var(--emerald-200)',
                color: 'var(--emerald-700)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Simulate Instant Verification (Dev / Evaluation Mode)
            </button>
          )}

          <button
            type="button"
            onClick={handleLogout}
            style={{
              marginTop: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.8125rem',
              color: 'var(--slate-500)',
              fontWeight: 600
            }}
          >
            <LogOut size={14} />
            <span>Sign In with a Different Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

