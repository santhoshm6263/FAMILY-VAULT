import React, { useState, useEffect } from 'react';
import { RefreshCw, FileText, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useVault } from '../../context/VaultContext';
import {
  replaceDocumentFile,
  validateDocumentFile,
  formatBytes
} from '../../firebase/storageService';

export const DocumentEditModal = ({ document: doc, isOpen, onClose }) => {
  const { members, currentFamilyId, updateDocument, showToast } = useVault();

  const [title, setTitle] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [memberId, setMemberId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  // Replacement files state
  const [replacingFront, setReplacingFront] = useState(false);
  const [replacingBack, setReplacingBack] = useState(false);
  const [frontProgress, setFrontProgress] = useState(0);
  const [backProgress, setBackProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (doc) {
      setTitle(doc.title || '');
      setDocNumber(doc.documentNumber || '');
      setMemberId(doc.memberId || members[0]?.id || '');
      setIssueDate(doc.issueDate || '');
      setExpiryDate(doc.expiryDate || '');
      setNotes(doc.notes || '');
      setErrorMessage('');
    }
  }, [doc, members]);

  if (!doc) return null;

  const handleFileReplacement = async (e, side) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMessage('');

    try {
      validateDocumentFile(file);

      if (side === 'front') {
        setReplacingFront(true);
        setFrontProgress(15);
        const res = await replaceDocumentFile({
          familyId: doc.familyId || currentFamilyId,
          docId: doc.id,
          file: file,
          side: 'front',
          oldStoragePath: doc.frontStoragePath,
          onProgress: (p) => setFrontProgress(p)
        });

        await updateDocument(doc.id, {
          frontImage: res.downloadURL,
          frontStoragePath: res.storagePath,
          fileSize: res.fileSize,
          fileType: res.fileType
        });

        setReplacingFront(false);
        showToast('Front document file successfully replaced in Storage!', 'success');
      } else {
        setReplacingBack(true);
        setBackProgress(15);
        const res = await replaceDocumentFile({
          familyId: doc.familyId || currentFamilyId,
          docId: doc.id,
          file: file,
          side: 'back',
          oldStoragePath: doc.backStoragePath,
          onProgress: (p) => setBackProgress(p)
        });

        await updateDocument(doc.id, {
          backImage: res.downloadURL,
          backStoragePath: res.storagePath,
          hasBackSide: true
        });

        setReplacingBack(false);
        showToast('Back document file successfully replaced in Storage!', 'success');
      }
    } catch (err) {
      console.error('File replacement error:', err);
      setErrorMessage(err.message || 'Error replacing document file');
      if (side === 'front') setReplacingFront(false);
      else setReplacingBack(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const assignedMember = members.find((m) => m.id === memberId) || { name: doc.memberName, relation: doc.memberRelation };

    await updateDocument(doc.id, {
      title: title.trim(),
      documentNumber: docNumber.trim(),
      maskedNumber: docNumber.length > 4 ? `•••• •••• ${docNumber.slice(-4)}` : docNumber,
      memberId: memberId,
      memberName: assignedMember.name,
      memberRelation: assignedMember.relation,
      issueDate: issueDate || null,
      expiryDate: expiryDate || null,
      notes: notes.trim()
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit & Replace Document Records"
      subtitle={`Modify metadata or replace uploaded files for ${doc.categoryName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {errorMessage && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--rose-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--rose-200)',
              color: 'var(--rose-700)',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <Input
          label="Document Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Input
          label="Document Number"
          required
          value={docNumber}
          onChange={(e) => setDocNumber(e.target.value)}
        />

        <div className="fv-input-group">
          <label className="fv-label">Assigned Family Member</label>
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="fv-select"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.relation})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Input
            label="Issue Date"
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
          />

          <Input
            label="Expiry Date"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>

        {/* File Replacement Section */}
        <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '14px' }}>
          <label className="fv-label" style={{ marginBottom: '8px', display: 'block' }}>
            Replace Storage Files (PDF, PNG, JPG, JPEG &le; 10MB)
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Replace Front Side */}
            <div
              style={{
                padding: '12px',
                border: '1px dashed var(--slate-300)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--slate-50)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '4px' }}>
                Front Side File
              </div>
              {replacingFront ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                  Replacing... {frontProgress}%
                </div>
              ) : (
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 10px',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--slate-200)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--primary)',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={12} />
                  <span>Upload Replacement</span>
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/jpg"
                    onChange={(e) => handleFileReplacement(e, 'front')}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>

            {/* Replace Back Side */}
            <div
              style={{
                padding: '12px',
                border: '1px dashed var(--slate-300)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--slate-50)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '4px' }}>
                Back Side File
              </div>
              {replacingBack ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                  Replacing... {backProgress}%
                </div>
              ) : (
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 10px',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--slate-200)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--primary)',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={12} />
                  <span>Upload Replacement</span>
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/jpg"
                    onChange={(e) => handleFileReplacement(e, 'back')}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="fv-input-group">
          <label className="fv-label">Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="fv-input"
            style={{ resize: 'none' }}
          />
        </div>
      </form>
    </Modal>
  );
};
