import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, getDocFromServer, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

interface UserProfile {
  role: 'admin' | 'lojista' | 'cliente';
  displayName: string;
  email: string;
  phone?: string;
  avatar?: string;
  isVerified?: boolean;
  whatsappWebhook?: string;
  favorites?: string[];
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate Connection to Firestore (Pillar)
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, '_connection_test', 'ping'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('permission-denied')) {
          console.log('Firebase connection verified (Rules working)');
        } else {
          console.error('Firebase connection issue:', error);
        }
      }
    };
    testConnection();

    let unsubscribeProfile: () => void = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Dynamic Profile Synchronization
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        // Initial creation check
        try {
          const docSnap = await getDoc(userDocRef);
          if (!docSnap.exists()) {
            const initialDoc: UserProfile = {
              displayName: currentUser.displayName || 'Usuário',
              email: currentUser.email || '',
              role: currentUser.email === 'alexdossantos813@gmail.com' ? 'admin' : 'cliente',
              avatar: currentUser.photoURL || '',
              phone: '',
              isVerified: true,
              whatsappWebhook: '',
              favorites: []
            };
            await setDoc(userDocRef, initialDoc);
          }
        } catch (err) {
          console.error('Error ensuring profile exists:', err);
        }

        // Live syncing of profile details
        unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            setProfile(snapshot.data() as UserProfile);
          }
        });
      } else {
        setProfile(null);
        unsubscribeProfile();
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, data);
    } catch (error) {
      console.error('Update Profile Error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context;
};
