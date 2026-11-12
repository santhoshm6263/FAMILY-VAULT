import React, { useState } from 'react';
import {
  Upload,
  FileCheck,
  FileText,
  X,
  Sparkles,
  CreditCard,
  Shield,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { DOCUMENT_CATEGORIES } from '../../data/categories';
import { useVault } from '../../context/VaultContext';
import { generateSampleDocumentCard } from '../../utils/documentCardGenerator';
import {
  uploadDocumentFile,
  validateDocumentFile,
  formatBytes
} from '../../firebase/storageService';

export const DocumentUploadModal = ({ isOpen, onClose }) => {
  const { members, currentFamilyId, addDocument, showToast } = useVault();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('aadhaar');
  const [memberId, setMemberId] = useState(members[0]?.id || 'mem-1');
  const [docNumber, setDocNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('Identity, Official');

  // Real File objects & previews
  const [frontFile, setFrontFile] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [backPreview, setBackPreview] = useState(null);

  // Status & Progress
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');
  const [validationError, setValidationError] = useState('');

  const selectedCategoryObj = DOCUMENT_CATEGORIES.find((c) => c.id === category) || DOCUMENT_CATEGORIES[0];

  const handleFileSelect = (e, side) => {
    const file = e.target.files[0];
    if (!file) return;

    setValidationError('');

    try {
      validateDocumentFile(file);

      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

      if (side === 'front') {
        setFrontFile(file);
        if (isPdf) {
          setFrontPreview({ isPdf: true, name: file.name, size: formatBytes(file.size) });
        } else {
          const reader = new FileReader();
          reader.onload = () => setFrontPreview({ isPdf: false, url: reader.result, name: file.name, size: formatBytes(file.size) });
          reader.readAsDataURL(file);
        }
      } else {
        setBackFile(file);
        if (isPdf) {
          setBackPreview({ isPdf: true, name: file.name, size: formatBytes(file.size) });
        } else {
          const reader = new FileReader();
          reader.onload = () => setBackPreview({ isPdf: false, url: reader.result, name: file.name, size: formatBytes(file.size) });
          reader.readAsDataURL(file);
        }
      }
    } catch (err) {
      setValidationError(err.message);
      showToast(err.message, 'error');
    }
  };

  const handleUseSampleImages = () => {
    setValidationError('');
    const selectedMember = members.find((m) => m.id === memberId) || members[0];
    const generatedNumber = docNumber.trim() || selectedCategoryObj.numberPlaceholder;
    if (!docNumber) setDocNumber(generatedNumber);
    if (!title) setTitle(`${selectedMember.name.split(' ')[0]}'s ${selectedCategoryObj.name}`);

    const front = generateSampleDocumentCard(category, 'front', generatedNumber, selectedMember.name);
    setFrontPreview({ isPdf: false, url: front, name: 'synthetic_sample_front.svg', size: '1.4 MB' });
    setFrontFile(null); // Indicates synthetic card

    if (selectedCategoryObj.requiresBothSides) {
      const back = generateSampleDocumentCard(category, 'back', generatedNumber, selectedMember.name);
      setBackPreview({ isPdf: false, url: back, name: 'synthetic_sample_back.svg', size: '1.2 MB' });
      setBackFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !docNumber.trim()) {
      setValidationError('Please provide both the document title and number.');
      return;
    }

    const selectedMember = members.find((m) => m.id === memberId) || members[0];
    const docId = `doc_${Date.now()}`;

    setUploading(true);
    setUploadProgress(10);
    setCurrentStepText('Validating and preparing files...');

    try {
      let finalFrontUrl = frontPreview?.url;
      let finalFrontPath = null;
      let finalBackUrl = backPreview?.url;
      let finalBackPath = null;
      let detectedFileType = 'Encrypted Digital Vault File';
      let detectedFileSize = '1.2 MB';

      // 1. Upload Front File to Firebase Storage if real file selected
      if (frontFile) {
        setCurrentStepText('Uploading front document to Firebase Storage...');
        const frontRes = await uploadDocumentFile({
          familyId: currentFamilyId,
          docId: docId,
          file: frontFile,
          side: 'front',
          onProgress: (p) => setUploadProgress(Math.round(p * 0.45 + 10))
        });
        finalFrontUrl = frontRes.downloadURL;
        finalFrontPath = frontRes.storagePath;
        detectedFileType = frontRes.fileType;
        detectedFileSize = frontRes.fileSize;
      } else if (!finalFrontUrl) {
        // Fallback synthetic card
        finalFrontUrl = generateSampleDocumentCard(category, 'front', docNumber, selectedMember.name);
      }

      // 2. Upload Back File to Firebase Storage if real file selected
      if (backFile) {
        setCurrentStepText('Uploading reverse side to Firebase Storage...');
        const backRes = await uploadDocumentFile({
          familyId: currentFamilyId,
          docId: docId,
          file: backFile,
          side: 'back',
          onProgress: (p) => setUploadProgress(Math.round(p * 0.45 + 50))
        });
        finalBackUrl = backRes.downloadURL;
        finalBackPath = backRes.storagePath;
      } else if (selectedCategoryObj.requiresBothSides && !finalBackUrl) {
        finalBackUrl = generateSampleDocumentCard(category, 'back', docNumber, selectedMember.name);
      }

      setUploadProgress(95);
      setCurrentStepText('Writing metadata to Firestore...');

      // 3. Save Document Record in Firestore under /families/{familyId}/documents/{docId}
      await addDocument({
        id: docId,
        familyId: currentFamilyId,
        title: title.trim(),
        category: category,
        categoryName: selectedCategoryObj.name,
        memberId: selectedMember.id,
        memberName: selectedMember.name,
        memberRelation: selectedMember.relation,
        documentNumber: docNumber.trim(),
        maskedNumber: docNumber.length > 4 ? `•••• •••• ${docNumber.slice(-4)}` : docNumber,
        issueDate: issueDate || new Date().toISOString().split('T')[0],
        expiryDate: expiryDate || null,
        hasBackSide: Boolean(finalBackUrl),
        frontImage: finalFrontUrl,
        frontStoragePath: finalFrontPath,
        backImage: finalBackUrl,
        backStoragePath: finalBackPath,
        fileSize: detectedFileSize,
        fileType: detectedFileType,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        notes: notes.trim()
      });

      setUploadProgress(100);
      setCurrentStepText('Completed!');

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        resetForm();
        onClose();
      }, 400);
    } catch (err) {
      console.error('Document Upload Submission Error:', err);
      setValidationError(err.message || 'Error uploading document to Firebase Storage');
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory('aadhaar');
    setDocNumber('');
    setIssueDate('');
    setExpiryDate('');
    setNotes('');
    setFrontFile(null);
    setFrontPreview(null);
    setBackFile(null);
    setBackPreview(null);
    setValidationError('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Document to Family Vault"
      subtitle="Supported formats: PDF, JPG, JPEG, PNG up to 10 MB. Encrypted in private storage."
      maxWidth="720px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={Upload}
            onClick={handleSubmit}
            loading={uploading}
            disabled={uploading}
          >
            {uploading ? `Uploading (${uploadProgress}%)` : 'Securely Save Document'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Aadhaar Privacy & Legal Disclaimer */}
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'var(--amber-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--amber-200)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            fontSize: '0.78rem',
            color: 'var(--amber-700)'
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Sensitive Document Notice:</strong> Aadhaar documents contain sensitive personal identity data. Use synthetic dummy data for testing. Do not upload real Aadhaar cards until organizational and legal reviews are complete.
          </div>
        </div>

        {/* Quick Sample Preset Banner */}
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'var(--primary-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--primary-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--primary-700)' }}>
            <Sparkles size={16} />
            <span>Fast Test Option: Populate realistic synthetic card visuals and pre-fill fields</span>
          </div>
          <button
            type="button"
            onClick={handleUseSampleImages}
            style={{
              padding: '5px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--primary-200)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--primary)',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            Use Sample Data
          </button>
        </div>

        {/* Error Banner */}
        {validationError && (
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
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{validationError}</span>
          </div>
        )}

        {/* Upload Progress Bar */}
        {uploading && (
          <div
            style={{
              padding: '14px',
              backgroundColor: 'var(--slate-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-200)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '6px' }}>
              <span>{currentStepText}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--slate-200)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${uploadProgress}%`,
                  height: '100%',
                  backgroundColor: 'var(--primary)',
                  borderRadius: '4px',
                  transition: 'width 0.2s ease-in-out'
                }}
              />
            </div>
          </div>
        )}

        {/* Row 1: Category & Family Member */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-responsive-2">
          <div className="fv-input-group">
            <label className="fv-label">Document Category *</label>
            <select
              value={category}
              onChange={(e) => {
                const newCat = e.target.value;
                setCategory(newCat);
                const found = DOCUMENT_CATEGORIES.find((c) => c.id === newCat);
                if (found && !title) {
                  const mem = members.find((m) => m.id === memberId);
                  setTitle(`${mem ? mem.name.split(' ')[0] : 'Family'}'s ${found.name}`);
                }
              }}
              className="fv-select"
            >
              {DOCUMENT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="fv-input-group">
            <label className="fv-label">Assign to Family Member *</label>
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
        </div>

        {/* Row 2: Title & Document Number */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-responsive-2">
          <Input
            label="Document Title"
            required
            placeholder={`e.g. Santhosh's ${selectedCategoryObj.name}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Input
            label="Document Number / ID"
            required
            placeholder={`e.g. ${selectedCategoryObj.numberPlaceholder}`}
            helperText={selectedCategoryObj.numberFormat}
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
          />
        </div>

        {/* Row 3: Issue & Expiry Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-responsive-2">
          <Input
            label="Issue Date (Optional)"
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
          />

          <Input
            label="Expiry Date (If applicable)"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            helperText={selectedCategoryObj.hasExpiry ? 'Important for Passports & Licenses' : 'Leave empty if lifelong'}
          />
        </div>

        {/* FRONT & BACK FILE UPLOAD INTERFACE */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label className="fv-label" style={{ fontSize: '0.875rem' }}>
              Document Files (Front & Back Sides)
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
              PDF, JPG, JPEG, PNG (Max 10MB)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }} className="grid-responsive-2">
            {/* Front Side Upload Area */}
            <div
              style={{
                border: '1.5px dashed var(--slate-300)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'center',
                backgroundColor: frontPreview ? '#ffffff' : 'var(--slate-50)',
                position: 'relative',
                minHeight: '170px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {frontPreview ? (
                <div style={{ position: 'relative', width: '100%', height: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  {frontPreview.isPdf ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <FileText size={48} style={{ color: 'var(--rose-500)' }} />
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-800)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {frontPreview.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>{frontPreview.size}</div>
                    </div>
                  ) : (
                    <img
                      src={frontPreview.url}
                      alt="Front Document"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setFrontFile(null);
                      setFrontPreview(null);
                    }}
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      backgroundColor: 'var(--rose-500)',
                      color: '#ffffff',
                      borderRadius: '50%',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    title="Remove front document"
                  >
                    <X size={13} />
                  </button>
                  <div style={{ marginTop: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                    Front Side Ready ✓
                  </div>
                </div>
              ) : (
                <label style={{ cursor: 'pointer', width: '100%' }}>
                  <Upload size={26} style={{ color: 'var(--slate-400)', margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--slate-700)' }}>
                    Front Side File *
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', marginTop: '2px' }}>
                    Select PDF, PNG, or JPG
                  </div>
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/jpg"
                    onChange={(e) => handleFileSelect(e, 'front')}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>

            {/* Back Side Upload Area */}
            <div
              style={{
                border: '1.5px dashed var(--slate-300)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'center',
                backgroundColor: backPreview ? '#ffffff' : 'var(--slate-50)',
                position: 'relative',
                minHeight: '170px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {backPreview ? (
                <div style={{ position: 'relative', width: '100%', height: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  {backPreview.isPdf ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <FileText size={48} style={{ color: 'var(--rose-500)' }} />
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-800)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {backPreview.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>{backPreview.size}</div>
                    </div>
                  ) : (
                    <img
                      src={backPreview.url}
                      alt="Back Document"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setBackFile(null);
                      setBackPreview(null);
                    }}
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      backgroundColor: 'var(--rose-500)',
                      color: '#ffffff',
                      borderRadius: '50%',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    title="Remove back document"
                  >
                    <X size={13} />
                  </button>
                  <div style={{ marginTop: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-500)' }}>
                    Back Side Ready ✓
                  </div>
                </div>
              ) : (
                <label style={{ cursor: 'pointer', width: '100%' }}>
                  <Upload size={26} style={{ color: 'var(--slate-400)', margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--slate-700)' }}>
                    Back Side File {selectedCategoryObj.requiresBothSides ? '(Recommended)' : '(Optional)'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', marginTop: '2px' }}>
                    Select PDF, PNG, or JPG
                  </div>
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/jpg"
                    onChange={(e) => handleFileSelect(e, 'back')}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Row 4: Tags & Notes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-responsive-2">
          <Input
            label="Tags (Comma separated)"
            placeholder="e.g. Identity, Bank KYC, Embassy"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <div className="fv-input-group">
            <label className="fv-label">Personal Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Physical original in locker, verified with digilocker"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="fv-input"
              style={{ resize: 'none' }}
            />
          </div>
        </div>
      </form>

      <style>{`
        @media (max-width: 600px) {
          .grid-responsive-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Modal>
  );
};
