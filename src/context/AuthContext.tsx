import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { api } from '../services/api';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isDemo?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isAuthenticating: boolean;
  error: string | null;
  unauthorizedDomain: string | null;
  signInWithGoogle: () => Promise<void>;
  signInAsDemo: () => void;
  logOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const DEMO_USER_KEY = 'medguard_demo_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);

  useEffect(() => {
    // Check for saved demo user session
    const savedDemoUser = localStorage.getItem(DEMO_USER_KEY);
    if (savedDemoUser) {
      try {
        setUser(JSON.parse(savedDemoUser));
      } catch (e) {
        localStorage.removeItem(DEMO_USER_KEY);
      }
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (currentUser) {
          // Real Firebase user logged in
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            isDemo: false
          });
          localStorage.removeItem(DEMO_USER_KEY);
        } else if (!localStorage.getItem(DEMO_USER_KEY)) {
          setUser(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Auth state listener error:", err);
        setError(err.message || "Failed to initialize authentication.");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setUnauthorizedDomain(null);
      setIsAuthenticating(true);
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await api.users.loginEvent({
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        }).catch(() => {});
      }
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        setUnauthorizedDomain(currentDomain);
        setError(`Domain Authorization Required: '${currentDomain}' is not added to Firebase Authorized Domains.`);
      } else if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        // User closed or cancelled the popup - expected behavior, do not log as console error
        console.info('Sign-in popup closed by user.');
        setError('Google sign-in popup was closed. Click "Sign in with Google" to try again, or use Demo Mode.');
      } else if (err?.code === 'auth/popup-blocked') {
        console.warn('Sign-in popup blocked by browser.');
        setError('Sign-in popup was blocked by browser. Please allow popups for this site.');
      } else {
        console.error("Google sign-in error:", err);
        setError(err?.message || 'Failed to authenticate with Google. Please try again.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signInAsDemo = async () => {
    const demoUser: AppUser = {
      uid: 'demo-bio-eng-001',
      displayName: 'Dr. Sarah Jenkins',
      email: 'sarah.jenkins@apollo.org',
      photoURL: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      isDemo: true
    };
    setUser(demoUser);
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    setError(null);
    setUnauthorizedDomain(null);

    await api.users.loginEvent({
      uid: demoUser.uid,
      email: demoUser.email || '',
      displayName: demoUser.displayName,
      photoURL: demoUser.photoURL,
    }).catch(() => {});
  };

  const logOut = async () => {
    try {
      setError(null);
      setUnauthorizedDomain(null);
      localStorage.removeItem(DEMO_USER_KEY);
      setUser(null);
      await signOut(auth);
    } catch (err: any) {
      console.error("Logout error:", err);
      setError(err?.message || 'Failed to log out.');
    }
  };

  const clearError = () => {
    setError(null);
    setUnauthorizedDomain(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticating,
        error,
        unauthorizedDomain,
        signInWithGoogle,
        signInAsDemo,
        logOut,
        clearError
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

