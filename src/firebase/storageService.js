import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { storage, auth, isFirebaseConfigured } from './config.js';

/**
 * ============================================================================
 * Firebase Storage Service for Family Documents
 * ============================================================================
 */

// Max file size allowed: 10 Megabytes
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// Allowed MIME types
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png'
];

/**
 * Formats bytes into human-readable string (e.g. 1.4 MB)
 */
export const formatBytes = (bytes, decimals = 1) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Validates file size and type
 */
export const validateDocumentFile = (file) => {
  if (!file) {
    throw new Error('Please select a file to upload.');
  }

  // Type validation
  const fileType = file.type?.toLowerCase() || '';
  const fileExt = file.name ? file.name.split('.').pop()?.toLowerCase() : '';
  const isPdf = fileType === 'application/pdf' || fileExt === 'pdf';
  const isImage = fileType.startsWith('image/') || ['png', 'jpg', 'jpeg'].includes(fileExt);

  if (!isPdf && !isImage) {
    throw new Error('Invalid file type. Only PDF, JPG, JPEG, and PNG files are permitted.');
  }

  // Size validation
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File is too large (${formatBytes(file.size)}). Maximum allowed size is 10 MB.`);
  }

  return true;
};

/**
 * Uploads a document side (front or back) to Firebase Storage
 * Path: families/{familyId}/documents/{docId}/{side}_{timestamp}_{fileName}
 */
export const uploadDocumentFile = async ({
  familyId,
  docId,
  file,
  side = 'front',
  onProgress
}) => {
  // Validate constraints
  validateDocumentFile(file);

  if (isFirebaseConfigured && (!auth.currentUser || !auth.currentUser.uid)) {
    throw new Error('Authentication required: You must be logged in to upload documents.');
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `families/${familyId}/documents/${docId}/${side}_${Date.now()}_${cleanFileName}`;

  if (storage && isFirebaseConfigured) {
    const storageRef = ref(storage, storagePath);

    const metadata = {
      contentType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/png'),
      customMetadata: {
        familyId: familyId,
        docId: docId,
        side: side,
        uploadedBy: auth.currentUser?.uid || 'unknown_user',
        originalName: file.name
      }
    };

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(Math.round(progress));
        },
        (error) => {
          console.error('Firebase Storage upload error:', error);
          reject(new Error(`Storage Upload Failed: ${error.message}`));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);

            resolve({
              downloadURL,
              storagePath,
              fileName: file.name,
              fileSize: formatBytes(file.size),
              fileType: file.type === 'application/pdf' ? 'PDF Document' : 'Image'
            });
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  }

  // Fallback Simulation (FileReader + simulated progress for local offline development)
  return new Promise((resolve) => {
    let currentP = 20;
    const interval = setInterval(() => {
      currentP += 30;
      if (onProgress) onProgress(Math.min(currentP, 95));

      if (currentP >= 100) {
        clearInterval(interval);
        const reader = new FileReader();
        reader.onload = () => {
          if (onProgress) onProgress(100);
          resolve({
            downloadURL: reader.result,
            storagePath: storagePath,
            fileName: file.name,
            fileSize: formatBytes(file.size),
            fileType: file.type === 'application/pdf' || file.name.endsWith('.pdf') ? 'PDF Document' : 'Image'
          });
        };
        reader.readAsDataURL(file);
      }
    }, 120);
  });
};

/**
 * Replaces an existing document side in Firebase Storage
 */
export const replaceDocumentFile = async ({
  familyId,
  docId,
  file,
  side = 'front',
  oldStoragePath,
  onProgress
}) => {
  // If old storage path exists, attempt to delete old file
  if (oldStoragePath && storage && isFirebaseConfigured) {
    try {
      const oldRef = ref(storage, oldStoragePath);
      await deleteObject(oldRef);
    } catch (err) {
      console.warn('Could not delete previous file from storage:', err.message);
    }
  }

  // Upload the replacement file
  return uploadDocumentFile({
    familyId,
    docId,
    file,
    side,
    onProgress
  });
};

/**
 * Deletes a file from Firebase Storage
 */
export const deleteStorageFile = async (storagePath) => {
  if (!storagePath) return;

  if (storage && isFirebaseConfigured) {
    try {
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);
    } catch (err) {
      console.warn('Storage file deletion notice:', err.message);
    }
  }
};

/**
 * Triggers an authorized document download in the browser
 */
export const triggerDocumentDownload = async (url, fileName = 'document.png', _storagePath = null) => {
  try {
    if (url.startsWith('data:')) {
      // Data URL download
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    }

    // Authenticated blob download for Storage URLs
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
    return true;
  } catch (err) {
    console.error('Download error:', err);
    // Fallback: direct window open if blob fetch encounters CORS in local development
    window.open(url, '_blank');
    return false;
  }
};
