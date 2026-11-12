import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  Users,
  FileCheck,
  CreditCard,
  Fingerprint,
  BookOpen,
  Vote,
  Car,
  ArrowRight,
  Eye,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/common/Button';
import { DOCUMENT_CATEGORIES } from '../data/categories';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: 'var(--slate-900)' }}>
      {/* Navigation Header */}
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          padding: '80px 24px 64px 24px',
          background: 'radial-gradient(ellipse at top, #eef2ff 0%, #ffffff 70%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          {/* Security Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-50)',
              border: '1px solid var(--primary-200)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--primary)',
              marginBottom: '24px'
            }}
          >
            <Shield size={15} />
            <span>Military-Grade AES-256 Client-Side Encrypted Vault</span>
            <span style={{ backgroundColor: 'var(--primary)', color: '#ffffff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
              Phase 1 Live
            </span>
          </div>

          {/* Hero Heading */}
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: 'var(--slate-900)',
              marginBottom: '20px'
            }}
          >
            Your Entire Family’s Critical Documents.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Organized, Encrypted & Always Handshake-Ready.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '1.15rem',
              lineHeight: 1.6,
              color: 'var(--slate-600)',
              maxWidth: '740px',
              margin: '0 auto 36px auto'
            }}
          >
            Safely store Aadhaar, PAN, Passports, Driving Licenses, and medical records for your spouse, children, and parents. Dual-sided captures, masked ID protection, and granular family roles in one unified vault.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              marginBottom: '48px'
            }}
          >
            <Link to="/register">
              <Button size="lg" variant="primary" icon={ArrowRight} iconPosition="right">
                Create Free Family Vault
              </Button>
            </Link>

            <Link to="/login">
              <button
                className="btn btn-secondary btn-lg"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <span>Sign In to Vault</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Dashboard Preview Graphic */}
        <div style={{ maxWidth: '1080px', margin: '56px auto 0 auto', position: 'relative' }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.18)',
              border: '1px solid var(--slate-200)',
              overflow: 'hidden'
            }}
          >
            {/* Window header */}
            <div
              style={{
                backgroundColor: 'var(--slate-100)',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: '1px solid var(--slate-200)'
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <div
                style={{
                  margin: '0 auto',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--slate-500)',
                  backgroundColor: '#ffffff',
                  padding: '3px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--slate-200)'
                }}
              >
                familyvault.io/app/dashboard • AES-256 Handshake Verified
              </div>
            </div>

            {/* Mock Dashboard Sneak Peek */}
            <div style={{ padding: '28px', backgroundColor: 'var(--slate-50)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="hero-preview-grid">
              <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 600 }}>TOTAL MEMBERS</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '4px' }}>5 Active</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', fontWeight: 600, marginTop: '2px' }}>+1 Pending Invitation</div>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 600 }}>ENCRYPTED DOCUMENTS</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>9 Stored</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '2px' }}>Across 6 Identity Categories</div>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 600 }}>VAULT HEALTH</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-600)', marginTop: '4px' }}>100% Protected</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '2px' }}>Client Zero-Knowledge Key</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Document Categories Showcase Section */}
      <section id="categories" style={{ padding: '80px 24px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
              Built Specifically for Indian & International Identities
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--slate-500)', maxWidth: '640px', margin: '8px auto 0 auto' }}>
              Every category supports dual-sided photo captures, smart number formatting, and renewal validity reminders.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px'
            }}
          >
            {DOCUMENT_CATEGORIES.map((cat) => {
              const icons = {
                Fingerprint: Fingerprint,
                CreditCard: CreditCard,
                BookOpen: BookOpen,
                Vote: Vote,
                Car: Car,
                ShieldCheck: ShieldCheck
              };
              const IconComp = icons[cat.iconName] || FileCheck;

              return (
                <div
                  key={cat.id}
                  className="fv-card fv-card-hover"
                  style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: `${cat.color}15`,
                        color: cat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <IconComp size={24} />
                    </div>

                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--slate-100)',
                        color: 'var(--slate-600)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)'
                      }}
                    >
                      {cat.requiresBothSides ? 'Dual Sided' : 'Single Side'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                    {cat.name}
                  </h3>

                  <p style={{ fontSize: '0.84rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                    {cat.description}
                  </p>

                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--slate-100)',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--slate-500)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>Format:</span>
                    <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{cat.numberFormat}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Benefits Grid Section */}
      <section id="features" style={{ padding: '80px 24px', backgroundColor: 'var(--slate-50)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
              Why Modern Families Trust FamilyVault
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--slate-500)', maxWidth: '600px', margin: '8px auto 0 auto' }}>
              Traditional cloud drives leave your Aadhaar and passport numbers exposed. FamilyVault was engineered with defense-in-depth principles.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="fv-card" style={{ padding: '28px', backgroundColor: '#ffffff' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Lock size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '8px' }}>
                Zero-Knowledge Encryption
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.6 }}>
                Documents are locked with military-grade AES-256 ciphers. Even the platform cannot peek into your identity cards or certificates.
              </p>
            </div>

            <div className="fv-card" style={{ padding: '28px', backgroundColor: '#ffffff' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--emerald-50)', color: 'var(--emerald-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '8px' }}>
                Granular Family Roles
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.6 }}>
                Assign distinct privileges. Head of family acts as <strong>Owner</strong>, spouses as <strong>Admin</strong>, and parents or children as restricted <strong>Members</strong>.
              </p>
            </div>

            <div className="fv-card" style={{ padding: '28px', backgroundColor: '#ffffff' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--amber-50)', color: 'var(--amber-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Eye size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '8px' }}>
                Masked Document Numbers
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.6 }}>
                Preview your IDs with masked numbers by default (e.g. •••• •••• 3847) to guard against shoulder surfing in public places.
              </p>
            </div>

            <div className="fv-card" style={{ padding: '28px', backgroundColor: '#ffffff' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--purple-50)', color: 'var(--purple-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <FileCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '8px' }}>
                Front & Back Side Verification
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.6 }}>
                Indian cards like Aadhaar and Driving Licenses require both sides. FamilyVault enforces dual capture with synchronized inspection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Walkthrough */}
      <section id="how-it-works" style={{ padding: '80px 24px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Set Up Your Family Vault in 3 Simple Steps
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--slate-500)', marginTop: '8px' }}>
              No complex setup or technical jargon required.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px', position: 'relative' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontWeight: 800, fontSize: '1.2rem' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Create Your Vault</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', lineHeight: 1.5 }}>
                Register your family name to generate a cryptographically unique vault code.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontWeight: 800, fontSize: '1.2rem' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Add & Invite Members</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', lineHeight: 1.5 }}>
                Send secure invite links to your spouse and relatives with tailor-made roles.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontWeight: 800, fontSize: '1.2rem' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Upload Front & Back IDs</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', lineHeight: 1.5 }}>
                Upload scans or PDFs. Documents are cataloged by category and ready for emergency access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section style={{ padding: '64px 24px', backgroundColor: 'var(--slate-900)', color: '#ffffff', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '16px' }}>
            Ready to secure your family's future?
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--slate-300)', marginBottom: '32px' }}>
            Never hunt through email threads or WhatsApp chats for an Aadhaar or passport number again.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/register">
              <Button size="lg" variant="primary">
                Get Started Now — It's Free
              </Button>
            </Link>
            <Link to="/login">
              <button
                className="btn btn-secondary btn-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                Sign In to Existing Vault
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--slate-200)', padding: '36px 24px', backgroundColor: '#ffffff', fontSize: '0.875rem', color: 'var(--slate-500)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} />
            </div>
            <span style={{ fontWeight: 800, color: 'var(--slate-900)' }}>FamilyVault</span>
            <span>• Secure Document Management</span>
          </div>

          <div>
            Phase 1 Client Prototype • React & Vite • Client Encrypted Simulation
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .hero-preview-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

