import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Users,
  Files,
  ShieldCheck,
  Upload,
  UserPlus,
  ArrowRight,
  Lock,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  Fingerprint,
  CreditCard,
  BookOpen,
  Vote,
  Car,
  FileText
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { RoleBadge, CategoryBadge, StatusBadge } from '../../components/common/Badge';
import { DocumentCard } from '../../components/documents/DocumentCard';
import { DocumentPreviewModal } from '../../components/documents/DocumentPreviewModal';
import { DocumentEditModal } from '../../components/documents/DocumentEditModal';
import { InviteMemberModal } from '../../components/family/InviteMemberModal';
import { DOCUMENT_CATEGORIES } from '../../data/categories';

export const DashboardPage = () => {
  const { documents, members, invites, familyProfile, deleteDocument } = useVault();
  const { currentUser } = useAuth();
  const { openUploadModal } = useOutletContext();
  const navigate = useNavigate();

  const [previewDoc, setPreviewDoc] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Statistics calculation
  const totalMembers = members.length;
  const pendingInvites = invites.filter((i) => i.status === 'Pending').length;
  const totalDocs = documents.length;
  const expiringDocs = documents.filter((d) => d.expiryDate && new Date(d.expiryDate) < new Date(Date.now() + 180 * 24 * 60 * 60 * 1000));
  const recentDocs = documents.slice(0, 4);

  const getCategoryCount = (catId) => {
    return documents.filter((d) => d.category === catId).length;
  };

  const categoryIcons = {
    Fingerprint: Fingerprint,
    CreditCard: CreditCard,
    BookOpen: BookOpen,
    Vote: Vote,
    Car: Car,
    ShieldCheck: FileText
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Modals */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        onEdit={(doc) => setEditingDoc(doc)}
        onDelete={(id) => deleteDocument(id)}
      />

      <DocumentEditModal
        document={editingDoc}
        isOpen={!!editingDoc}
        onClose={() => setEditingDoc(null)}
      />

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {/* Top Welcome Banner */}
      <div
        className="fv-card"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                {familyProfile.name} ({familyProfile.vaultCode})
              </span>
              <span style={{ fontSize: '0.75rem', color: '#c7d2fe', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={12} />
                Client Key Synced
              </span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Welcome back, {currentUser?.name?.split(' ')[0] || 'Member'}! 👋
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#e0e7ff', marginTop: '4px', maxWidth: '600px' }}>
              Your <strong>{familyProfile.name}</strong> workspace is isolated and protected. All {totalDocs} identity records across {totalMembers} family members are safely encrypted.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              icon={UserPlus}
              onClick={() => setIsInviteModalOpen(true)}
              style={{ backgroundColor: '#ffffff', color: 'var(--primary-700)', border: 'none' }}
            >
              + Invite Member
            </Button>
            <Button
              variant="primary"
              icon={Upload}
              onClick={openUploadModal}
              style={{ backgroundColor: '#ffffff', color: 'var(--slate-900)', border: 'none' }}
            >
              + Upload Document
            </Button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div
          style={{
            position: 'absolute',
            right: '-50px',
            top: '-50px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* 4 Stat Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '18px'
        }}
      >
        {/* Stat 1: Members */}
        <div
          className="fv-card fv-card-hover"
          style={{ padding: '20px', cursor: 'pointer' }}
          onClick={() => navigate('/app/family')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase' }}>
              Total Family Members
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {totalMembers}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} />
            <span>Active in {familyProfile.name}</span>
          </div>
        </div>

        {/* Stat 2: Documents */}
        <div
          className="fv-card fv-card-hover"
          style={{ padding: '20px', cursor: 'pointer' }}
          onClick={() => navigate('/app/documents')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase' }}>
              Total Documents
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--blue-50)', color: 'var(--blue-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Files size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
            {totalDocs}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '4px' }}>
            Across 6 identity categories
          </div>
        </div>

        {/* Stat 3: Expiring Soon */}
        <div
          className="fv-card fv-card-hover"
          style={{ padding: '20px', cursor: 'pointer' }}
          onClick={() => navigate('/app/documents')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase' }}>
              Renewals / Expiry
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--amber-50)', color: 'var(--amber-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: expiringDocs.length > 0 ? 'var(--amber-700)' : 'var(--slate-900)' }}>
            {expiringDocs.length > 0 ? `${expiringDocs.length} Pending` : 'All Valid'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '4px' }}>
            Passports & Insurance tracking
          </div>
        </div>

        {/* Stat 4: Security Score */}
        <div
          className="fv-card"
          style={{ padding: '20px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase' }}>
              Security Status
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--emerald-50)', color: 'var(--emerald-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--emerald-600)' }}>
            100% Secure
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '4px' }}>
            AES-256 client cipher enabled
          </div>
        </div>
      </div>

      {/* Document Categories Breakdown Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Document Categories
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '2px' }}>
              Select a category to view or filter family documents
            </p>
          </div>
          <button
            onClick={() => navigate('/app/documents')}
            style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
          {DOCUMENT_CATEGORIES.map((cat) => {
            const IconComp = categoryIcons[cat.iconName] || FileText;
            const count = getCategoryCount(cat.id);

            return (
              <div
                key={cat.id}
                onClick={() => navigate(`/app/documents?category=${cat.id}`)}
                className="fv-card fv-card-hover"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  cursor: 'pointer',
                  borderLeft: `4px solid ${cat.color}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: `${cat.color}15`,
                      color: cat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <IconComp size={18} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: count > 0 ? 'var(--slate-900)' : 'var(--slate-400)'
                    }}
                  >
                    {count} {count === 1 ? 'Doc' : 'Docs'}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                  {cat.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recently Uploaded Documents Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Recently Uploaded Documents
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '2px' }}>
              Latest encrypted additions to your household repository
            </p>
          </div>
          <button
            onClick={() => navigate('/app/documents')}
            style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>Explore All Documents ({documents.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {recentDocs.length === 0 ? (
          <div className="fv-card" style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>No documents uploaded yet.</p>
            <Button variant="primary" size="sm" onClick={openUploadModal} style={{ marginTop: '12px' }}>
              Upload Your First Document
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {recentDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onPreview={(d) => setPreviewDoc(d)}
                onEdit={(d) => setEditingDoc(d)}
                onDelete={(id) => deleteDocument(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Security Activity Log */}
      <div className="fv-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '16px' }}>
          Recent Vault Activity & Audit Trail
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8125rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--emerald-500)' }} />
            <div style={{ flex: 1, color: 'var(--slate-700)' }}>
              <strong>Santhosh Sharma</strong> uploaded and encrypted <em>Santhosh's Aadhaar Card</em> (Front & Back).
            </div>
            <span style={{ color: 'var(--slate-400)', fontSize: '0.75rem' }}>Today at 10:14 AM</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8125rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--blue-500)' }} />
            <div style={{ flex: 1, color: 'var(--slate-700)' }}>
              <strong>Priya Sharma</strong> was verified as <strong>Admin</strong> with multi-member inspection rights.
            </div>
            <span style={{ color: 'var(--slate-400)', fontSize: '0.75rem' }}>Yesterday</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8125rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--amber-500)' }} />
            <div style={{ flex: 1, color: 'var(--slate-700)' }}>
              Invitation link generated for <strong>Vikram Sharma</strong> (Pending confirmation).
            </div>
            <span style={{ color: 'var(--slate-400)', fontSize: '0.75rem' }}>2 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

