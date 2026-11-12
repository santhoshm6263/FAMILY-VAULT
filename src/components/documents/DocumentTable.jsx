import React from 'react';
import { Eye, Edit2, Trash2, Layers, FileText } from 'lucide-react';
import { CategoryBadge } from '../common/Badge';

export const DocumentTable = ({ documents, onPreview, onEdit, onDelete }) => {
  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)', color: 'var(--slate-500)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <th style={{ padding: '14px 20px', fontWeight: 700 }}>Document</th>
            <th style={{ padding: '14px 16px', fontWeight: 700 }}>Identity Number</th>
            <th style={{ padding: '14px 16px', fontWeight: 700 }}>Family Member</th>
            <th style={{ padding: '14px 16px', fontWeight: 700 }}>Capture</th>
            <th style={{ padding: '14px 16px', fontWeight: 700 }}>Valid Until</th>
            <th style={{ padding: '14px 16px', fontWeight: 700 }}>Uploaded</th>
            <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc, idx) => {
            const isPdf = doc.fileType?.toLowerCase().includes('pdf') || doc.frontImage?.toLowerCase().includes('.pdf');

            return (
              <tr
                key={doc.id}
                style={{
                  borderBottom: idx === documents.length - 1 ? 'none' : '1px solid var(--slate-100)',
                  transition: 'background-color 0.15s'
                }}
                className="table-row-hover"
              >
                {/* Title & Category */}
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isPdf ? (
                      <div
                        style={{
                          width: '42px',
                          height: '28px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--rose-50)',
                          border: '1px solid var(--rose-200)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--rose-600)'
                        }}
                      >
                        <FileText size={16} />
                      </div>
                    ) : (
                      <img
                        src={doc.frontImage}
                        alt={doc.title}
                        style={{
                          width: '42px',
                          height: '28px',
                          borderRadius: '4px',
                          objectFit: 'cover',
                          border: '1px solid var(--slate-200)'
                        }}
                      />
                    )}
                    <div>
                      <div
                        onClick={() => onPreview(doc)}
                        style={{
                          fontWeight: 600,
                          color: 'var(--slate-900)',
                          cursor: 'pointer'
                        }}
                        className="table-title-link"
                      >
                        {doc.title}
                      </div>
                      <div style={{ marginTop: '2px' }}>
                        <CategoryBadge categoryName={doc.categoryName} />
                      </div>
                    </div>
                  </div>
                </td>

              {/* Number */}
              <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--slate-700)' }}>
                {doc.maskedNumber || doc.documentNumber}
              </td>

              {/* Member */}
              <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-100)',
                      color: 'var(--primary-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}
                  >
                    {doc.memberName.charAt(0)}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--slate-800)', fontSize: '0.8125rem' }}>
                      {doc.memberName}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>
                      {doc.memberRelation}
                    </div>
                  </div>
                </div>
              </td>

              {/* Capture Sides */}
              <td style={{ padding: '14px 16px' }}>
                {doc.hasBackSide ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      color: 'var(--primary-700)',
                      backgroundColor: 'var(--primary-50)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 600
                    }}
                  >
                    <Layers size={12} />
                    Front & Back
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 500 }}>
                    Front Side Only
                  </span>
                )}
              </td>

              {/* Expiry */}
              <td style={{ padding: '14px 16px', fontSize: '0.8125rem', color: doc.expiryDate ? 'var(--slate-700)' : 'var(--slate-400)' }}>
                {doc.expiryDate || 'No Expiry'}
              </td>

              {/* Uploaded */}
              <td style={{ padding: '14px 16px', fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                {doc.uploadedAt}
              </td>

              {/* Actions */}
              <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => onPreview(doc)}
                    style={{
                      padding: '6px',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--slate-600)',
                      backgroundColor: 'var(--slate-100)'
                    }}
                    title="View Document"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => onEdit(doc)}
                    style={{
                      padding: '6px',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--slate-600)',
                      backgroundColor: 'var(--slate-100)'
                    }}
                    title="Edit Details"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(doc.id)}
                    style={{
                      padding: '6px',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--rose-600)',
                      backgroundColor: 'var(--rose-50)'
                    }}
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
        </tbody>
      </table>

      <style>{`
        .table-row-hover:hover {
          background-color: var(--slate-50);
        }
        .table-title-link:hover {
          color: var(--primary) !important;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

