import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  syncUserProfile,
  createFamilyWorkspace,
  fetchUserFamilies,
  subscribeFamilyMembers,
  sendFamilyInvitation,
  acceptFamilyInvitation,
  rejectFamilyInvitation,
  updateMemberRoleInFirestore,
  removeMemberFromFirestore,
  addDependentMemberToFirestore,
  subscribeFamilyDocuments,
  addDocumentToFirestore,
  updateDocumentInFirestore,
  deleteDocumentFromFirestore
} from '../firebase/firestoreService';
import { INITIAL_MEMBERS, INITIAL_INVITES, INITIAL_FAMILY_PROFILE } from '../data/initialMembers';
import { INITIAL_DOCUMENTS } from '../data/initialDocuments';

const VaultContext = createContext();

export const VaultProvider = ({ children }) => {
  const { currentUser } = useAuth();

  // Multi-family state
  const [userFamilies, setUserFamilies] = useState([]);
  const [currentFamilyId, setCurrentFamilyId] = useState(() => {
    return localStorage.getItem('fv_current_family_id') || 'fam-8842';
  });

  const [familyProfile, setFamilyProfile] = useState(() => {
    const saved = localStorage.getItem('fv_family_profile');
    return saved ? JSON.parse(saved) : INITIAL_FAMILY_PROFILE;
  });

  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('fv_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [invites, setInvites] = useState(() => {
    const saved = localStorage.getItem('fv_invites');
    return saved ? JSON.parse(saved) : INITIAL_INVITES;
  });

  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('fv_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [toasts, setToasts] = useState([]);
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);

  // Sync current user's profile and families when currentUser changes
  useEffect(() => {
    const initUserData = async () => {
      if (!currentUser?.uid) return;

      try {
        await syncUserProfile(currentUser, { familyId: currentFamilyId });
        const families = await fetchUserFamilies(currentUser);
        setUserFamilies(families);

        // If currentFamilyId is not in user's families, switch to first family
        if (families.length > 0 && !families.some((f) => f.id === currentFamilyId)) {
          switchFamily(families[0].id);
        }
      } catch (err) {
        console.warn('Error syncing user families:', err);
      }
    };

    initUserData();
  }, [currentUser?.uid]);

  // Subscribe to members & documents of the active family workspace
  useEffect(() => {
    if (!currentFamilyId) return;

    localStorage.setItem('fv_current_family_id', currentFamilyId);

    // Update family profile from userFamilies list
    const matchedFamily = userFamilies.find((f) => f.id === currentFamilyId);
    if (matchedFamily) {
      setFamilyProfile(matchedFamily);
    }

    // Subscribe to members
    const unsubscribeMembers = subscribeFamilyMembers(currentFamilyId, (newMembers) => {
      if (newMembers && newMembers.length > 0) {
        setMembers(newMembers);
      }
    });

    // Subscribe to documents
    const unsubscribeDocs = subscribeFamilyDocuments(currentFamilyId, (newDocs) => {
      if (newDocs) {
        setDocuments(newDocs);
      }
    });

    return () => {
      unsubscribeMembers();
      unsubscribeDocs();
    };
  }, [currentFamilyId, userFamilies]);

  // Determine current user's active role in this family
  const currentMemberRecord = members.find(
    (m) => (m.uid && m.uid === currentUser?.uid) || (m.email && m.email.toLowerCase() === currentUser?.email?.toLowerCase())
  );
  const currentUserRole = currentMemberRecord?.role || (familyProfile.ownerId === currentUser?.uid ? 'Owner' : 'Owner');
  const isOwner = currentUserRole === 'Owner';
  const isAdmin = currentUserRole === 'Owner' || currentUserRole === 'Admin';

  // Toast System
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Switch Family Workspace
  const switchFamily = async (familyId) => {
    if (familyId === currentFamilyId) return;
    setLoadingWorkspace(true);
    setCurrentFamilyId(familyId);
    localStorage.setItem('fv_current_family_id', familyId);

    const targetFam = userFamilies.find((f) => f.id === familyId);
    if (targetFam) {
      setFamilyProfile(targetFam);
      showToast(`Switched workspace to "${targetFam.name}"`, 'info');
    }
    setTimeout(() => setLoadingWorkspace(false), 300);
  };

  // 2. Create New Family Workspace
  const createNewFamily = async (familyName) => {
    if (!currentUser) throw new Error('Authentication required');
    try {
      const newFam = await createFamilyWorkspace(currentUser, familyName);
      setUserFamilies((prev) => [...prev, newFam]);
      setCurrentFamilyId(newFam.id);
      setFamilyProfile(newFam);
      showToast(`Family workspace "${familyName}" created!`, 'success');
      return newFam;
    } catch (err) {
      showToast(err.message || 'Error creating family workspace', 'error');
      throw err;
    }
  };

  // 3. Send Family Invitation
  const sendInvite = async (inviteData) => {
    if (!isAdmin) {
      showToast('Only Owners and Admins can send invitations', 'error');
      return null;
    }

    try {
      const invite = await sendFamilyInvitation(
        currentFamilyId,
        familyProfile.name,
        inviteData,
        currentUser
      );
      setInvites((prev) => [invite, ...prev]);
      showToast(`Invitation sent to ${invite.email}`, 'success');
      return invite;
    } catch (err) {
      showToast(err.message || 'Error sending invitation', 'error');
      throw err;
    }
  };

  // 4. Accept Invitation by Code
  const acceptInvite = async (inviteCode) => {
    if (!currentUser) throw new Error('Please sign in to accept an invitation');
    try {
      const result = await acceptFamilyInvitation(inviteCode, currentUser);
      showToast(`Joined "${result.familyName}" successfully!`, 'success');

      // Refresh families
      const families = await fetchUserFamilies(currentUser);
      setUserFamilies(families);
      switchFamily(result.familyId);
      return result;
    } catch (err) {
      showToast(err.message || 'Error accepting invitation', 'error');
      throw err;
    }
  };

  // 5. Reject Invitation by Code
  const rejectInvite = async (inviteCode) => {
    try {
      await rejectFamilyInvitation(inviteCode, currentUser);
      showToast('Invitation declined', 'info');
      setInvites((prev) => prev.filter((i) => i.inviteCode !== inviteCode));
    } catch (err) {
      showToast(err.message || 'Error rejecting invitation', 'error');
    }
  };

  // 6. Member Management
  const addMember = async (dependentData) => {
    if (!isAdmin) {
      showToast('Only Owners and Admins can add dependents', 'error');
      return null;
    }

    try {
      const newMember = await addDependentMemberToFirestore(currentFamilyId, dependentData);
      setMembers((prev) => [...prev, newMember]);
      showToast(`Dependent "${newMember.name}" added`, 'success');
      return newMember;
    } catch (err) {
      showToast(err.message || 'Error adding member', 'error');
    }
  };

  const updateMemberRole = async (memberId, newRole) => {
    if (!isAdmin) {
      showToast('Permission denied: Admin rights required', 'error');
      return;
    }

    // Security: Prevent user from changing their own role!
    if (memberId === currentUser?.uid) {
      showToast('Security Alert: You cannot alter your own role', 'error');
      return;
    }

    try {
      await updateMemberRoleInFirestore(currentFamilyId, memberId, newRole);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
      showToast(`Role updated to ${newRole}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update role', 'error');
    }
  };

  const removeMember = async (memberId) => {
    if (!isAdmin) {
      showToast('Permission denied: Admin rights required', 'error');
      return false;
    }

    const target = members.find((m) => m.id === memberId);
    if (target?.role === 'Owner') {
      showToast('Cannot remove the Family Vault Owner', 'error');
      return false;
    }

    try {
      await removeMemberFromFirestore(currentFamilyId, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      showToast('Member removed from family vault', 'info');
      return true;
    } catch (err) {
      showToast(err.message || 'Failed to remove member', 'error');
      return false;
    }
  };

  // 7. Document Operations
  const addDocument = async (newDoc) => {
    try {
      const added = await addDocumentToFirestore(currentFamilyId, newDoc);
      setDocuments((prev) => [added, ...prev]);

      // Increment member document count
      if (newDoc.memberId) {
        setMembers((prev) =>
          prev.map((m) => (m.id === newDoc.memberId ? { ...m, documentsCount: (m.documentsCount || 0) + 1 } : m))
        );
      }
      showToast(`Document "${newDoc.title}" encrypted and saved`, 'success');
      return added;
    } catch (err) {
      showToast(err.message || 'Error saving document', 'error');
    }
  };

  const updateDocument = async (docId, updatedFields) => {
    try {
      await updateDocumentInFirestore(currentFamilyId, docId, updatedFields);
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, ...updatedFields } : d))
      );
      showToast('Document details updated', 'success');
    } catch (err) {
      showToast(err.message || 'Error updating document', 'error');
    }
  };

  const deleteDocument = async (docId) => {
    try {
      await deleteDocumentFromFirestore(currentFamilyId, docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      showToast('Document securely deleted', 'info');
    } catch (err) {
      showToast(err.message || 'Error deleting document', 'error');
    }
  };

  const updateFamilyProfile = (data) => {
    setFamilyProfile((prev) => ({ ...prev, ...data }));
    setUserFamilies((prev) =>
      prev.map((f) => (f.id === currentFamilyId ? { ...f, ...data } : f))
    );
    showToast('Family Vault details updated', 'success');
  };

  // Reset to sample initial data helper
  const resetToSampleData = () => {
    setDocuments(INITIAL_DOCUMENTS);
    setMembers(INITIAL_MEMBERS);
    setInvites(INITIAL_INVITES);
    setFamilyProfile(INITIAL_FAMILY_PROFILE);
    showToast('Reset vault to initial data', 'info');
  };

  return (
    <VaultContext.Provider
      value={{
        currentFamilyId,
        userFamilies,
        familyProfile,
        members,
        invites,
        documents,
        currentUserRole,
        isOwner,
        isAdmin,
        loadingWorkspace,
        toasts,
        showToast,
        removeToast,
        switchFamily,
        createNewFamily,
        sendInvite,
        acceptInvite,
        rejectInvite,
        addMember,
        updateMemberRole,
        removeMember,
        addDocument,
        updateDocument,
        deleteDocument,
        updateFamilyProfile,
        resetToSampleData
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};
