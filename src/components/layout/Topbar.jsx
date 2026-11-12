import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/Badge';

export const Topbar = ({ onToggleMobileSidebar, onOpenUploadModal }) => {
  const { currentUser } = useAuth();
  const [searchVal, setSearchVal] = useState('');
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

      {/* Right: User Role, Quick Upload Button, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* User Role Badge */}
        <div
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
            color: 'var(--slate-700)'
          }}
        >
          <span>Role:</span>
          <RoleBadge role={currentUser?.role || 'Member'} />
        </div>

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

