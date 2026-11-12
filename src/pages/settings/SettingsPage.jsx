import React, { useState } from 'react';
import {
  Shield,
  HardDrive,
  Download,
  RotateCcw,
  Bell,
  Lock
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const SettingsPage = () => {
  const { familyProfile, updateFamilyProfile, resetToSampleData, documents, members, showToast } = useVault();

  const [familyName, setFamilyName] = useState(familyProfile.name);
  const [notifyExpiring, setNotifyExpiring] = useState(true);
  const [notifyNewDocs, setNotifyNewDocs] = useState(true);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateFamilyProfile({ name: familyName.trim() });
    showToast('Vault settings saved successfully', 'success');
  };

  const handleExportSummary = () => {
    const summaryData = {
      familyProfile,
      exportedAt: new Date().toISOString(),
      memberCount: members.length,
      documentCount: documents.length,
      documents: documents.map((d) => ({
        id: d.id,
        title: d.title,
        category: d.categoryName,
        holder: d.memberName,
        number: d.maskedNumber,
        uploadedAt: d.uploadedAt
      }))
    };

    const blob = new Blob([JSON.stringify(summaryData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FamilyVault_Audit_${familyProfile.vaultCode}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Vault audit summary exported', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '880px' }}>
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
          Vault Settings & Security
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '4px' }}>
          Configure household preferences, encryption keys, and security backup protocols
        </p>
      </div>

      {/* Vault Profile Section */}
      <div className="fv-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '16px' }}>
          Vault Profile Details
        </h3>
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Family Vault Name"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="e.g. Sharma Family Vault"
              required
            />

            <Input
              label="Vault Cryptographic Code"
              value={familyProfile.vaultCode}
              disabled
              helperText="Unique permanent identifier for cross-device syncing"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <Button type="submit" variant="primary">
              Save Vault Details
            </Button>
          </div>
        </form>
      </div>

      {/* Security & Client Cipher Status */}
      <div className="fv-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={20} style={{ color: 'var(--emerald-500)' }} />
          <span>Security & Zero-Knowledge Architecture</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lock size={18} style={{ color: 'var(--primary)' }} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>Client-Side AES-256 GCM</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Keys derived in memory. Server never sees plain document bits.</div>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-600)', backgroundColor: 'var(--emerald-50)', padding: '3px 8px', borderRadius: '4px' }}>
              ACTIVE
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <HardDrive size={18} style={{ color: 'var(--primary)' }} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>Encrypted Storage Usage</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{familyProfile.storageUsed} of {familyProfile.maxStorage} allocated storage used</div>
              </div>
            </div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-700)' }}>
              {familyProfile.storageUsed}
            </span>
          </div>
        </div>

        {/* Export and reset buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            icon={Download}
            onClick={handleExportSummary}
          >
            Export Vault Audit JSON
          </Button>

          <Button
            variant="outline"
            icon={RotateCcw}
            onClick={resetToSampleData}
          >
            Reset Vault to Sample Demo Data
          </Button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="fv-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={18} style={{ color: 'var(--primary)' }} />
          <span>Alert Preferences</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: 'var(--slate-700)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={notifyExpiring}
              onChange={(e) => setNotifyExpiring(e.target.checked)}
              style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
            />
            <span>Email reminders 90 days before Passport or Insurance expiry</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: 'var(--slate-700)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={notifyNewDocs}
              onChange={(e) => setNotifyNewDocs(e.target.checked)}
              style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
            />
            <span>Notify head of family whenever a member uploads a new document</span>
          </label>
        </div>
      </div>
    </div>
  );
};

