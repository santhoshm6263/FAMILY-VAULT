import React, { useState } from 'react';
import { Mail, UserPlus, Copy, Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useVault } from '../../context/VaultContext';
import { useAuth } from '../../context/AuthContext';

export const InviteMemberModal = ({ isOpen, onClose }) => {
  const { sendInvite, showToast } = useVault();
  const { currentUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [relation, setRelation] = useState('Spouse');
  const [role, setRole] = useState('Member'); // 'Admin' | 'Member'
  const [message, setMessage] = useState('');
  const [createdInvite, setCreatedInvite] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('Please provide name and email');
      return;
    }

    const invite = sendInvite({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      relation: relation,
      role: role,
      invitedBy: currentUser?.name || 'Vault Admin',
      message: message.trim()
    });

    setCreatedInvite(invite);
  };

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://family-vault-qyka.onrender.com';
    const link = `${origin}/join?code=${createdInvite?.inviteCode || ''}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    showToast('Invitation link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setRelation('Spouse');
    setRole('Member');
    setMessage('');
    setCreatedInvite(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={createdInvite ? 'Invitation Sent Successfully!' : 'Invite Family Member'}
      subtitle={createdInvite ? 'Share the secure invite link or code below' : 'Give family members encrypted access with granular roles'}
      maxWidth="540px"
      footer={
        createdInvite ? (
          <Button variant="primary" onClick={handleClose}>
            Done
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" icon={UserPlus} onClick={handleSubmit}>
              Send Invitation
            </Button>
          </>
        )
      }
    >
      {createdInvite ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '10px 0' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--emerald-50)',
              color: 'var(--emerald-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}
          >
            <Mail size={28} />
          </div>

          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              Invite dispatched to {createdInvite.email}
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--slate-500)', marginTop: '4px' }}>
              They will be added as <strong>{createdInvite.role}</strong> ({createdInvite.relation}).
            </p>
          </div>

          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--slate-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}
          >
            <div style={{ textAlign: 'left', overflow: 'hidden' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', fontWeight: 600 }}>
                INVITE CODE / DIRECT LINK
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                FV-INV-{createdInvite.inviteCode}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={copied ? Check : Copy}
              onClick={handleCopyLink}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Full Name"
            placeholder="e.g. David Miller"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. vikram@family.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="fv-input-group">
              <label className="fv-label">Relationship to Head</label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="fv-select"
              >
                <option value="Spouse">Spouse</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Other Relative">Other Relative</option>
              </select>
            </div>

            <div className="fv-input-group">
              <label className="fv-label">Member Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="fv-select"
              >
                <option value="Member">Member (View & upload own)</option>
                <option value="Admin">Admin (Manage vault & invites)</option>
              </select>
            </div>
          </div>

          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--slate-50)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              color: 'var(--slate-600)',
              lineHeight: 1.4
            }}
          >
            {role === 'Admin' ? (
              <span style={{ color: 'var(--primary)' }}>
                <strong>Admin role:</strong> Can invite new members, view all family records, and edit documents.
              </span>
            ) : (
              <span>
                <strong>Member role:</strong> Can view their own assigned documents and upload new documents for admin verification.
              </span>
            )}
          </div>

          <div className="fv-input-group">
            <label className="fv-label">Welcome Message (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Welcome to our private family vault!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="fv-input"
            />
          </div>
        </form>
      )}
    </Modal>
  );
};

