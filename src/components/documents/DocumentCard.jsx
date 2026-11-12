import React from 'react';
import {
  Eye,
  Edit2,
  Trash2,
  Layers,
  Lock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { CategoryBadge } from '../common/Badge';

export const DocumentCard = ({ doc, onPreview, onEdit, onDelete }) => {
  const isExpiringSoon = doc.expiryDate && new Date(doc.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const isPdf = doc.fileType?.toLowerCase().includes('pdf') || doc.frontImage?.toLowerCase().includes('.pdf');

  return (
    <div
      className="fv-card fv-card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
      onClick={() => onPreview(doc)}
    >
      {/* Thumbnail Area */}
      <div
        style={{
          position: 'relative',
          backgroundColor: 'var(--slate-100)',
          padding: '16px',
          height: '160px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid var(--slate-100)'
        }}
      >
        {isPdf ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <FileText size={48} style={{ color: 'var(--rose-500)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
              PDF Archive
            </span>
          </div>
        ) : (
          <img
            src={doc.frontImage}
            alt={doc.title}
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              borderRadius: '6px',
              boxShadow: 'var(--shadow-sm)'
            }}
          />
        )}

        {/* Top Badges */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <CategoryBadge categoryName={doc.categoryName} />
        </div>

        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {doc.hasBackSide && (
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                color: '#ffffff',
                padding: '3px 7px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}
              title="Both Front & Back sides captured"
            >
              <Layers size={10} />
              Front & Back
            </span>
          )}
        </div>

        {/* Hover Quick Action Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onPreview(doc)}
            style={{
              padding: '6px',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-sm)',
              color: 'var(--slate-700)'
            }}
            title="Inspect Document"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => onEdit(doc)}
            style={{
              padding: '6px',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-sm)',
              color: 'var(--slate-700)'
            }}
            title="Edit Details"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(doc.id)}
            style={{
              padding: '6px',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-sm)',
              color: 'var(--rose-500)'
            }}
            title="Delete Document"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h4
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: 'var(--slate-900)',
            marginBottom: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          title={doc.title}
        >
          {doc.title}
        </h4>

        <div
          style={{
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: 'var(--slate-600)',
            letterSpacing: '0.05em',
            marginBottom: '12px'
          }}
        >
          {doc.maskedNumber || doc.documentNumber}
        </div>

        {/* Expiry Alert if applicable */}
        {doc.expiryDate && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.75rem',
              color: isExpiringSoon ? 'var(--amber-700)' : 'var(--slate-500)',
              backgroundColor: isExpiringSoon ? 'var(--amber-50)' : 'transparent',
              padding: isExpiringSoon ? '2px 6px' : '0',
              borderRadius: '4px',
              marginBottom: '10px'
            }}
          >
            {isExpiringSoon && <AlertTriangle size={12} />}
            <span>Valid till: <strong>{doc.expiryDate}</strong></span>
          </div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--slate-600)' }}>
            <span
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                fontWeight: 700
              }}
            >
              {doc.memberName.charAt(0)}
            </span>
            <span>{doc.memberName}</span>
          </div>

          <span style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>
            {doc.uploadedAt}
          </span>
        </div>
      </div>
    </div>
  );
};

