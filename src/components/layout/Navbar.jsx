import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--slate-200)'
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '0 24px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)'
            }}
          >
            <Shield size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
                Family<span style={{ color: 'var(--primary)' }}>Vault</span>
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--primary-50)',
                  color: 'var(--primary)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: '1px solid var(--primary-200)',
                  textTransform: 'uppercase'
                }}
              >
                AES-256
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '32px',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: 'var(--slate-600)'
          }}
          className="desktop-nav"
        >
          <a href="#features" style={{ transition: 'color 0.15s' }} className="nav-link">
            Features
          </a>
          <a href="#categories" style={{ transition: 'color 0.15s' }} className="nav-link">
            Document Categories
          </a>
          <a href="#security" style={{ transition: 'color 0.15s' }} className="nav-link">
            Security Architecture
          </a>
          <a href="#how-it-works" style={{ transition: 'color 0.15s' }} className="nav-link">
            How It Works
          </a>
        </nav>

        {/* CTA Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthenticated ? (
            <Button
              variant="primary"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('/app')}
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="md">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="md">
                  Get Started Free
                </Button>
              </Link>
            </>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--slate-700)',
              display: 'none'
            }}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--slate-200)',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '8px 0', fontWeight: 600, color: 'var(--slate-700)' }}
          >
            Features
          </a>
          <a
            href="#categories"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '8px 0', fontWeight: 600, color: 'var(--slate-700)' }}
          >
            Document Categories
          </a>
          <a
            href="#security"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '8px 0', fontWeight: 600, color: 'var(--slate-700)' }}
          >
            Security Architecture
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '8px 0', fontWeight: 600, color: 'var(--slate-700)' }}
          >
            How It Works
          </a>
          <div style={{ height: '1px', backgroundColor: 'var(--slate-100)', margin: '4px 0' }} />
          {!isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" style={{ width: '100%' }}>
                  Log in
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" style={{ width: '100%' }}>
                  Get Started Free
                </Button>
              </Link>
            </div>
          ) : (
            <Button
              variant="primary"
              style={{ width: '100%' }}
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/app');
              }}
            >
              Open Dashboard
            </Button>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
        }
        @media (max-width: 859px) {
          .mobile-menu-btn {
            display: flex !important;
          }
        }
        .nav-link:hover {
          color: var(--primary) !important;
        }
      `}</style>
    </header>
  );
};

