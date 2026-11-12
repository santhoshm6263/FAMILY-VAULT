import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Plus,
  UserCheck,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVault } from '../../context/VaultContext';
import { RoleBadge } from '../common/Badge';

export const Topbar = ({ onToggleMobileSidebar, onOpenUploadModal }) => {
  const { currentUser, demoLogin } = useAuth();
  const { resetToSampleData } = useVault();
  const [searchVal, setSearchVal] = useState('');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/app/documents?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--slate-200)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}
    >
      {/* Left: Mobile hamburger & Global Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '500px' }}>
        <button
          onClick={onToggleMobileSidebar}
          className="topbar-mobile-menu"
          style={{
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--slate-600)',
            display: 'none'
          }}
          aria-label="Open sidebar menu"
        >
          <Menu size={20} />
        </button>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} style={{ width: '100%', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--slate-400)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search documents by ID, Aadhaar, PAN, name, or tags... (Press Enter)"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 38px',
              fontSize: '0.84rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-200)',
              backgroundColor: 'var(--slate-50)',
              color: 'var(--slate-800)',
              outline: 'none',
              transition: 'all 0.15s ease'
            }}
            className="topbar-search-input"
          />
        </form>
      </div>

      {/* Right: Demo Role Switcher, Quick Reset, Upload Button, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Role Switcher Pill */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--slate-100)',
              border: '1px solid var(--slate-200)',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--slate-700)',
              transition: 'background-color 0.15s'
            }}
            title="Switch demo user role"
          >
            <UserCheck size={13} style={{ color: 'var(--primary)' }} />
            <span>Role:</span>
            <RoleBadge role={currentUser?.role || 'Owner'} />
            <ChevronDown size={13} />
          </button>

          {roleDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '210px',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--slate-200)',
                padding: '6px',
                zIndex: 100
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-400)', padding: '6px 10px', textTransform: 'uppercase' }}>
                Simulate Role
              </div>
              <button
                onClick={() => {
                  demoLogin('Owner');
                  setRoleDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  color: 'var(--slate-700)',
                  textAlign: 'left'
                }}
                className="role-opt"
              >
                <div>
                  <div style={{ fontWeight: 600 }}>Santhosh (Owner)</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>Full vault control</div>
                </div>
                {currentUser.role === 'Owner' && <span style={{ color: 'var(--emerald-500)', fontWeight: 800 }}>✓</span>}
              </button>

              <button
                onClick={() => {
                  demoLogin('Admin');
                  setRoleDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  color: 'var(--slate-700)',
                  textAlign: 'left'
                }}
                className="role-opt"
              >
                <div>
                  <div style={{ fontWeight: 600 }}>Priya (Admin)</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>Manage docs & invites</div>
                </div>
                {currentUser.role === 'Admin' && <span style={{ color: 'var(--emerald-500)', fontWeight: 800 }}>✓</span>}
              </button>

              <button
                onClick={() => {
                  demoLogin('Member');
                  setRoleDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  color: 'var(--slate-700)',
                  textAlign: 'left'
                }}
                className="role-opt"
              >
                <div>
                  <div style={{ fontWeight: 600 }}>Rajesh (Member)</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>View & upload own docs</div>
                </div>
                {currentUser.role === 'Member' && <span style={{ color: 'var(--emerald-500)', fontWeight: 800 }}>✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={resetToSampleData}
          style={{
            padding: '7px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--slate-500)',
            border: '1px solid var(--slate-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Reset to fresh demo dummy data"
        >
          <RotateCcw size={16} />
        </button>

        {/* Quick Upload Button */}
        <button
          onClick={onOpenUploadModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            fontSize: '0.8125rem',
            fontWeight: 600,
            boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)'
          }}
        >
          <Plus size={16} />
          <span className="upload-btn-text">Upload</span>
        </button>
      </div>

      <style>{`
        .role-opt:hover {
          background-color: var(--slate-50);
        }
        .topbar-search-input:focus {
          background-color: #ffffff !important;
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
        }
        @media (max-width: 900px) {
          .topbar-mobile-menu {
            display: flex !important;
          }
        }
        @media (max-width: 640px) {
          .upload-btn-text {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

