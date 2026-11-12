/**
 * Maps Firebase Auth error codes to user-friendly messages.
 */
export const getFriendlyFirebaseErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const code = error.code || '';

  switch (code) {
    case 'auth/invalid-email':
      return 'The email address is improperly formatted. Please check and try again.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account exists with this email address. Please register first.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again or use the forgot password option.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please double-check your credentials.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please log in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/operation-not-allowed':
      return 'This authentication method is currently not enabled in your Firebase console.';
    case 'auth/popup-closed-by-user':
      return 'The Google sign-in popup was closed before completing authentication.';
    case 'auth/popup-blocked':
      return 'The Google sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/cancelled-popup-request':
      return 'Only one popup sign-in request can be active at a time.';
    case 'auth/requires-recent-login':
      return 'For security, please log out and sign in again before continuing.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Access to this account has been temporarily disabled. Please reset your password or try later.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connectivity.';
    case 'auth/api-key-not-valid':
    case 'auth/invalid-api-key':
      return 'Invalid Firebase API Key in .env. Please check your Firebase Console configuration.';
    case 'auth/unverified-email':
      return 'Your email address has not been verified yet. Please check your inbox.';
    default:
      return error.message || 'An error occurred during authentication. Please try again.';
  }
};

