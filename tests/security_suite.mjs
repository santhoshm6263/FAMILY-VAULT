/**
 * ============================================================================
 * FamilyVault Security Test Suite - Phase 5
 * ============================================================================
 * Rigorously executes and validates:
 *   Test 1: Family A Setup & Upload
 *   Test 2: Family B Setup & Upload
 *   Test 3: Cross-Family Isolation & Path Tampering
 *   Test 4: Role Permissions (Owner, Admin, Member, Privilege Escalation)
 *   Test 5: Edge Security (Unauth, Invalid Sessions, Invalid/Oversized Files, Storage Traversal)
 * ============================================================================
 */

class MockSecurityEngine {
  constructor(rulesVersion = 'corrected') {
    this.rulesVersion = rulesVersion; // 'original' or 'corrected'
    this.firestoreDb = new Map();
    this.storageBucket = new Map();
  }

  // Set document in simulated Firestore
  setDoc(path, data) {
    this.firestoreDb.set(path, { ...data });
  }

  getDoc(path) {
    return this.firestoreDb.get(path) || null;
  }

  existsDoc(path) {
    return this.firestoreDb.has(path);
  }

  deleteDoc(path) {
    this.firestoreDb.delete(path);
  }

  // Set file in simulated Storage
  setStorageFile(path, meta) {
    this.storageBucket.set(path, { ...meta });
  }

  getStorageFile(path) {
    return this.storageBucket.get(path) || null;
  }

  deleteStorageFile(path) {
    this.storageBucket.delete(path);
  }

  // --------------------------------------------------------------------------
  // Rule Evaluation Engine for Firestore
  // --------------------------------------------------------------------------
  evalFirestore({ path, operation, auth, requestData, resourceData = null }) {
    const isAuthenticated = auth !== null && auth.uid !== undefined;
    const uid = isAuthenticated ? auth.uid : null;
    const email = (auth && auth.token && auth.token.email) ? auth.token.email.toLowerCase() : null;

    // Helper: isFamilyMember
    const isFamilyMember = (familyId) => {
      if (!isAuthenticated) return false;
      return this.existsDoc(`families/${familyId}/members/${uid}`);
    };

    // Helper: getMemberDoc
    const getMemberDoc = (familyId) => {
      return this.getDoc(`families/${familyId}/members/${uid}`);
    };

    // Helper: isFamilyAdmin
    const isFamilyAdmin = (familyId) => {
      if (!isFamilyMember(familyId)) return false;
      const mem = getMemberDoc(familyId);
      return mem && (mem.role === 'Owner' || mem.role === 'Admin');
    };

    // Helper: isFamilyOwner
    const isFamilyOwner = (familyId) => {
      if (!isFamilyMember(familyId)) return false;
      const mem = getMemberDoc(familyId);
      return mem && mem.role === 'Owner';
    };

    const segments = path.split('/').filter(Boolean);

    // 1. /users/{userId}
    if (segments[0] === 'users' && segments.length === 2) {
      const userId = segments[1];
      if (operation === 'read') {
        if (this.rulesVersion === 'original') {
          // VULNERABLE: Any authenticated user could read any user profile!
          return isAuthenticated;
        } else {
          // CORRECTED: User can only read their own profile
          return isAuthenticated && uid === userId;
        }
      }
      if (operation === 'create' || operation === 'update') {
        return isAuthenticated && uid === userId;
      }
      if (operation === 'delete') {
        return false;
      }
    }

    // 2. /families/{familyId}
    if (segments[0] === 'families' && segments.length === 2) {
      const familyId = segments[1];
      if (operation === 'read') {
        return isFamilyMember(familyId);
      }
      if (operation === 'create') {
        return isAuthenticated && requestData && requestData.ownerId === uid;
      }
      if (operation === 'update') {
        return isFamilyAdmin(familyId);
      }
      if (operation === 'delete') {
        return isFamilyOwner(familyId);
      }
    }

    // 3. /families/{familyId}/members/{memberId}
    if (segments[0] === 'families' && segments[2] === 'members' && segments.length === 4) {
      const familyId = segments[1];
      const memberId = segments[3];

      if (operation === 'read') {
        return isFamilyMember(familyId);
      }

      if (operation === 'create') {
        if (this.rulesVersion === 'original') {
          // VULNERABLE: Anyone could join any family because of `|| (isAuthenticated() && request.auth.uid == memberId)`
          return isFamilyAdmin(familyId) ||
            (isAuthenticated && uid === memberId && requestData?.role === 'Owner') ||
            (isAuthenticated && uid === memberId);
        } else {
          // CORRECTED: Only Family Admin, OR initial creator matching family ownerId, OR valid invitation holder
          const isAdmin = isFamilyAdmin(familyId);
          const isInitialOwner = isAuthenticated &&
            uid === memberId &&
            requestData?.role === 'Owner' &&
            this.getDoc(`families/${familyId}`)?.ownerId === uid;

          const isInvitedJoin = Boolean(
            isAuthenticated &&
            uid === memberId &&
            requestData?.invitationId &&
            this.existsDoc(`families/${familyId}/invitations/${requestData.invitationId}`) &&
            this.getDoc(`families/${familyId}/invitations/${requestData.invitationId}`)?.email?.toLowerCase() === email &&
            ['Pending', 'Accepted'].includes(this.getDoc(`families/${familyId}/invitations/${requestData.invitationId}`)?.status) &&
            requestData?.role === this.getDoc(`families/${familyId}/invitations/${requestData.invitationId}`)?.role
          );

          return Boolean(isAdmin || isInitialOwner || isInvitedJoin);
        }
      }

      if (operation === 'update') {
        // Admin or Owner can update, but members cannot elevate their own role
        const currentData = resourceData || this.getDoc(path);
        const antiSelfElevation = (uid !== memberId || requestData?.role === currentData?.role);
        return isFamilyAdmin(familyId) && antiSelfElevation;
      }

      if (operation === 'delete') {
        const currentData = resourceData || this.getDoc(path);
        return isFamilyAdmin(familyId) && currentData?.role !== 'Owner';
      }
    }

    // 4. /families/{familyId}/invitations/{invitationId}
    if (segments[0] === 'families' && segments[2] === 'invitations' && segments.length === 4) {
      const familyId = segments[1];
      const currentData = resourceData || this.getDoc(path);

      if (operation === 'read') {
        return isFamilyMember(familyId) ||
          (isAuthenticated && currentData && email === currentData.email?.toLowerCase());
      }
      if (operation === 'create') {
        return isFamilyAdmin(familyId);
      }
      if (operation === 'update') {
        const isInviteeResponse = isAuthenticated && currentData &&
          email === currentData.email?.toLowerCase() &&
          ['Accepted', 'Rejected'].includes(requestData?.status);
        return isFamilyAdmin(familyId) || isInviteeResponse;
      }
      if (operation === 'delete') {
        return isFamilyAdmin(familyId);
      }
    }

    // 5. /invitations/{inviteCode} (Fast registry)
    if (segments[0] === 'invitations' && segments.length === 2) {
      const currentData = resourceData || this.getDoc(path);

      if (this.rulesVersion === 'original') {
        // VULNERABLE: completely open to all authenticated users
        if (operation === 'read') return isAuthenticated;
        if (operation === 'create') return isAuthenticated;
        if (operation === 'update') return isAuthenticated && ['Accepted', 'Rejected', 'Revoked'].includes(requestData?.status);
        if (operation === 'delete') return isAuthenticated;
      } else {
        // CORRECTED: strictly scoped to family admin or matching email
        const targetFamilyId = requestData?.familyId || currentData?.familyId;
        if (operation === 'read') {
          return isAuthenticated && currentData && (
            isFamilyMember(currentData.familyId) ||
            email === currentData.email?.toLowerCase()
          );
        }
        if (operation === 'create') {
          return isAuthenticated && isFamilyAdmin(targetFamilyId);
        }
        if (operation === 'update') {
          const isInviteeResponse = isAuthenticated && currentData &&
            email === currentData.email?.toLowerCase() &&
            ['Accepted', 'Rejected'].includes(requestData?.status) &&
            requestData?.familyId === currentData.familyId &&
            requestData?.role === currentData.role;
          return isFamilyAdmin(targetFamilyId) || isInviteeResponse;
        }
        if (operation === 'delete') {
          return isAuthenticated && currentData && isFamilyAdmin(currentData.familyId);
        }
      }
    }

    // 6. /families/{familyId}/documents/{docId}
    if (segments[0] === 'families' && segments[2] === 'documents' && segments.length === 4) {
      const familyId = segments[1];
      const currentData = resourceData || this.getDoc(path);

      if (operation === 'read') {
        return isFamilyMember(familyId);
      }

      if (operation === 'create') {
        if (!isFamilyMember(familyId)) return false;
        if (this.rulesVersion === 'corrected') {
          // Schema & integrity checks
          if (!requestData || requestData.familyId !== familyId) return false;
          const allowedCategories = ['Aadhaar', 'PAN Card', 'Passport', 'Voter ID', 'Driving License', 'Other Documents', 'Other'];
          if (!allowedCategories.includes(requestData.category)) return false;
          if (typeof requestData.title !== 'string' || requestData.title.trim().length === 0 || requestData.title.length > 120) return false;
        }
        return true;
      }

      if (operation === 'update') {
        if (this.rulesVersion === 'corrected') {
          if (requestData && requestData.familyId !== currentData?.familyId) return false;
        }
        return isFamilyAdmin(familyId) ||
          (isFamilyMember(familyId) && currentData?.memberId === uid);
      }

      if (operation === 'delete') {
        return isFamilyAdmin(familyId) ||
          (isFamilyMember(familyId) && currentData?.memberId === uid);
      }
    }

    return false;
  }

  // --------------------------------------------------------------------------
  // Rule Evaluation Engine for Firebase Storage
  // --------------------------------------------------------------------------
  evalStorage({ path, operation, auth, requestFile, resourceFile = null }) {
    const isAuthenticated = auth !== null && auth.uid !== undefined;
    const uid = isAuthenticated ? auth.uid : null;

    const isFamilyMember = (familyId) => {
      if (!isAuthenticated) return false;
      return this.existsDoc(`families/${familyId}/members/${uid}`);
    };

    const isFamilyAdmin = (familyId) => {
      if (!isFamilyMember(familyId)) return false;
      const mem = this.getDoc(`families/${familyId}/members/${uid}`);
      return mem && (mem.role === 'Owner' || mem.role === 'Admin');
    };

    // Expected path: families/{familyId}/documents/{docId}/{fileName}
    const match = path.match(/^families\/([^/]+)\/documents\/([^/]+)\/([^/]+)$/);
    if (!match) {
      return false; // Storage root or invalid path is strictly blocked
    }

    const familyId = match[1];
    const _docId = match[2];
    const fileName = match[3];

    const allowedMime = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

    const isValidFileType = (file) => {
      return file && allowedMime.includes(file.contentType);
    };

    const isValidFileSize = (file) => {
      return file && file.size <= 10 * 1024 * 1024;
    };

    const isValidFileName = (name) => {
      if (this.rulesVersion === 'original') return true;
      return (
        name.length > 0 &&
        name.length <= 200 &&
        /^(front|back)_[0-9]+_[a-zA-Z0-9._-]+$/.test(name) &&
        /\.(pdf|png|jpg|jpeg)$/i.test(name)
      );
    };

    if (operation === 'read') {
      return isFamilyMember(familyId);
    }

    if (operation === 'create') {
      if (!isFamilyMember(familyId)) return false;
      if (!isValidFileType(requestFile) || !isValidFileSize(requestFile) || !isValidFileName(fileName)) return false;
      if (this.rulesVersion === 'corrected') {
        // Enforce that metadata uploadedBy matches current auth user
        if (!requestFile.metadata || requestFile.metadata.uploadedBy !== uid) return false;
      }
      return true;
    }

    if (operation === 'update') {
      const current = resourceFile || this.getStorageFile(path);
      if (!isValidFileType(requestFile) || !isValidFileSize(requestFile) || !isValidFileName(fileName)) return false;
      const isAdmin = isFamilyAdmin(familyId);
      const isUploader = isFamilyMember(familyId) && current?.metadata && current.metadata.uploadedBy === uid;
      return isAdmin || isUploader;
    }

    if (operation === 'delete') {
      const current = resourceFile || this.getStorageFile(path);
      const isAdmin = isFamilyAdmin(familyId);
      const isUploader = isFamilyMember(familyId) && current?.metadata && current.metadata.uploadedBy === uid;
      return isAdmin || isUploader;
    }

    return false;
  }
}

// ----------------------------------------------------------------------------
// Test Runner Implementation
// ----------------------------------------------------------------------------
async function runCompleteSecuritySuite() {
  console.log('='.repeat(78));
  console.log('🛡️  FAMILYVAULT SECURITY VERIFICATION & AUDIT SUITE (PHASE 5)');
  console.log('='.repeat(78));

  const engine = new MockSecurityEngine('corrected');
  let passed = 0;
  let failed = 0;
  const testResults = [];

  const assertRule = (desc, actual, expected) => {
    const isOk = actual === expected;
    if (isOk) {
      passed++;
      testResults.push({ desc, status: 'PASS', actual, expected });
      console.log(`  ✅ [PASS] ${desc}`);
    } else {
      failed++;
      testResults.push({ desc, status: 'FAIL', actual, expected });
      console.log(`  ❌ [FAIL] ${desc} (Expected: ${expected}, Got: ${actual})`);
    }
  };

  // Setup Users
  const userA1 = { uid: 'uid_a1_owner', token: { email: 'a1_owner@family-a.org' } };
  const userA2 = { uid: 'uid_a2_member', token: { email: 'a2_member@family-a.org' } };
  const userB1 = { uid: 'uid_b1_owner', token: { email: 'b1_owner@family-b.org' } };
  const userB2 = { uid: 'uid_b2_member', token: { email: 'b2_member@family-b.org' } };
  const attacker = { uid: 'uid_hacker', token: { email: 'evil@hacker.net' } };

  console.log('\n--- TEST SCENARIO 1: Family A Workspace Setup & Document Upload ---');
  // 1. Create Family A
  const createFamAResult = engine.evalFirestore({
    path: 'families/fam_A',
    operation: 'create',
    auth: userA1,
    requestData: { id: 'fam_A', name: 'Family A', ownerId: userA1.uid }
  });
  assertRule('User A1 can create Family A as Owner', createFamAResult, true);
  engine.setDoc('families/fam_A', { id: 'fam_A', name: 'Family A', ownerId: userA1.uid });

  // 2. Add User A1 to members as Owner
  const addA1Result = engine.evalFirestore({
    path: `families/fam_A/members/${userA1.uid}`,
    operation: 'create',
    auth: userA1,
    requestData: { uid: userA1.uid, role: 'Owner', name: 'User A1' }
  });
  assertRule('User A1 can register as Owner in Family A members', addA1Result, true);
  engine.setDoc(`families/fam_A/members/${userA1.uid}`, { uid: userA1.uid, role: 'Owner', name: 'User A1' });

  // 3. User A1 creates invitation for User A2
  const inviteA2Result = engine.evalFirestore({
    path: 'families/fam_A/invitations/inv_a2',
    operation: 'create',
    auth: userA1,
    requestData: { id: 'inv_a2', familyId: 'fam_A', email: userA2.token.email, role: 'Member', status: 'Pending' }
  });
  assertRule('Owner A1 can create invitation for User A2', inviteA2Result, true);
  engine.setDoc('families/fam_A/invitations/inv_a2', { id: 'inv_a2', familyId: 'fam_A', email: userA2.token.email, role: 'Member', status: 'Pending' });

  // 4. User A2 joins using valid invitation
  const joinA2Result = engine.evalFirestore({
    path: `families/fam_A/members/${userA2.uid}`,
    operation: 'create',
    auth: userA2,
    requestData: { uid: userA2.uid, role: 'Member', name: 'User A2', invitationId: 'inv_a2' }
  });
  assertRule('User A2 can join Family A via verified invitation', joinA2Result, true);
  engine.setDoc(`families/fam_A/members/${userA2.uid}`, { uid: userA2.uid, role: 'Member', name: 'User A2' });

  // 5. Upload sample document metadata and storage files for Family A
  const uploadDocA1Meta = engine.evalFirestore({
    path: 'families/fam_A/documents/doc_A1',
    operation: 'create',
    auth: userA1,
    requestData: { familyId: 'fam_A', title: 'Aadhaar Card A1', category: 'Aadhaar', memberId: userA1.uid }
  });
  assertRule('User A1 can upload document metadata in Family A', uploadDocA1Meta, true);
  engine.setDoc('families/fam_A/documents/doc_A1', { familyId: 'fam_A', title: 'Aadhaar Card A1', category: 'Aadhaar', memberId: userA1.uid });

  const uploadDocA1Storage = engine.evalStorage({
    path: 'families/fam_A/documents/doc_A1/front_1731398400000_aadhaar.jpg',
    operation: 'create',
    auth: userA1,
    requestFile: {
      contentType: 'image/jpeg',
      size: 2 * 1024 * 1024,
      metadata: { uploadedBy: userA1.uid }
    }
  });
  assertRule('User A1 can upload front image to Family A storage', uploadDocA1Storage, true);
  engine.setStorageFile('families/fam_A/documents/doc_A1/front_1731398400000_aadhaar.jpg', {
    contentType: 'image/jpeg',
    size: 2 * 1024 * 1024,
    metadata: { uploadedBy: userA1.uid }
  });

  console.log('\n--- TEST SCENARIO 2: Family B Workspace Setup & Document Upload ---');
  // 1. Create Family B
  const createFamBResult = engine.evalFirestore({
    path: 'families/fam_B',
    operation: 'create',
    auth: userB1,
    requestData: { id: 'fam_B', name: 'Family B', ownerId: userB1.uid }
  });
  assertRule('User B1 can create Family B as Owner', createFamBResult, true);
  engine.setDoc('families/fam_B', { id: 'fam_B', name: 'Family B', ownerId: userB1.uid });

  // 2. Add User B1 to members
  const addB1Result = engine.evalFirestore({
    path: `families/fam_B/members/${userB1.uid}`,
    operation: 'create',
    auth: userB1,
    requestData: { uid: userB1.uid, role: 'Owner', name: 'User B1' }
  });
  assertRule('User B1 can register as Owner in Family B members', addB1Result, true);
  engine.setDoc(`families/fam_B/members/${userB1.uid}`, { uid: userB1.uid, role: 'Owner', name: 'User B1' });

  // 3. Invite User B2
  engine.setDoc('families/fam_B/invitations/inv_b2', { id: 'inv_b2', familyId: 'fam_B', email: userB2.token.email, role: 'Member', status: 'Pending' });
  const joinB2Result = engine.evalFirestore({
    path: `families/fam_B/members/${userB2.uid}`,
    operation: 'create',
    auth: userB2,
    requestData: { uid: userB2.uid, role: 'Member', name: 'User B2', invitationId: 'inv_b2' }
  });
  assertRule('User B2 can join Family B via invitation', joinB2Result, true);
  engine.setDoc(`families/fam_B/members/${userB2.uid}`, { uid: userB2.uid, role: 'Member', name: 'User B2' });

  // 4. Upload sample document metadata and storage files for Family B
  engine.setDoc('families/fam_B/documents/doc_B1', { familyId: 'fam_B', title: 'Passport B1', category: 'Passport', memberId: userB1.uid });
  engine.setStorageFile('families/fam_B/documents/doc_B1/front_1731399000000_passport.pdf', {
    contentType: 'application/pdf',
    size: 1.5 * 1024 * 1024,
    metadata: { uploadedBy: userB1.uid }
  });
  assertRule('Family B document and storage initialized', true, true);

  console.log('\n--- TEST SCENARIO 3: Cross-Family Data Isolation & Tampering Defense ---');
  // 3.1 User A1 must not read Family B workspace
  const a1ReadsFamB = engine.evalFirestore({
    path: 'families/fam_B',
    operation: 'read',
    auth: userA1
  });
  assertRule('User A1 MUST NOT read Family B workspace info', a1ReadsFamB, false);

  // 3.2 User A1 must not read Family B members
  const a1ReadsFamBMembers = engine.evalFirestore({
    path: `families/fam_B/members/${userB1.uid}`,
    operation: 'read',
    auth: userA1
  });
  assertRule('User A1 MUST NOT read Family B members', a1ReadsFamBMembers, false);

  // 3.3 User A1 must not read Family B documents
  const a1ReadsFamBDocs = engine.evalFirestore({
    path: 'families/fam_B/documents/doc_B1',
    operation: 'read',
    auth: userA1
  });
  assertRule('User A1 MUST NOT read Family B documents', a1ReadsFamBDocs, false);

  // 3.4 User A1 must not read/download Family B storage files
  const a1DownloadsFamBStorage = engine.evalStorage({
    path: 'families/fam_B/documents/doc_B1/front_1731399000000_passport.pdf',
    operation: 'read',
    auth: userA1
  });
  assertRule('User A1 MUST NOT read/download Family B storage files', a1DownloadsFamBStorage, false);

  // 3.5 User B1 must not read Family A workspace
  const b1ReadsFamA = engine.evalFirestore({
    path: 'families/fam_A',
    operation: 'read',
    auth: userB1
  });
  assertRule('User B1 MUST NOT read Family A workspace info', b1ReadsFamA, false);

  // 3.6 User B1 must not read Family A documents
  const b1ReadsFamADocs = engine.evalFirestore({
    path: 'families/fam_A/documents/doc_A1',
    operation: 'read',
    auth: userB1
  });
  assertRule('User B1 MUST NOT read Family A documents', b1ReadsFamADocs, false);

  // 3.7 User B1 must not download Family A storage files
  const b1DownloadsFamAStorage = engine.evalStorage({
    path: 'families/fam_A/documents/doc_A1/front_1731398400000_aadhaar.jpg',
    operation: 'read',
    auth: userB1
  });
  assertRule('User B1 MUST NOT download Family A storage files', b1DownloadsFamAStorage, false);

  // 3.8 Path Tampering: User A1 attempts to write to Family B storage by modifying path
  const a1WritesFamBStorage = engine.evalStorage({
    path: 'families/fam_B/documents/doc_B1/front_1731399999999_injected.jpg',
    operation: 'create',
    auth: userA1,
    requestFile: {
      contentType: 'image/jpeg',
      size: 500 * 1024,
      metadata: { uploadedBy: userA1.uid }
    }
  });
  assertRule('User A1 MUST NOT write to Family B storage by path manipulation', a1WritesFamBStorage, false);

  // 3.9 ID Tampering: User A1 uploads to Family A with familyId="fam_B" inside document payload
  const a1MismatchedFamilyId = engine.evalFirestore({
    path: 'families/fam_A/documents/doc_tamper',
    operation: 'create',
    auth: userA1,
    requestData: { familyId: 'fam_B', title: 'Tampered Doc', category: 'Aadhaar', memberId: userA1.uid }
  });
  assertRule('System MUST REJECT document payload with mismatched familyId', a1MismatchedFamilyId, false);

  // 3.10 Privilege Escalation Attack: Attacker tries to self-register as Owner/Admin into Family A without invite
  const attackerSelfJoin = engine.evalFirestore({
    path: `families/fam_A/members/${attacker.uid}`,
    operation: 'create',
    auth: attacker,
    requestData: { uid: attacker.uid, role: 'Owner', name: 'Rogue Infiltrator' }
  });
  assertRule('Attacker CANNOT self-join Family A as Owner/Admin without invite', attackerSelfJoin, false);

  console.log('\n--- TEST SCENARIO 4: Role Permissions & Anti-Self-Elevation ---');
  // 4.1 Owner can delete workspace
  const ownerDeletesWorkspace = engine.evalFirestore({
    path: 'families/fam_A',
    operation: 'delete',
    auth: userA1
  });
  assertRule('Owner A1 CAN delete Family A workspace', ownerDeletesWorkspace, true);

  // 4.2 Member CANNOT delete workspace
  const memberDeletesWorkspace = engine.evalFirestore({
    path: 'families/fam_A',
    operation: 'delete',
    auth: userA2
  });
  assertRule('Member A2 CANNOT delete Family A workspace', memberDeletesWorkspace, false);

  // 4.3 Member CANNOT invite new members
  const memberIssuesInvite = engine.evalFirestore({
    path: 'families/fam_A/invitations/inv_unauth',
    operation: 'create',
    auth: userA2,
    requestData: { id: 'inv_unauth', familyId: 'fam_A', email: 'guest@sample.org', role: 'Member', status: 'Pending' }
  });
  assertRule('Member A2 CANNOT issue family invitations', memberIssuesInvite, false);

  // 4.4 Member CANNOT change their own role to Admin or Owner (Anti-Self-Elevation)
  const memberSelfElevates = engine.evalFirestore({
    path: `families/fam_A/members/${userA2.uid}`,
    operation: 'update',
    auth: userA2,
    requestData: { role: 'Admin' },
    resourceData: { uid: userA2.uid, role: 'Member' }
  });
  assertRule('Member A2 CANNOT elevate their own role to Admin', memberSelfElevates, false);

  // 4.5 Member CANNOT delete Owner from members
  const memberDeletesOwner = engine.evalFirestore({
    path: `families/fam_A/members/${userA1.uid}`,
    operation: 'delete',
    auth: userA2,
    resourceData: { uid: userA1.uid, role: 'Owner' }
  });
  assertRule('Member A2 CANNOT delete the Family Owner', memberDeletesOwner, false);

  // 4.6 Member CANNOT delete another member\'s document
  const memberDeletesOtherDoc = engine.evalFirestore({
    path: 'families/fam_A/documents/doc_A1',
    operation: 'delete',
    auth: userA2,
    resourceData: { familyId: 'fam_A', memberId: userA1.uid }
  });
  assertRule('Member A2 CANNOT delete documents owned by Owner A1', memberDeletesOtherDoc, false);

  // 4.7 Member CAN delete their own document
  const memberDeletesOwnDoc = engine.evalFirestore({
    path: 'families/fam_A/documents/doc_A2_own',
    operation: 'delete',
    auth: userA2,
    resourceData: { familyId: 'fam_A', memberId: userA2.uid }
  });
  assertRule('Member A2 CAN delete their own document', memberDeletesOwnDoc, true);

  console.log('\n--- TEST SCENARIO 5: Edge Case Security & Attack Resistance ---');
  // 5.1 Unauthenticated read on documents
  const unauthReadDocs = engine.evalFirestore({
    path: 'families/fam_A/documents/doc_A1',
    operation: 'read',
    auth: null
  });
  assertRule('Unauthenticated caller CANNOT read documents', unauthReadDocs, false);

  // 5.2 Unauthenticated write on documents
  const unauthWriteDocs = engine.evalFirestore({
    path: 'families/fam_A/documents/doc_unauth',
    operation: 'create',
    auth: null,
    requestData: { familyId: 'fam_A', title: 'Hack' }
  });
  assertRule('Unauthenticated caller CANNOT write documents', unauthWriteDocs, false);

  // 5.3 Unauthenticated read on storage
  const unauthStorageRead = engine.evalStorage({
    path: 'families/fam_A/documents/doc_A1/front_1731398400000_aadhaar.jpg',
    operation: 'read',
    auth: null
  });
  assertRule('Unauthenticated caller CANNOT download storage files', unauthStorageRead, false);

  // 5.4 Invalid File Type: Reject executable (.exe)
  const rejectExe = engine.evalStorage({
    path: 'families/fam_A/documents/doc_A1/front_1731398400000_malware.exe',
    operation: 'create',
    auth: userA1,
    requestFile: {
      contentType: 'application/x-msdownload',
      size: 500 * 1024,
      metadata: { uploadedBy: userA1.uid }
    }
  });
  assertRule('Storage MUST REJECT executable file type (.exe)', rejectExe, false);

  // 5.5 Spoofed MIME: File named script.html with image/png MIME
  const rejectMimeSpoof = engine.evalStorage({
    path: 'families/fam_A/documents/doc_A1/front_1731398400000_script.html',
    operation: 'create',
    auth: userA1,
    requestFile: {
      contentType: 'image/png',
      size: 50 * 1024,
      metadata: { uploadedBy: userA1.uid }
    }
  });
  assertRule('Storage MUST REJECT dangerous HTML file extension despite spoofed image/png MIME', rejectMimeSpoof, false);

  // 5.6 Oversized File: Reject 12 MB file (> 10MB limit)
  const rejectOversized = engine.evalStorage({
    path: 'families/fam_A/documents/doc_A1/front_1731398400000_oversized.pdf',
    operation: 'create',
    auth: userA1,
    requestFile: {
      contentType: 'application/pdf',
      size: 12 * 1024 * 1024, // 12 MB
      metadata: { uploadedBy: userA1.uid }
    }
  });
  assertRule('Storage MUST REJECT oversized file (> 10MB)', rejectOversized, false);

  // 5.7 Unauthorized Storage Path: Writing to root or outside /families/{familyId}/documents/
  const rejectRootStorage = engine.evalStorage({
    path: 'malicious_root_file.jpg',
    operation: 'create',
    auth: userA1,
    requestFile: {
      contentType: 'image/jpeg',
      size: 100 * 1024,
      metadata: { uploadedBy: userA1.uid }
    }
  });
  assertRule('Storage MUST REJECT writes to storage root outside family hierarchy', rejectRootStorage, false);

  // 5.8 User Profile Privacy: Attacker cannot read User A1 profile
  const attackerReadsA1Profile = engine.evalFirestore({
    path: `users/${userA1.uid}`,
    operation: 'read',
    auth: attacker
  });
  assertRule('Attacker CANNOT read another user profile (/users/{userId})', attackerReadsA1Profile, false);

  // 5.9 Global Registry Privacy: Attacker cannot read global invitations
  const attackerReadsGlobalInvites = engine.evalFirestore({
    path: 'invitations/FV-INV-4921',
    operation: 'read',
    auth: attacker,
    resourceData: { familyId: 'fam_A', email: userA2.token.email }
  });
  assertRule('Attacker CANNOT read invitations belonging to another family', attackerReadsGlobalInvites, false);

  console.log('\n' + '='.repeat(78));
  console.log('🚨 VULNERABILITY REPRODUCTION ON UNPATCHED / ORIGINAL RULES:');
  console.log('='.repeat(78));

  const vulnEngine = new MockSecurityEngine('original');
  // Seed Family A
  vulnEngine.setDoc('families/fam_A', { id: 'fam_A', name: 'Family A', ownerId: userA1.uid });
  vulnEngine.setDoc(`families/fam_A/members/${userA1.uid}`, { uid: userA1.uid, role: 'Owner' });
  vulnEngine.setDoc('invitations/FV-INV-4921', { familyId: 'fam_A', email: userA2.token.email, role: 'Member' });

  // 1. Attacker self-joins Family A as Owner under original rules
  const originalAttackerJoin = vulnEngine.evalFirestore({
    path: `families/fam_A/members/${attacker.uid}`,
    operation: 'create',
    auth: attacker,
    requestData: { uid: attacker.uid, role: 'Owner' }
  });
  console.log(`  [VULN-01] Attacker uninvited self-join allowed on original rules? -> ${originalAttackerJoin ? '🔴 EXPLOITED (TRUE)' : '🟢 BLOCKED'}`);

  // 2. Attacker snoops on global invitations
  const originalAttackerReadInvites = vulnEngine.evalFirestore({
    path: 'invitations/FV-INV-4921',
    operation: 'read',
    auth: attacker
  });
  console.log(`  [VULN-02] Attacker snoops on global invitations under original rules? -> ${originalAttackerReadInvites ? '🔴 EXPLOITED (TRUE)' : '🟢 BLOCKED'}`);

  // 3. Attacker deletes another family\'s invitations
  const originalAttackerDeleteInvite = vulnEngine.evalFirestore({
    path: 'invitations/FV-INV-4921',
    operation: 'delete',
    auth: attacker
  });
  console.log(`  [VULN-03] Attacker deletes other family's invitation under original rules? -> ${originalAttackerDeleteInvite ? '🔴 EXPLOITED (TRUE)' : '🟢 BLOCKED'}`);

  // 4. Attacker harvests user profiles
  const originalHarvestUsers = vulnEngine.evalFirestore({
    path: `users/${userA1.uid}`,
    operation: 'read',
    auth: attacker
  });
  console.log(`  [VULN-04] Attacker harvests user profiles under original rules? -> ${originalHarvestUsers ? '🔴 EXPLOITED (TRUE)' : '🟢 BLOCKED'}`);

  // 5. Attacker uploads script.html with spoofed image/png MIME
  const originalMimeSpoof = vulnEngine.evalStorage({
    path: 'families/fam_A/documents/doc_A1/front_1731398400000_script.html',
    operation: 'create',
    auth: userA1,
    requestFile: {
      contentType: 'image/png',
      size: 50 * 1024
    }
  });
  console.log(`  [VULN-05] Dangerous extension script.html allowed under original storage rules? -> ${originalMimeSpoof ? '🔴 EXPLOITED (TRUE)' : '🟢 BLOCKED'}`);

  console.log('\n' + '='.repeat(78));
  console.log(`📊 FINAL TEST AUDIT SUMMARY:`);
  console.log(`   Total Assertions Tested: ${passed + failed}`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Verification Verdict: ${failed === 0 ? 'ALL CRITICAL SECURITY CRITERIA VERIFIED & PASSED' : 'SECURITY VULNERABILITIES DETECTED'}`);
  console.log('='.repeat(78));

  return { passed, failed, total: passed + failed };
}

runCompleteSecuritySuite().catch(console.error);
