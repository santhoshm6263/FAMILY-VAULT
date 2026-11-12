import React, { useState } from 'react';
import {
  Shield,
  Key,
  Copy,
  Check,
  Calendar,
  Lock,
  Edit2
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';

export const FamilyProfileCard = () => {
  const { familyProfile, members, documents, updateFamilyProfile, showToast } = useVault();
  const [copied, setCopied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [familyName, setFamilyName] = useState(familyProfile.name);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(familyProfile.vaultCode);
    setCopied(true);
    showToast(`Copied Vault Code: ${familyProfile.vaultCode}`, 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveName = (e) => {
    e.preventDefault();
    if (familyName.trim()) {
      updateFamilyProfile({ name: familyName.trim() });
      setIsEditModalOpen(false);
    }
  };

  return (
    <>
      <div
        className="fv-card"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid var(--slate-200)',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          {/* Family Brand Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--primary-100)'
              }}
            >
              <Shield size={32} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  {familyProfile.name}
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  style={{
                    padding: '4px',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--slate-400)',
                    backgroundColor: 'transparent'
                  }}
                  title="Rename Family Vault"
                >
                  <Edit2 size={15} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                {/* Vault Code Pill */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--slate-100)',
                    border: '1px solid var(--slate-200)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--slate-700)',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <Key size={12} style={{ color: 'var(--primary)' }} />
                  <span>{familyProfile.vaultCode}</span>
                  <button
                    onClick={handleCopyCode}
                    style={{ color: copied ? 'var(--emerald-500)' : 'var(--slate-400)', padding: '2px' }}
                    title="Copy Vault Code"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>

                <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={13} />
                  Created {familyProfile.createdAt}
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    backgroundColor: 'var(--emerald-50)',
                    color: 'var(--emerald-700)',
                    border: '1px solid var(--emerald-100)'
                  }}
                >
                  <Lock size={11} />
                  AES-256 GCM Client Encrypted
                </span>
              </div>
            </div>
          </div>

          {/* Right Metrics summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase' }}>
                Total Members
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                {members.length}
              </div>
            </div>

            <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--slate-200)' }} />

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase' }}>
                Total Documents
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                {documents.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rename Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Rename Family Vault"
        subtitle="This name will appear on all shared summaries and invitations"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveName}>
              Save Name
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveName}>
          <Input
            label="Family Vault Name"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="e.g. My Household Vault"
            required
          />
        </form>
      </Modal>
    </>
  );
};

