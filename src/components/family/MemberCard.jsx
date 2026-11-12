import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MoreVertical,
  Files,
  Mail,
  Phone,
  Trash2
} from 'lucide-react';
import { RoleBadge, StatusBadge } from '../common/Badge';
import { useVault } from '../../context/VaultContext';
import { useAuth } from '../../context/AuthContext';

export const MemberCard = ({ member, onRoleChange }) => {
  const { removeMember } = useVault();
  const { currentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isSelf = currentUser?.email === member.email;
  const isOwner = member.role === 'Owner';

  const handleRoleSelect = (newRole) => {
    onRoleChange(member.id, newRole);
    setMenuOpen(false);
  };

  const handleRemove = () => {
    if (window.confirm(`Are you sure you want to remove ${member.name} from this family vault?`)) {
      removeMember(member.id);
    }
  };

  return (
    <div
      className="fv-card fv-card-hover"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Top row: Avatar & Role */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src={member.avatar}
            alt={member.name}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-full)',
              objectFit: 'cover',
              border: '2px solid var(--slate-100)',
              boxShadow: 'var(--shadow-sm)'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                {member.name}
              </h4>
              {isSelf && (
                <span style={{ fontSize: '0.6875rem', color: 'var(--primary)', fontWeight: 700 }}>
                  (You)
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '1px' }}>
              {member.relation}
            </div>
          </div>
        </div>

        {/* Action Menu button (Only for Owner or Admin, and never on self to prevent role tampering) */}
        {!isOwner && !isSelf && (currentUser?.role === 'Owner' || currentUser?.role === 'Admin') && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--slate-400)',
                backgroundColor: 'transparent'
              }}
              title="Member Options"
            >
              <MoreVertical size={18} />
            </button>

            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  width: '180px',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--slate-200)',
                  padding: '6px',
                  zIndex: 20
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-400)', padding: '4px 8px', textTransform: 'uppercase' }}>
                  Assign Role
                </div>
                {['Admin', 'Member'].map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRoleSelect(r)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '6px 8px',
                      fontSize: '0.8125rem',
                      fontWeight: member.role === r ? 700 : 500,
                      color: member.role === r ? 'var(--primary)' : 'var(--slate-700)',
                      borderRadius: '4px'
                    }}
                    className="menu-item-hover"
                  >
                    Set as {r} {member.role === r ? '✓' : ''}
                  </button>
                ))}

                <div style={{ height: '1px', backgroundColor: 'var(--slate-100)', margin: '4px 0' }} />

                <button
                  onClick={handleRemove}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '6px 8px',
                    fontSize: '0.8125rem',
                    color: 'var(--rose-600)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  className="menu-item-hover"
                >
                  <Trash2 size={13} />
                  <span>Remove Member</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Role & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <RoleBadge role={member.role} />
        <StatusBadge status={member.status} />
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem', color: 'var(--slate-600)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={14} style={{ color: 'var(--slate-400)' }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.email}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Phone size={14} style={{ color: 'var(--slate-400)' }} />
          <span>{member.phone || 'Phone not linked'}</span>
        </div>
      </div>

      {/* Footer: Documents Count & Filter Shortcut */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '12px',
          borderTop: '1px solid var(--slate-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--slate-700)', fontWeight: 600 }}>
          <Files size={14} style={{ color: 'var(--primary)' }} />
          <span>{member.documentsCount || 0} Documents</span>
        </div>

        <button
          onClick={() => navigate(`/app/documents?member=${member.id}`)}
          style={{
            fontSize: '0.78rem',
            color: 'var(--primary)',
            fontWeight: 600,
            textDecoration: 'none'
          }}
          className="hover-underline"
        >
          View Files →
        </button>
      </div>

      <style>{`
        .menu-item-hover:hover {
          background-color: var(--slate-100);
        }
        .hover-underline:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

