import React, { useState } from 'react';
import {
  UserPlus,
  Users,
  Shield,
  Mail,
  Copy,
  Check,
  RotateCw,
  XCircle,
  HelpCircle,
  CheckCircle2,
  Lock,
  Plus,
  KeyRound,
  Building,
  CheckCircle
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { useAuth } from '../../context/AuthContext';
import { FamilyProfileCard } from '../../components/family/FamilyProfileCard';
import { MemberCard } from '../../components/family/MemberCard';
import { InviteMemberModal } from '../../components/family/InviteMemberModal';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { RoleBadge } from '../../components/common/Badge';

export const FamilyPage = () => {
  const {
    members,
    invites,
    familyProfile,
    userFamilies,
    currentFamilyId,
    switchFamily,
    createNewFamily,
    acceptInvite,
    rejectInvite,
    addMember,
    updateMemberRole,
    isAdmin,
    isOwner,
    currentUserRole,
    showToast
  } = useVault();
  const { currentUser } = useAuth();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAddDirectModalOpen, setIsAddDirectModalOpen] = useState(false);
  const [isCreateFamilyModalOpen, setIsCreateFamilyModalOpen] = useState(false);
  const [isJoinCodeModalOpen, setIsJoinCodeModalOpen] = useState(false);

  const [copiedCode, setCopiedCode] = useState(null);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Direct add dependent state
  const [directName, setDirectName] = useState('');
  const [directRelation, setDirectRelation] = useState('Child');
  const [directRole, setDirectRole] = useState('Member');
  const [directPhone, setDirectPhone] = useState('');

  const handleDirectAddSubmit = async (e) => {
    e.preventDefault();
    if (!directName.trim()) return;

    await addMember({
      name: directName.trim(),
      email: `${directName.toLowerCase().replace(/\s+/g, '.')}.${Date.now().toString().slice(-4)}@familyvault.io`,
      relation: directRelation,
      role: directRole,
      phone: directPhone || 'Managed by Head'
    });

    setDirectName('');
    setDirectRelation('Child');
    setDirectRole('Member');
    setDirectPhone('');
    setIsAddDirectModalOpen(false);
  };

  const handleCreateFamilySubmit = async (e) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;
    setActionLoading(true);
    try {
      await createNewFamily(newFamilyName.trim());
      setNewFamilyName('');
      setIsCreateFamilyModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinByCodeSubmit = async (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    setActionLoading(true);
    try {
      await acceptInvite(joinCodeInput.trim());
      setJoinCodeInput('');
      setIsJoinCodeModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyInviteLink = (code) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://family-vault-qyka.onrender.com';
    navigator.clipboard.writeText(`${origin}/join?code=${code}`);
    setCopiedCode(code);
    showToast(`Copied invitation link (${code})`, 'info');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Modal: Invite Member */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {/* Modal: Create New Family Workspace */}
      <Modal
        isOpen={isCreateFamilyModalOpen}
        onClose={() => setIsCreateFamilyModalOpen(false)}
        title="Create New Family Workspace"
        subtitle="Establish an independent, private vault partition for another household"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateFamilyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={actionLoading} onClick={handleCreateFamilySubmit}>
              Create Workspace
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateFamilySubmit}>
          <Input
            label="Family Workspace Name"
            placeholder="e.g. Verma Family Vault or Grandparents Vault"
            value={newFamilyName}
            onChange={(e) => setNewFamilyName(e.target.value)}
            required
            helperText="You will be registered as the Owner of this family workspace"
          />
        </form>
      </Modal>

      {/* Modal: Join Family by Code */}
      <Modal
        isOpen={isJoinCodeModalOpen}
        onClose={() => setIsJoinCodeModalOpen(false)}
        title="Join Family Vault by Invitation Code"
        subtitle="Paste the invitation code shared by the family owner or admin"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsJoinCodeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={actionLoading} onClick={handleJoinByCodeSubmit}>
              Join Family
            </Button>
          </>
        }
      >
        <form onSubmit={handleJoinByCodeSubmit}>
          <Input
            label="Invitation Code"
            placeholder="e.g. FV-INV-9938"
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value)}
            required
            helperText="Check your invitation email or message for this code"
          />
        </form>
      </Modal>

      {/* Modal: Direct Add Dependent */}
      <Modal
        isOpen={isAddDirectModalOpen}
        onClose={() => setIsAddDirectModalOpen(false)}
        title="Add Family Member (No Email Required)"
        subtitle="Perfect for young children, minors, or elders without personal email"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddDirectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleDirectAddSubmit}>
              Add to Vault
            </Button>
          </>
        }
      >
        <form onSubmit={handleDirectAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Full Name"
            placeholder="e.g. Alex"
            required
            value={directName}
            onChange={(e) => setDirectName(e.target.value)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="fv-input-group">
              <label className="fv-label">Relationship</label>
              <select
                value={directRelation}
                onChange={(e) => setDirectRelation(e.target.value)}
                className="fv-select"
              >
                <option value="Son (Minor)">Son (Minor)</option>
                <option value="Daughter (Minor)">Daughter (Minor)</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Grandfather">Grandfather</option>
                <option value="Grandmother">Grandmother</option>
                <option value="Spouse">Spouse</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="fv-input-group">
              <label className="fv-label">Role</label>
              <select
                value={directRole}
                onChange={(e) => setDirectRole(e.target.value)}
                className="fv-select"
              >
                <option value="Member">Member (Managed by Admin)</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <Input
            label="Phone / Guardian Contact (Optional)"
            placeholder="e.g. +91 98765 43210"
            value={directPhone}
            onChange={(e) => setDirectPhone(e.target.value)}
          />
        </form>
      </Modal>

      {/* Multi-Family Workspace Selector Banner (When user belongs to multiple families) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '14px 20px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--slate-200)',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Building size={18} style={{ color: 'var(--primary)' }} />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase' }}>
              Your Family Vault Workspaces ({userFamilies.length})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
              {userFamilies.map((fam) => {
                const isActive = fam.id === currentFamilyId;
                return (
                  <button
                    key={fam.id}
                    onClick={() => switchFamily(fam.id)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8125rem',
                      fontWeight: isActive ? 700 : 500,
                      backgroundColor: isActive ? 'var(--primary)' : 'var(--slate-100)',
                      color: isActive ? '#ffffff' : 'var(--slate-700)',
                      border: isActive ? '1px solid var(--primary)' : '1px solid var(--slate-200)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {fam.name} {isActive && '✓'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="outline"
            size="sm"
            icon={KeyRound}
            onClick={() => setIsJoinCodeModalOpen(true)}
          >
            Join by Code
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => setIsCreateFamilyModalOpen(true)}
          >
            + New Family
          </Button>
        </div>
      </div>

      {/* Family Profile Card */}
      <FamilyProfileCard />

      {/* Action Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Active Members in {familyProfile.name} ({members.length})
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--slate-500)', marginTop: '2px' }}>
            Your role in this workspace: <RoleBadge role={currentUserRole} />
          </p>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Button
              variant="secondary"
              onClick={() => setIsAddDirectModalOpen(true)}
            >
              + Add Dependent / Minor
            </Button>
            <Button
              variant="primary"
              icon={UserPlus}
              onClick={() => setIsInviteModalOpen(true)}
            >
              + Invite by Email
            </Button>
          </div>
        )}
      </div>

      {/* Members Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}
      >
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            onRoleChange={(id, role) => updateMemberRole(id, role)}
          />
        ))}
      </div>

      {/* Pending Invitations Section */}
      {invites.length > 0 && (
        <div className="fv-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                Pending Invitations ({invites.length})
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                Invited users can join this workspace using their direct link or unique invitation code
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {invites.map((inv) => {
              const isInvitee = currentUser?.email && inv.email.toLowerCase() === currentUser.email.toLowerCase();

              return (
                <div
                  key={inv.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    backgroundColor: 'var(--slate-50)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--slate-200)',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--amber-50)',
                        color: 'var(--amber-700)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--amber-200)'
                      }}
                    >
                      <Mail size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '0.9rem' }}>
                          {inv.name}
                        </span>
                        <RoleBadge role={inv.role} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                          ({inv.relation})
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                        {inv.email} • Code: <strong>{inv.inviteCode}</strong> • Invited by {inv.invitedByName || 'Admin'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isInvitee ? (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={CheckCircle}
                          onClick={() => acceptInvite(inv.inviteCode)}
                        >
                          Accept & Join
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={XCircle}
                          onClick={() => rejectInvite(inv.inviteCode)}
                        >
                          Decline
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={copiedCode === inv.inviteCode ? Check : Copy}
                          onClick={() => handleCopyInviteLink(inv.inviteCode)}
                        >
                          {copiedCode === inv.inviteCode ? 'Copied' : 'Copy Link'}
                        </Button>
                        {isAdmin && (
                          <button
                            onClick={() => rejectInvite(inv.inviteCode)}
                            style={{
                              padding: '6px',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--rose-500)',
                              backgroundColor: 'var(--rose-50)',
                              border: '1px solid var(--rose-200)'
                            }}
                            title="Revoke Invitation"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Role Permissions Matrix Explainer */}
      <div className="fv-card" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} style={{ color: 'var(--primary)' }} />
          <span>Server-Enforced Role Privileges (Firestore Security Rules)</span>
        </h4>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)', textAlign: 'left', color: 'var(--slate-500)' }}>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Privilege / Capability</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Owner</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Admin</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Member</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--slate-100)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>Create / Delete Family Workspace</td>
                <td style={{ padding: '10px 14px', color: 'var(--emerald-600)', fontWeight: 700 }}>✓ Full</td>
                <td style={{ padding: '10px 14px', color: 'var(--slate-400)' }}>✕</td>
                <td style={{ padding: '10px 14px', color: 'var(--slate-400)' }}>✕</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--slate-100)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>Invite & Assign Member Roles</td>
                <td style={{ padding: '10px 14px', color: 'var(--emerald-600)', fontWeight: 700 }}>✓ Yes</td>
                <td style={{ padding: '10px 14px', color: 'var(--emerald-600)', fontWeight: 700 }}>✓ Yes</td>
                <td style={{ padding: '10px 14px', color: 'var(--slate-400)' }}>✕</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--slate-100)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>Change Other Member Roles</td>
                <td style={{ padding: '10px 14px', color: 'var(--emerald-600)', fontWeight: 700 }}>✓ Yes</td>
                <td style={{ padding: '10px 14px', color: 'var(--emerald-600)', fontWeight: 700 }}>✓ Non-owner</td>
                <td style={{ padding: '10px 14px', color: 'var(--slate-400)' }}>✕</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--slate-100)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>Self Role Elevation (Security Rule Protected)</td>
                <td style={{ padding: '10px 14px', color: 'var(--rose-600)', fontWeight: 700 }}>✕ Blocked</td>
                <td style={{ padding: '10px 14px', color: 'var(--rose-600)', fontWeight: 700 }}>✕ Blocked</td>
                <td style={{ padding: '10px 14px', color: 'var(--rose-600)', fontWeight: 700 }}>✕ Blocked</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>Access Other Family's Data</td>
                <td style={{ padding: '10px 14px', color: 'var(--rose-600)', fontWeight: 700 }}>✕ Denied</td>
                <td style={{ padding: '10px 14px', color: 'var(--rose-600)', fontWeight: 700 }}>✕ Denied</td>
                <td style={{ padding: '10px 14px', color: 'var(--rose-600)', fontWeight: 700 }}>✕ Denied</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
