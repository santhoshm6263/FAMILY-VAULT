import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, User, Users, AlertCircle } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useVault } from '../../context/VaultContext';
import { getFriendlyFirebaseErrorMessage } from '../../utils/firebaseErrors';

export const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register, loginWithGoogle, isFirebaseConfigured } = useAuth();
  const { updateFamilyProfile, showToast } = useVault();
  const navigate = useNavigate();

  // Validate form inputs
  const validateForm = () => {
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return false;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return false;
    }
    if (!agreed) {
      setErrorMessage('You must agree to the Terms of Service to register.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage('');

    try {
      await register(
        email.trim(),
        password,
        fullName.trim(),
        familyName.trim() || `${fullName.trim().split(' ')[0]}'s Family Vault`
      );

      if (familyName.trim()) {
        updateFamilyProfile({ name: familyName.trim() });
      }

      showToast('Registration successful! Please verify your email.', 'success');
      navigate('/verify-email');
    } catch (err) {
      console.error('Firebase Registration Error:', err);
      setErrorMessage(getFriendlyFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setErrorMessage('');

    try {
      await loginWithGoogle();
      showToast('Registered and authenticated via Google!', 'success');
      navigate('/app');
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setErrorMessage(getFriendlyFirebaseErrorMessage(err));
    } finally {
      setGoogleLoading(false);
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
        padding: '32px 16px'
      }}
    >
      <div
        className="fv-card"
        style={{
          width: '100%',
          maxWidth: '500px',
          padding: '36px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--slate-200)'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)'
              }}
            >
              <Shield size={24} />
            </div>
          </Link>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Create Your Family Vault
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '4px' }}>
            Free AES-256 encrypted space for your household
          </p>
        </div>

        {/* Error Alert */}
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

        {/* Google Signup Button */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={googleLoading || loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--slate-300)',
            backgroundColor: '#ffffff',
            color: 'var(--slate-700)',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '18px',
            cursor: googleLoading ? 'not-allowed' : 'pointer'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{googleLoading ? 'Connecting to Google...' : 'Sign up with Google'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0', color: 'var(--slate-400)', fontSize: '0.78rem' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--slate-200)' }} />
          <span style={{ padding: '0 10px', textTransform: 'uppercase' }}>or register with email</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--slate-200)' }} />
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Your Full Name"
            icon={User}
            required
            placeholder="e.g. Santhosh Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Input
            label="Family Vault Name"
            icon={Users}
            placeholder="e.g. Sharma Family Vault"
            helperText="You can invite spouse and members after creation"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            required
            placeholder="you@family.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="auth-grid-2">
            <Input
              label="Master Password (min 6 chars)"
              type="password"
              icon={Lock}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Input
              label="Confirm Password"
              type="password"
              icon={Lock}
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', color: 'var(--slate-600)', cursor: 'pointer', marginTop: '4px' }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ accentColor: 'var(--primary)', marginTop: '2px' }}
            />
            <span>
              I agree to the <strong>Terms of Service</strong> and understand documents are protected by client-side zero-knowledge encryption.
            </span>
          </label>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            style={{ width: '100%', marginTop: '6px' }}
          >
            Create My Vault Now
          </Button>
        </form>

        {/* Back to Login */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.84rem', color: 'var(--slate-500)' }}>
          Already have a vault?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Sign In Here
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 520px) {
          .auth-grid-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
