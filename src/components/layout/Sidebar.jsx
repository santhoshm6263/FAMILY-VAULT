import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Files,
  Users,
  Settings,
  PlusCircle,
  LogOut,
  ChevronRight,
  HardDrive,
  Copy,
  Check,
  X,
  CreditCard,
  Fingerprint,
  BookOpen,
  Vote,
  Car,
  FileText,
  ChevronsUpDown,
  Plus,
  KeyRound,
  Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVault } from '../../context/VaultContext';
import { RoleBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export const Sidebar = ({ isMobileOpen, closeMobileSidebar, onOpenUploadModal }) => {
  const { currentUser, logout } = useAuth();
  const {
    familyProfile,
    userFamilies,
    currentFamilyId,
    switchFamily,
    createNewFamily,
    acceptInvite,
    documents,
    showToast
  } = useVault();
  const location = useLocation();
  const navigate = useNavigate();

  const [copiedId, setCopiedId] = useState(false);
  const [familyDropdownOpen, setFamilyDropdownOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleCopyVaultId = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(familyProfile.vaultCode);
    setCopiedId(true);
    showToast(`Copied Vault Code: ${familyProfile.vaultCode}`, 'info');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;
    setActionLoading(true);
    try {
      await createNewFamily(newFamilyName.trim());
      setNewFamilyName('');
      setCreateModalOpen(false);
      setFamilyDropdownOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinFamily = async (e) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;
    setActionLoading(true);
    try {
      await acceptInvite(inviteCodeInput.trim());
      setInviteCodeInput('');
      setJoinModalOpen(false);
      setFamilyDropdownOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { name: 'Documents', path: '/app/documents', icon: Files, badge: documents.length },
    { name: 'Family Members', path: '/app/family', icon: Users },
    { name: 'Settings & Security', path: '/app/settings', icon: Settings }
  ];

  const categoryShortcuts = [
    { name: 'Aadhaar Cards', cat: 'aadhaar', icon: Fingerprint, count: documents.filter(d => d.category === 'aadhaar').length },
    { name: 'PAN Cards', cat: 'pan', icon: CreditCard, count: documents.filter(d => d.category === 'pan').length },
    { name: 'Passports', cat: 'passport', icon: BookOpen, count: documents.filter(d => d.category === 'passport').length },
    { name: 'Driving Licenses', cat: 'driving-license', icon: Car, count: documents.filter(d => d.category === 'driving-license').length },
    { name: 'Voter IDs', cat: 'voter-id', icon: Vote, count: documents.filter(d => d.category === 'voter-id').length }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={closeMobileSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 90
          }}
        />
      )}

      {/* Modal: Create New Family Workspace */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Family Workspace"
        subtitle="Set up a private, isolated vault for another household or extended family"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={actionLoading} onClick={handleCreateFamily}>
              Create Workspace
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateFamily}>
          <Input
            label="Family Workspace Name"
            placeholder="e.g. Verma Family Vault or Grandparents Vault"
            value={newFamilyName}
            onChange={(e) => setNewFamilyName(e.target.value)}
            required
            helperText="You will be designated as the Owner of this new workspace"
          />
        </form>
      </Modal>

      {/* Modal: Join Family by Code */}
      <Modal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        title="Join an Existing Family Vault"
        subtitle="Enter the unique invitation code provided by the family owner or admin"
        footer={
          <>
            <Button variant="secondary" onClick={() => setJoinModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={actionLoading} onClick={handleJoinFamily}>
              Join Vault
            </Button>
          </>
        }
      >
        <form onSubmit={handleJoinFamily}>
          <Input
            label="Invitation Code"
            placeholder="e.g. FV-INV-9938"
            value={inviteCodeInput}
            onChange={(e) => setInviteCodeInput(e.target.value)}
            required
            helperText="Check your invitation email or message for the code"
          />
        </form>
      </Modal>

      <aside
        className={`sidebar-container ${isMobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: '#ffffff',
          borderRight: '1px solid var(--slate-200)',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.25s ease-in-out'
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 'var(--topbar-height)',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--slate-100)'
          }}
        >
          <div
            onClick={() => {
              navigate('/app');
              closeMobileSidebar();
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
              }}
            >
              <Shield size={20} />
            </div>
            <div>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                Family<span style={{ color: 'var(--primary)' }}>Vault</span>
              </span>
            </div>
          </div>

          {/* Close for mobile */}
          <button
            onClick={closeMobileSidebar}
            className="mobile-close-btn"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--slate-500)',
              display: 'none'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Multi-Family Switcher Dropdown */}
        <div style={{ padding: '16px 16px 12px 16px', position: 'relative' }}>
          <div
            onClick={() => setFamilyDropdownOpen(!familyDropdownOpen)}
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--slate-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            className="family-switcher-trigger"
          >
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--slate-800)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}
              >
                {familyProfile.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', fontFamily: 'var(--font-mono)' }}>
                  {familyProfile.vaultCode}
                </span>
                <button
                  onClick={handleCopyVaultId}
                  style={{
                    color: copiedId ? 'var(--emerald-500)' : 'var(--slate-400)',
                    padding: '2px',
                    borderRadius: '2px'
                  }}
                  title="Copy Vault Code"
                >
                  {copiedId ? <Check size={11} /> : <Copy size={11} />}
                </button>
              </div>
            </div>
            <ChevronsUpDown size={15} style={{ color: 'var(--slate-400)', flexShrink: 0 }} />
          </div>

          {/* Family Switcher Dropdown Menu */}
          {familyDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: '16px',
                right: '16px',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--slate-200)',
                padding: '6px',
                zIndex: 200
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-400)', padding: '6px 10px', textTransform: 'uppercase' }}>
                Your Family Workspaces ({userFamilies.length})
              </div>

              <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                {userFamilies.map((fam) => {
                  const isCurrent = fam.id === currentFamilyId;
                  return (
                    <button
                      key={fam.id}
                      onClick={() => {
                        switchFamily(fam.id);
                        setFamilyDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: isCurrent ? 'var(--primary-50)' : 'transparent',
                        color: isCurrent ? 'var(--primary-700)' : 'var(--slate-700)',
                        fontSize: '0.8125rem',
                        transition: 'background-color 0.15s'
                      }}
                      className="family-opt"
                    >
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: isCurrent ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {fam.name}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: isCurrent ? 'var(--primary)' : 'var(--slate-400)' }}>
                          {fam.vaultCode}
                        </div>
                      </div>
                      {isCurrent && <Check size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--slate-100)', margin: '4px 0' }} />

              <button
                onClick={() => {
                  setCreateModalOpen(true);
                  setFamilyDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  textAlign: 'left'
                }}
                className="family-opt"
              >
                <Plus size={14} />
                <span>+ Create New Family</span>
              </button>

              <button
                onClick={() => {
                  setJoinModalOpen(true);
                  setFamilyDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--slate-700)',
                  textAlign: 'left'
                }}
                className="family-opt"
              >
                <KeyRound size={14} />
                <span>Join Family by Code</span>
              </button>
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <div style={{ padding: '0 16px 16px 16px' }}>
          <button
            onClick={() => {
              if (onOpenUploadModal) onOpenUploadModal();
              closeMobileSidebar();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.875rem',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
              transition: 'background-color 0.15s ease'
            }}
          >
            <PlusCircle size={18} />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Navigation List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', padding: '8px 12px 4px 12px', letterSpacing: '0.05em' }}>
            Main Menu
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileSidebar}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--primary)' : 'var(--slate-600)',
                    backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
                    transition: 'all 0.15s ease'
                  }}
                  className="sidebar-link"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={18} style={{ color: isActive ? 'var(--primary)' : 'var(--slate-400)' }} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '1px 7px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: isActive ? 'var(--primary-100)' : 'var(--slate-100)',
                        color: isActive ? 'var(--primary-700)' : 'var(--slate-600)'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Quick Categories Filter */}
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', padding: '20px 12px 6px 12px', letterSpacing: '0.05em' }}>
            Identity Categories
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {categoryShortcuts.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.cat}
                  onClick={() => {
                    navigate(`/app/documents?category=${cat.cat}`);
                    closeMobileSidebar();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    color: 'var(--slate-600)',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background-color 0.15s'
                  }}
                  className="sidebar-cat-link"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={15} style={{ color: 'var(--slate-400)' }} />
                    <span>{cat.name}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 500 }}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Vault Storage Status Widget */}
          <div
            style={{
              margin: '20px 0 12px 0',
              padding: '12px',
              backgroundColor: 'var(--slate-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-200)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-700)' }}>
                <HardDrive size={13} style={{ color: 'var(--primary)' }} />
                <span>Vault Storage</span>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)' }}>
                {familyProfile.storageUsed}
              </span>
            </div>
            <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--slate-200)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '3.2%', height: '100%', backgroundColor: 'var(--primary)', borderRadius: '3px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.6875rem', color: 'var(--slate-400)' }}>
              <span>Encrypted Client-side</span>
              <span>Max: {familyProfile.maxStorage}</span>
            </div>
          </div>
        </div>

        {/* User Profile Footer */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--slate-100)',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser?.name || 'User'}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                objectFit: 'cover',
                border: '1.5px solid var(--slate-200)'
              }}
            />
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--slate-900)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}
              >
                {currentUser?.name || 'User'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <RoleBadge role={currentUser?.role || 'Member'} />
              </div>
            </div>
          </div>

          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--slate-400)',
              transition: 'all 0.15s ease'
            }}
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <style>{`
        .family-opt:hover {
          background-color: var(--slate-100);
        }
        .sidebar-link:hover {
          background-color: var(--slate-100) !important;
          color: var(--slate-900) !important;
        }
        .sidebar-cat-link:hover {
          background-color: var(--slate-100);
          color: var(--slate-900);
        }
        @media (max-width: 900px) {
          .sidebar-container {
            transform: translateX(-100%);
          }
          .sidebar-container.mobile-open {
            transform: translateX(0);
          }
          .mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};
