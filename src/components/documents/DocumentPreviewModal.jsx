import React, { useState } from 'react';
import {
  X,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Edit,
  Shield,
  FileCheck,
  FileText,
  Calendar,
  User,
  Hash,
  Lock,
  Layers,
  ExternalLink
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CategoryBadge, StatusBadge } from '../common/Badge';
import { useVault } from '../../context/VaultContext';
import { triggerDocumentDownload, deleteStorageFile } from '../../firebase/storageService';

export const DocumentPreviewModal = ({
  document: doc,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  const { showToast } = useVault();
  const [activeTab, setActiveTab] = useState('front'); // 'front' | 'back' | 'both'
  const [isMasked, setIsMasked] = useState(true);
  const [downloading, setDownloading] = useState(false);

  if (!doc) return null;

  const isFrontPdf = doc.frontImage?.toLowerCase().includes('.pdf') || doc.fileType?.toLowerCase().includes('pdf');
  const isBackPdf = doc.backImage?.toLowerCase().includes('.pdf');

  const handleDownload = async () => {
    setDownloading(true);
    const targetUrl = activeTab === 'back' && doc.backImage ? doc.backImage : doc.frontImage;
    const isTargetPdf = activeTab === 'back' ? isBackPdf : isFrontPdf;
    const ext = isTargetPdf ? 'pdf' : 'png';
    const targetPath = activeTab === 'back' ? doc.backStoragePath : doc.frontStoragePath;
    const safeName = `${doc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${activeTab}.${ext}`;

    try {
      await triggerDocumentDownload(targetUrl, safeName, targetPath);
      showToast(`Downloaded "${doc.title}" (${activeTab} side)`, 'success');
    } catch (err) {
      showToast('Error downloading document file', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteWithStorage = async () => {
    if (window.confirm(`Permanently delete "${doc.title}" from this family vault and remove stored files?`)) {
      if (doc.frontStoragePath) {
        await deleteStorageFile(doc.frontStoragePath);
      }
      if (doc.backStoragePath) {
        await deleteStorageFile(doc.backStoragePath);
      }
      onDelete(doc.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={doc.title}
      subtitle={`Encrypted Vault Document • ${doc.categoryName}`}
      maxWidth="800px"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '8px' }}>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={handleDeleteWithStorage}
          >
            Delete Document
          </Button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              variant="secondary"
              size="sm"
              icon={Edit}
              onClick={() => {
                onClose();
                onEdit(doc);
              }}
            >
              Edit & Replace File
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              loading={downloading}
              onClick={handleDownload}
            >
              Download Copy
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Document Header Badges & Side Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--slate-100)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CategoryBadge categoryName={doc.categoryName} />
            <StatusBadge status="Verified" />
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                color: 'var(--slate-500)',
                backgroundColor: 'var(--slate-100)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              <Lock size={11} style={{ color: 'var(--emerald-500)' }} />
              {doc.fileType || 'AES-256 Storage'}
            </span>
          </div>

          {/* Side View Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--slate-100)',
              padding: '3px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <button
              onClick={() => setActiveTab('front')}
              style={{
                padding: '5px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: activeTab === 'front' ? '#ffffff' : 'transparent',
                color: activeTab === 'front' ? 'var(--primary)' : 'var(--slate-600)',
                boxShadow: activeTab === 'front' ? 'var(--shadow-xs)' : 'none',
                cursor: 'pointer'
              }}
            >
              Front Side
            </button>
            {doc.hasBackSide && (
              <button
                onClick={() => setActiveTab('back')}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: activeTab === 'back' ? '#ffffff' : 'transparent',
                  color: activeTab === 'back' ? 'var(--primary)' : 'var(--slate-600)',
                  boxShadow: activeTab === 'back' ? 'var(--shadow-xs)' : 'none',
                  cursor: 'pointer'
                }}
              >
                Back Side
              </button>
            )}
            {doc.hasBackSide && (
              <button
                onClick={() => setActiveTab('both')}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: activeTab === 'both' ? '#ffffff' : 'transparent',
                  color: activeTab === 'both' ? 'var(--primary)' : 'var(--slate-600)',
                  boxShadow: activeTab === 'both' ? 'var(--shadow-xs)' : 'none',
                  cursor: 'pointer'
                }}
              >
                Both Sides
              </button>
            )}
          </div>
        </div>

        {/* Visual Document Showcase Card Display */}
        <div
          style={{
            backgroundColor: 'var(--slate-100)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: activeTab === 'both' ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            border: '1px solid var(--slate-200)',
            minHeight: '260px'
          }}
        >
          {/* Front Side View */}
          {(activeTab === 'front' || activeTab === 'both') && (
            <div style={{ flex: 1, width: '100%', maxWidth: activeTab === 'both' ? '340px' : '460px' }}>
              <div
                style={{
                  boxShadow: 'var(--shadow-md)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--slate-200)',
                  backgroundColor: '#ffffff'
                }}
              >
                {isFrontPdf ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <FileText size={56} style={{ color: 'var(--rose-500)' }} />
                    <div style={{ fontWeight: 700, color: 'var(--slate-800)', fontSize: '0.9rem' }}>
                      PDF Document Stored
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                      Encrypted PDF archive • {doc.fileSize || '1.4 MB'}
                    </div>
                    <a
                      href={doc.frontImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        marginTop: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--primary-50)',
                        color: 'var(--primary)',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}
                    >
                      <ExternalLink size={13} />
                      <span>Open Full PDF in New Tab</span>
                    </a>
                  </div>
                ) : (
                  <img
                    src={doc.frontImage}
                    alt={`${doc.title} - Front`}
                    style={{ width: '100%', display: 'block', maxHeight: '320px', objectFit: 'contain' }}
                  />
                )}
              </div>
              <div
                style={{
                  textAlign: 'center',
                  marginTop: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--slate-600)'
                }}
              >
                Document Front Side
              </div>
            </div>
          )}

          {/* Back Side View */}
          {(activeTab === 'back' || activeTab === 'both') && doc.hasBackSide && doc.backImage && (
            <div style={{ flex: 1, width: '100%', maxWidth: activeTab === 'both' ? '340px' : '460px' }}>
              <div
                style={{
                  boxShadow: 'var(--shadow-md)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--slate-200)',
                  backgroundColor: '#ffffff'
                }}
              >
                {isBackPdf ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <FileText size={56} style={{ color: 'var(--rose-500)' }} />
                    <div style={{ fontWeight: 700, color: 'var(--slate-800)', fontSize: '0.9rem' }}>
                      Reverse PDF Stored
                    </div>
                    <a
                      href={doc.backImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        marginTop: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--primary-50)',
                        color: 'var(--primary)',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}
                    >
                      <ExternalLink size={13} />
                      <span>Open Full PDF in New Tab</span>
                    </a>
                  </div>
                ) : (
                  <img
                    src={doc.backImage}
                    alt={`${doc.title} - Back`}
                    style={{ width: '100%', display: 'block', maxHeight: '320px', objectFit: 'contain' }}
                  />
                )}
              </div>
              <div
                style={{
                  textAlign: 'center',
                  marginTop: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--slate-600)'
                }}
              >
                Document Back Side (Address & QR)
              </div>
            </div>
          )}
        </div>

        {/* Security & Document Number Banner */}
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: 'var(--slate-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--slate-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>
              Official Identity Number
            </div>
            <div
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: 'var(--slate-900)',
                letterSpacing: isMasked ? '0.15em' : '0.05em',
                marginTop: '2px'
              }}
            >
              {isMasked ? doc.maskedNumber || '•••• •••• 3847' : doc.documentNumber}
            </div>
          </div>

          <button
            onClick={() => setIsMasked(!isMasked)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--slate-300)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--slate-700)',
              cursor: 'pointer'
            }}
          >
            {isMasked ? (
              <>
                <Eye size={14} style={{ color: 'var(--primary)' }} />
                <span>Show Number</span>
              </>
            ) : (
              <>
                <EyeOff size={14} style={{ color: 'var(--slate-500)' }} />
                <span>Mask Number</span>
              </>
            )}
          </button>
        </div>

        {/* Detailed Metadata Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            padding: '16px',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--slate-100)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--slate-400)' }}>
              <User size={13} />
              <span>Assigned Member</span>
            </div>
            <div style={{ fontWeight: 600, color: 'var(--slate-800)', marginTop: '3px' }}>
              {doc.memberName} <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>({doc.memberRelation})</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--slate-400)' }}>
              <Calendar size={13} />
              <span>Issue Date</span>
            </div>
            <div style={{ fontWeight: 600, color: 'var(--slate-800)', marginTop: '3px' }}>
              {doc.issueDate || 'Lifetime / Not Specified'}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--slate-400)' }}>
              <Calendar size={13} />
              <span>Expiry Date</span>
            </div>
            <div style={{ fontWeight: 600, color: doc.expiryDate ? 'var(--amber-700)' : 'var(--slate-800)', marginTop: '3px' }}>
              {doc.expiryDate || 'No Expiry (Lifelong)'}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--slate-400)' }}>
              <Layers size={13} />
              <span>Sides Captured</span>
            </div>
            <div style={{ fontWeight: 600, color: 'var(--slate-800)', marginTop: '3px' }}>
              {doc.hasBackSide ? 'Front & Back (Dual)' : 'Front Side Only'}
            </div>
          </div>
        </div>

        {/* Notes & Tags */}
        {doc.notes && (
          <div style={{ padding: '12px 14px', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', marginBottom: '3px' }}>
              Personal Notes
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--slate-700)' }}>{doc.notes}</div>
          </div>
        )}
      </div>
    </Modal>
  );
};
