import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase/config';

const AuthContext = createContext();

const DEMO_ACCOUNTS = {
  Owner: {
    uid: 'demo-mem-1',
    id: 'mem-1',
    name: 'Santhosh Sharma',
    displayName: 'Santhosh Sharma',
    email: 'santhosh@familyvault.io',
    emailVerified: true,
    role: 'Owner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    familyId: 'fam-8842',
    familyName: 'Sharma Family Vault'
  },
  Admin: {
    uid: 'demo-mem-2',
    id: 'mem-2',
    name: 'Priya Sharma',
    displayName: 'Priya Sharma',
    email: 'priya.s@gmail.com',
    emailVerified: true,
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    familyId: 'fam-8842',
    familyName: 'Sharma Family Vault'
  },
  Member: {
    uid: 'demo-mem-3',
    id: 'mem-3',
    name: 'Rajesh Sharma',
    displayName: 'Rajesh Sharma',
    email: 'rajesh.sharma@outlook.com',
    emailVerified: true,
    role: 'Member',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    familyId: 'fam-8842',
    familyName: 'Sharma Family Vault'
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  // Helper to format user object uniformly across Firebase and fallback modes
  const formatUser = (user, additionalData = {}) => {
    if (!user) return null;
    return {
      uid: user.uid,
      id: user.uid,
      email: user.email,
      name: user.displayName || additionalData.fullName || user.email?.split('@')[0] || 'Family Member',
      displayName: user.displayName || additionalData.fullName || user.email?.split('@')[0] || 'Family Member',
      avatar: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      emailVerified: user.emailVerified ?? false,
      role: additionalData.role || 'Owner',
      familyId: additionalData.familyId || 'fam-8842',
      familyName: additionalData.familyName || `${user.displayName || user.email?.split('@')[0]}'s Family Vault`,
      rawUser: user
    };
  };

  // Listen to Firebase auth state changes to persist login across page refreshes
  useEffect(() => {
    if (auth && isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const savedMeta = JSON.parse(localStorage.getItem(`fv_user_meta_${firebaseUser.uid}`) || '{}');
          setCurrentUser(formatUser(firebaseUser, savedMeta));
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Local mode when Firebase keys are not configured
      const saved = localStorage.getItem('fv_simulated_user');
      if (saved) {
        try {
          setCurrentUser(JSON.parse(saved));
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    }
  }, []);

  // Save simulated user changes
  useEffect(() => {
    if (!isFirebaseConfigured && currentUser) {
      localStorage.setItem('fv_simulated_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // 1. Email & Password Registration
  const register = async (email, password, fullName, familyName) => {
    if (auth && isFirebaseConfigured) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with user's full name
      if (fullName) {
        await updateProfile(user, { displayName: fullName });
      }

      // Send verification email
      await sendEmailVerification(user);
      setEmailVerificationSent(true);

      const metadata = {
        fullName,
        familyName: familyName || `${fullName}'s Family Vault`,
        role: 'Owner'
      };
      localStorage.setItem(`fv_user_meta_${user.uid}`, JSON.stringify(metadata));

      const formatted = formatUser(user, metadata);
      setCurrentUser(formatted);
      return formatted;
    } else {
      // Local simulated registration
      const mockUid = `usr-${Date.now()}`;
      const mockUser = {
        uid: mockUid,
        id: mockUid,
        name: fullName || 'New Member',
        displayName: fullName || 'New Member',
        email: email,
        emailVerified: false, // Starts unverified as per requirement
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'Owner',
        familyId: `fam-${Math.floor(1000 + Math.random() * 9000)}`,
        familyName: familyName || `${fullName}'s Family Vault`
      };
      setCurrentUser(mockUser);
      setEmailVerificationSent(true);
      return mockUser;
    }
  };

  // 2. Email & Password Login
  const login = async (email, password) => {
    if (auth && isFirebaseConfigured) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const savedMeta = JSON.parse(localStorage.getItem(`fv_user_meta_${user.uid}`) || '{}');
      const formatted = formatUser(user, savedMeta);
      setCurrentUser(formatted);
      return formatted;
    } else {
      // Local fallback login
      const matchedDemo = Object.values(DEMO_ACCOUNTS).find(
        (u) => u.email.toLowerCase() === (email || '').toLowerCase()
      );
      const user = matchedDemo || {
        uid: `usr-${Date.now()}`,
        id: `usr-${Date.now()}`,
        name: email.split('@')[0],
        displayName: email.split('@')[0],
        email: email,
        emailVerified: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'Owner',
        familyId: 'fam-8842',
        familyName: 'Sharma Family Vault'
      };
      setCurrentUser(user);
      return user;
    }
  };

  // 3. Google Authentication
  const loginWithGoogle = async () => {
    if (auth && googleProvider && isFirebaseConfigured) {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const savedMeta = JSON.parse(localStorage.getItem(`fv_user_meta_${user.uid}`) || '{}');
      const formatted = formatUser(user, savedMeta);
      setCurrentUser(formatted);
      return formatted;
    } else {
      // Local fallback Google login
      const googleUser = {
        uid: 'google-usr-8812',
        id: 'google-usr-8812',
        name: 'Santhosh Sharma (Google)',
        displayName: 'Santhosh Sharma',
        email: 'santhosh.google@familyvault.io',
        emailVerified: true, // Google accounts are verified
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'Owner',
        familyId: 'fam-8842',
        familyName: 'Sharma Family Vault'
      };
      setCurrentUser(googleUser);
      return googleUser;
    }
  };

  // 4. Logout
  const logout = async () => {
    if (auth && isFirebaseConfigured) {
      await signOut(auth);
    } else {
      localStorage.removeItem('fv_simulated_user');
    }
    setCurrentUser(null);
  };

  // 5. Password Reset
  const resetPassword = async (email) => {
    if (auth && isFirebaseConfigured) {
      await sendPasswordResetEmail(auth, email);
    }
    return true;
  };

  // 6. Resend Email Verification
  const resendVerificationEmail = async () => {
    if (auth?.currentUser && isFirebaseConfigured) {
      await sendEmailVerification(auth.currentUser);
      setEmailVerificationSent(true);
    } else {
      setEmailVerificationSent(true);
    }
    return true;
  };

  // 7. Reload / Check if user verified email
  const reloadUser = async () => {
    if (auth?.currentUser && isFirebaseConfigured) {
      await auth.currentUser.reload();
      const reloadedUser = auth.currentUser;
      const savedMeta = JSON.parse(localStorage.getItem(`fv_user_meta_${reloadedUser.uid}`) || '{}');
      const updated = formatUser(reloadedUser, savedMeta);
      setCurrentUser(updated);
      return updated.emailVerified;
    } else if (currentUser) {
      // In simulation mode, reload can mark verified
      const updated = { ...currentUser, emailVerified: true };
      setCurrentUser(updated);
      return true;
    }
    return false;
  };

  // 8. 1-Click Demo Persona Switcher (Owner, Admin, Member)
  const demoLogin = (role = 'Owner') => {
    const demo = DEMO_ACCOUNTS[role] || DEMO_ACCOUNTS.Owner;
    setCurrentUser(demo);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isFirebaseConfigured,
        emailVerificationSent,
        register,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
        resendVerificationEmail,
        reloadUser,
        demoLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
