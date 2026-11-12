import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { getFriendlyFirebaseErrorMessage } from '../../utils/firebaseErrors';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { resetPassword } = useAuth();

  const validateEmail = () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your account email.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setLoading(true);
    setErrorMessage('');

    try {
      await resetPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      console.error('Password Reset Error:', err);
      setErrorMessage(getFriendlyFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
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
          maxWidth: '440px',
          padding: '36px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--slate-200)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}
          >
            <Shield size={24} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Reset Master Password
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '4px' }}>
            Enter your email to receive recovery instructions
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--rose-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--rose-200)',
              color: 'var(--rose-700)',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'var(--emerald-50)',
                color: 'var(--emerald-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              Check Your Inbox
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--slate-600)', margin: '8px 0 24px 0', lineHeight: 1.5 }}>
              Firebase has dispatched a password reset link to <strong>{email}</strong>. Open the link to create a new password.
            </p>

            <Link to="/login">
              <Button variant="secondary" style={{ width: '100%' }}>
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Input
              label="Account Email Address"
              type="email"
              icon={Mail}
              required
              placeholder="you@family.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              style={{ width: '100%' }}
            >
              Send Password Reset Link
            </Button>

            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8125rem',
                  color: 'var(--slate-500)',
                  fontWeight: 600
                }}
              >
                <ArrowLeft size={14} />
                <span>Return to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
