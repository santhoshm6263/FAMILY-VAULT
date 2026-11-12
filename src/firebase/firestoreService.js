import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { INITIAL_MEMBERS, INITIAL_FAMILY_PROFILE } from '../data/initialMembers';
import { INITIAL_DOCUMENTS } from '../data/initialDocuments';

/**
 * ============================================================================
 * Cloud Firestore Multi-Family Service Layer
 * ============================================================================
 */

// Helper: Generate unique human-readable family vault code (e.g. FV-8842-SH)
export const generateVaultCode = (name = 'Family') => {
  const initials = name
    .split(' ')
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 3) || 'VAULT';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `FV-${randomNum}-${initials}`;
};

// Helper: Generate invitation code (e.g. FV-INV-4921)
export const generateInviteCode = () => {
  return `FV-INV-${Math.floor(1000 + Math.random() * 9000)}`;
};

/**
 * 1. User Profile Management (/users/{uid})
 */
export const syncUserProfile = async (user, additionalData = {}) => {
  if (!user?.uid) return null;

  if (db && isFirebaseConfigured) {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      const initialProfile = {
        uid: user.uid,
        email: user.email?.toLowerCase() || '',
        displayName: user.displayName || user.name || 'Family Member',
        photoURL: user.photoURL || user.avatar || '',
        currentFamilyId: additionalData.familyId || null,
        familyIds: additionalData.familyId ? [additionalData.familyId] : [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(userRef, initialProfile);
      return initialProfile;
    } else {
      const existing = snap.data();
      const updates = { updatedAt: serverTimestamp() };
      if (additionalData.familyId && !existing.familyIds?.includes(additionalData.familyId)) {
        updates.familyIds = arrayUnion(additionalData.familyId);
        if (!existing.currentFamilyId) updates.currentFamilyId = additionalData.familyId;
      }
      await updateDoc(userRef, updates);
      return { ...existing, ...updates };
    }
  }

  // Fallback Local Storage Simulation
  const saved = JSON.parse(localStorage.getItem(`fv_user_profile_${user.uid}`) || 'null');
  if (!saved) {
    const newProfile = {
      uid: user.uid,
      email: user.email?.toLowerCase() || '',
      displayName: user.displayName || user.name || 'Family Member',
      photoURL: user.avatar || '',
      currentFamilyId: additionalData.familyId || 'fam-8842',
      familyIds: additionalData.familyId ? [additionalData.familyId] : ['fam-8842'],
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(`fv_user_profile_${user.uid}`, JSON.stringify(newProfile));
    return newProfile;
  }
  return saved;
};

/**
 * 2. Create Family Workspace (/families/{familyId})
 */
export const createFamilyWorkspace = async (user, familyName, planTier = 'Family Pro (Encrypted)') => {
  const familyId = `fam_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const vaultCode = generateVaultCode(familyName);

  const familyPayload = {
    id: familyId,
    name: familyName.trim(),
    vaultCode: vaultCode,
    ownerId: user.uid,
    createdBy: user.email,
    createdAt: new Date().toISOString(),
    planTier: planTier,
    storageUsed: '0.1 MB',
    maxStorage: '500 MB',
    securityLevel: 'AES-256 GCM Client-Side',
    memberCount: 1
  };

  const initialMember = {
    id: user.uid,
    uid: user.uid,
    name: user.displayName || user.name || 'Household Head',
    email: user.email,
    role: 'Owner',
    relation: 'Self / Head of Family',
    phone: user.phone || '+91 98765 43210',
    avatar: user.photoURL || user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joinedDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    documentsCount: 0
  };

  if (db && isFirebaseConfigured) {
    // 1. Create family document
    await setDoc(doc(db, 'families', familyId), {
      ...familyPayload,
      createdAt: serverTimestamp()
    });

    // 2. Add owner to subcollection: /families/{familyId}/members/{uid}
    await setDoc(doc(db, 'families', familyId, 'members', user.uid), {
      ...initialMember,
      joinedAt: serverTimestamp()
    });

    // 3. Update user profile with new familyId and switch currentFamilyId
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      familyIds: arrayUnion(familyId),
      currentFamilyId: familyId,
      updatedAt: serverTimestamp()
    });
  } else {
    // Fallback simulation: store family workspace in localStorage
    const allFamilies = JSON.parse(localStorage.getItem('fv_sim_families') || '{}');
    allFamilies[familyId] = {
      ...familyPayload,
      members: [initialMember],
      invitations: [],
      documents: []
    };
    localStorage.setItem('fv_sim_families', JSON.stringify(allFamilies));

    // Update user profile
    const profile = JSON.parse(localStorage.getItem(`fv_user_profile_${user.uid}`) || '{}');
    profile.familyIds = [...(profile.familyIds || []), familyId];
    profile.currentFamilyId = familyId;
    localStorage.setItem(`fv_user_profile_${user.uid}`, JSON.stringify(profile));
  }

  return familyPayload;
};

/**
 * 3. Fetch All Families for a User
 */
export const fetchUserFamilies = async (user) => {
  if (!user?.uid) return [];

  if (db && isFirebaseConfigured) {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const familyIds = userDoc.exists() ? userDoc.data().familyIds || [] : [];

      if (familyIds.length === 0) return [];

      const families = [];
      for (const fId of familyIds) {
        const fSnap = await getDoc(doc(db, 'families', fId));
        if (fSnap.exists()) {
          families.push({ id: fSnap.id, ...fSnap.data() });
        }
      }
      return families;
    } catch (err) {
      console.warn('Error fetching user families from Firestore:', err);
      return [];
    }
  }

  // Fallback simulation
  const allFamilies = JSON.parse(localStorage.getItem('fv_sim_families') || '{}');
  const profile = JSON.parse(localStorage.getItem(`fv_user_profile_${user.uid}`) || '{}');
  const familyIds = profile.familyIds || ['fam-8842'];

  return familyIds.map((id) => {
    if (allFamilies[id]) return allFamilies[id];
    return { ...INITIAL_FAMILY_PROFILE, id: 'fam-8842' };
  });
};

/**
 * 4. Fetch Members for a Family Workspace
 */
export const subscribeFamilyMembers = (familyId, callback) => {
  if (!familyId) return () => {};

  if (db && isFirebaseConfigured) {
    const membersRef = collection(db, 'families', familyId, 'members');
    return onSnapshot(
      membersRef,
      (snapshot) => {
        const membersList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        callback(membersList);
      },
      (error) => {
        console.warn('Firestore members subscription notice:', error.message);
      }
    );
  }

  // Fallback simulation
  const allFamilies = JSON.parse(localStorage.getItem('fv_sim_families') || '{}');
  const fam = allFamilies[familyId];
  const list = fam ? fam.members || [] : INITIAL_MEMBERS;
  callback(list);
  return () => {};
};

/**
 * 5. Send Invitation to Join Family Workspace
 */
export const sendFamilyInvitation = async (familyId, familyName, inviteData, inviterUser) => {
  const inviteCode = generateInviteCode();
  const invitationId = `inv_${Date.now()}`;

  const invitation = {
    id: invitationId,
    familyId: familyId,
    familyName: familyName,
    email: inviteData.email.trim().toLowerCase(),
    name: inviteData.name.trim(),
    role: inviteData.role || 'Member',
    relation: inviteData.relation || 'Relative',
    invitedBy: inviterUser.uid,
    invitedByName: inviterUser.displayName || inviterUser.name || 'Family Admin',
    inviteCode: inviteCode,
    status: 'Pending',
    createdAt: new Date().toISOString().split('T')[0],
    message: inviteData.message || ''
  };

  if (db && isFirebaseConfigured) {
    // 1. Store inside /families/{familyId}/invitations/{invitationId}
    await setDoc(doc(db, 'families', familyId, 'invitations', invitationId), {
      ...invitation,
      createdAt: serverTimestamp()
    });

    // 2. Store in fast global registry /invitations/{inviteCode}
    await setDoc(doc(db, 'invitations', inviteCode), {
      ...invitation,
      createdAt: serverTimestamp()
    });
  } else {
    // Fallback simulation
    const allFamilies = JSON.parse(localStorage.getItem('fv_sim_families') || '{}');
    if (allFamilies[familyId]) {
      allFamilies[familyId].invitations = [invitation, ...(allFamilies[familyId].invitations || [])];
      localStorage.setItem('fv_sim_families', JSON.stringify(allFamilies));
    }
    // Also save in global simulated registry
    const globalInvites = JSON.parse(localStorage.getItem('fv_sim_global_invites') || '{}');
    globalInvites[inviteCode] = invitation;
    localStorage.setItem('fv_sim_global_invites', JSON.stringify(globalInvites));
  }

  return invitation;
};

/**
 * 6. Accept Family Invitation
 */
export const acceptFamilyInvitation = async (inviteCode, user) => {
  if (!user?.uid || !inviteCode) throw new Error('User and invitation code are required');

  let invite = null;

  if (db && isFirebaseConfigured) {
    const inviteRef = doc(db, 'invitations', inviteCode.trim());
    const snap = await getDoc(inviteRef);

    if (!snap.exists()) {
      throw new Error('Invitation not found or invalid code');
    }

    invite = snap.data();
    if (invite.status !== 'Pending') {
      throw new Error(`This invitation has already been ${invite.status.toLowerCase()}`);
    }

    const familyId = invite.familyId;

    // 1. Update invitation status to Accepted in global registry & subcollection
    await updateDoc(inviteRef, {
      status: 'Accepted',
      acceptedBy: user.uid,
      acceptedAt: serverTimestamp()
    });

    await updateDoc(doc(db, 'families', familyId, 'invitations', invite.id), {
      status: 'Accepted',
      acceptedBy: user.uid,
      acceptedAt: serverTimestamp()
    });

    // 2. Add member to /families/{familyId}/members/{user.uid}
    const newMember = {
      id: user.uid,
      uid: user.uid,
      name: user.displayName || invite.name || 'Family Member',
      email: user.email,
      role: invite.role || 'Member',
      relation: invite.relation || 'Member',
      avatar: user.photoURL || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      status: 'Active',
      invitationId: invite.id,
      joinedDate: new Date().toISOString().split('T')[0],
      joinedAt: serverTimestamp(),
      documentsCount: 0
    };

    await setDoc(doc(db, 'families', familyId, 'members', user.uid), newMember);

    // 3. Update user profile familyIds and currentFamilyId
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      familyIds: arrayUnion(familyId),
      currentFamilyId: familyId,
      updatedAt: serverTimestamp()
    });

    return { familyId, familyName: invite.familyName, role: invite.role };
  } else {
    // Fallback simulation
    const globalInvites = JSON.parse(localStorage.getItem('fv_sim_global_invites') || '{}');
    invite = globalInvites[inviteCode.trim()];

    if (!invite) throw new Error('Invitation code not found');
    if (invite.status !== 'Pending') throw new Error(`Invitation has already been ${invite.status.toLowerCase()}`);

    invite.status = 'Accepted';
    globalInvites[inviteCode.trim()] = invite;
    localStorage.setItem('fv_sim_global_invites', JSON.stringify(globalInvites));

    const familyId = invite.familyId;
    const allFamilies = JSON.parse(localStorage.getItem('fv_sim_families') || '{}');

    const newMember = {
      id: user.uid,
      uid: user.uid,
      name: user.name || invite.name,
      email: user.email,
      role: invite.role,
      relation: invite.relation,
      avatar: user.avatar,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
      documentsCount: 0
    };

    if (allFamilies[familyId]) {
      allFamilies[familyId].members = [...(allFamilies[familyId].members || []), newMember];
      // update status in subcollection list
      allFamilies[familyId].invitations = (allFamilies[familyId].invitations || []).map((i) =>
        i.inviteCode === inviteCode ? { ...i, status: 'Accepted' } : i
      );
      localStorage.setItem('fv_sim_families', JSON.stringify(allFamilies));
    }

    const profile = JSON.parse(localStorage.getItem(`fv_user_profile_${user.uid}`) || '{}');
    profile.familyIds = Array.from(new Set([...(profile.familyIds || []), familyId]));
    profile.currentFamilyId = familyId;
    localStorage.setItem(`fv_user_profile_${user.uid}`, JSON.stringify(profile));

    return { familyId, familyName: invite.familyName, role: invite.role };
  }
};

/**
 * 7. Reject Family Invitation
 */
export const rejectFamilyInvitation = async (inviteCode, _user) => {
  if (db && isFirebaseConfigured) {
    const inviteRef = doc(db, 'invitations', inviteCode);
    const snap = await getDoc(inviteRef);
    if (!snap.exists()) throw new Error('Invitation not found');

    const invite = snap.data();
    await updateDoc(inviteRef, {
      status: 'Rejected',
      rejectedAt: serverTimestamp()
    });

    if (invite.familyId && invite.id) {
      await updateDoc(doc(db, 'families', invite.familyId, 'invitations', invite.id), {
        status: 'Rejected',
        rejectedAt: serverTimestamp()
      });
    }
  } else {
    const globalInvites = JSON.parse(localStorage.getItem('fv_sim_global_invites') || '{}');
    if (globalInvites[inviteCode]) {
      globalInvites[inviteCode].status = 'Rejected';
      localStorage.setItem('fv_sim_global_invites', JSON.stringify(globalInvites));
    }
  }
  return true;
};

/**
 * 8. Member Role Management & Removal
 */
export const updateMemberRoleInFirestore = async (familyId, memberId, newRole) => {
  if (db && isFirebaseConfigured) {
    const memberRef = doc(db, 'families', familyId, 'members', memberId);
    await updateDoc(memberRef, {
      role: newRole,
      updatedAt: serverTimestamp()
    });
  } else {
    const allFamilies = JSON.parse(localStorage.getItem('fv_sim_families') || '{}');
    if (allFamilies[familyId]) {
      allFamilies[familyId].members = (allFamilies[familyId].members || []).map((m) =>
        m.id === memberId ? { ...m, role: newRole } : m
      );
      localStorage.setItem('fv_sim_families', JSON.stringify(allFamilies));
    }
  }
};

export const removeMemberFromFirestore = async (familyId, memberId) => {
  if (db && isFirebaseConfigured) {
    const memberRef = doc(db, 'families', familyId, 'members', memberId);
    await deleteDoc(memberRef);

    // If member has user profile, remove from familyIds
    try {
      const userRef = doc(db, 'users', memberId);
      await updateDoc(userRef, {
        familyIds: arrayRemove(familyId)
      });
    } catch {}
  } else {
    const allFamilies = JSON.parse(localStorage.getItem('fv_sim_families') || '{}');
    if (allFamilies[familyId]) {
      allFamilies[familyId].members = (allFamilies[familyId].members || []).filter((m) => m.id !== memberId);
      localStorage.setItem('fv_sim_families', JSON.stringify(allFamilies));
    }
  }
};

/**
 * 9. Add Dependent / Minor without email account
 */
export const addDependentMemberToFirestore = async (familyId, dependentData) => {
  const memberId = `dep_${Date.now()}`;
  const record = {
    id: memberId,
    uid: null, // dependents do not have login credentials
    name: dependentData.name.trim(),
    email: dependentData.email || `${dependentData.name.toLowerCase().replace(/\s+/g, '.')}.dep@familyvault.io`,
    role: dependentData.role || 'Member',
    relation: dependentData.relation || 'Child',
    phone: dependentData.phone || 'Managed by Head of Family',
    avatar: dependentData.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    joinedDate: new Date().toISOString().split('T')[0],
    documentsCount: 0
  };

  if (db && isFirebaseConfigured) {
    await setDoc(doc(db, 'families', familyId, 'members', memberId), {
      ...record,
      createdAt: serverTimestamp()
    });
  } else {
    const allFamilies = JSON.parse(localStorage.getItem('fv_sim_families') || '{}');
    if (allFamilies[familyId]) {
      allFamilies[familyId].members = [...(allFamilies[familyId].members || []), record];
      localStorage.setItem('fv_sim_families', JSON.stringify(allFamilies));
    }
  }

  return record;
};

/**
 * 10. Document Operations
 */
export const subscribeFamilyDocuments = (familyId, callback) => {
  if (!familyId) return () => {};

  if (db && isFirebaseConfigured) {
    const docsRef = collection(db, 'families', familyId, 'documents');
    return onSnapshot(
      docsRef,
      (snapshot) => {
        const docsList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(docsList);
      },
      (error) => {
        console.warn('Firestore documents subscription notice:', error.message);
      }
    );
  }

  const allFamilies = JSON.parse(localStorage.getItem('fv_sim_families') || '{}');
  const fam = allFamilies[familyId];
  const list = fam ? fam.documents || [] : INITIAL_DOCUMENTS;
  callback(list);
  return () => {};
};

export const addDocumentToFirestore = async (familyId, docData) => {
  const docId = `doc_${Date.now()}`;
  const payload = {
    ...docData,
    id: docId,
    familyId: familyId,
    uploadedAt: new Date().toISOString().split('T')[0],
    verified: true
  };

  if (db && isFirebaseConfigured) {
    await setDoc(doc(db, 'families', familyId, 'documents', docId), {
      ...payload,
      createdAt: serverTimestamp()
    });
  } else {
    const allFamilies = JSON.parse(localStorage.getItem('fv_sim_families') || '{}');
    if (allFamilies[familyId]) {
      allFamilies[familyId].documents = [payload, ...(allFamilies[familyId].documents || [])];
      localStorage.setItem('fv_sim_families', JSON.stringify(allFamilies));
    }
  }

  return payload;
};

export const updateDocumentInFirestore = async (familyId, docId, updatedFields) => {
  if (db && isFirebaseConfigured) {
    await updateDoc(doc(db, 'families', familyId, 'documents', docId), {
      ...updatedFields,
      updatedAt: serverTimestamp()
    });
  } else {
    const allFamilies = JSON.parse(localStorage.getItem('fv_sim_families') || '{}');
    if (allFamilies[familyId]) {
      allFamilies[familyId].documents = (allFamilies[familyId].documents || []).map((d) =>
        d.id === docId ? { ...d, ...updatedFields } : d
      );
      localStorage.setItem('fv_sim_families', JSON.stringify(allFamilies));
    }
  }
};

export const deleteDocumentFromFirestore = async (familyId, docId) => {
  if (db && isFirebaseConfigured) {
    await deleteDoc(doc(db, 'families', familyId, 'documents', docId));
  } else {
    const allFamilies = JSON.parse(localStorage.getItem('fv_sim_families') || '{}');
    if (allFamilies[familyId]) {
      allFamilies[familyId].documents = (allFamilies[familyId].documents || []).filter((d) => d.id !== docId);
      localStorage.setItem('fv_sim_families', JSON.stringify(allFamilies));
    }
  }
};

