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

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  // Helper to format user object uniformly across Firebase and fallback modes
  const formatUser = (user, additionalData = {}) => {
    if (!user) return null;
    const defaultName = user.displayName || additionalData.fullName || user.email?.split('@')[0] || 'Family Member';
    return {
      uid: user.uid,
      id: user.uid,
      email: user.email,
      name: defaultName,
      displayName: defaultName,
      avatar: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      emailVerified: user.emailVerified ?? false,
      role: additionalData.role || 'Owner',
      familyId: additionalData.familyId || null,
      familyName: additionalData.familyName || `${defaultName}'s Family Vault`,
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
      // Local mode login
      const cleanName = email.split('@')[0];
      const user = {
        uid: `usr_${cleanName}_${Date.now()}`,
        id: `usr_${cleanName}_${Date.now()}`,
        name: cleanName,
        displayName: cleanName,
        email: email,
        emailVerified: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'Owner',
        familyId: null,
        familyName: `${cleanName}'s Family Vault`
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
        uid: `google_usr_${Date.now()}`,
        id: `google_usr_${Date.now()}`,
        name: 'Google User',
        displayName: 'Google User',
        email: 'user@gmail.com',
        emailVerified: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'Owner',
        familyId: null,
        familyName: `My Family Vault`
      };
      setCurrentUser(googleUser);
      return googleUser;
    }
  };

  // 4. Logout
  const logout = async () => {
    if (auth && isFirebaseConfigured) {
      await signOut(auth);
    }
    localStorage.removeItem('fv_simulated_user');
    localStorage.removeItem('fv_current_family_id');
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
      const updated = { ...currentUser, emailVerified: true };
      setCurrentUser(updated);
      return true;
    }
    return false;
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
        reloadUser
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
