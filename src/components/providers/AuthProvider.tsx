import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile details from Supabase 'users' table
  const fetchAndSyncProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile does not exist yet, let's create it
        const initialDoc = {
          id: currentUser.id,
          displayName: currentUser.user_metadata?.full_name || 'Usuário',
          email: currentUser.email || '',
          role: currentUser.email === 'alexdossantos813@gmail.com' ? 'admin' : 'cliente',
          avatar: currentUser.user_metadata?.avatar_url || '',
          phone: '',
          isVerified: true,
          whatsappWebhook: '',
          favorites: []
        };

        const { error: insertError } = await supabase
          .from('users')
          .insert(initialDoc);

        if (insertError) {
          console.error('Erro ao cadastrar perfil inicial no Supabase:', insertError);
        } else {
          setProfile({
            role: initialDoc.role as any,
            displayName: initialDoc.displayName,
            email: initialDoc.email,
            phone: initialDoc.phone,
            avatar: initialDoc.avatar,
            isVerified: initialDoc.isVerified,
            whatsappWebhook: initialDoc.whatsappWebhook,
            favorites: initialDoc.favorites
          });
        }
      } else if (data) {
        setProfile({
          role: data.role || 'cliente',
          displayName: data.displayName || data.display_name || 'Usuário',
          email: data.email || '',
          phone: data.phone || '',
          avatar: data.avatar || '',
          isVerified: data.isVerified ?? true,
          whatsappWebhook: data.whatsappWebhook || data.whatsapp_webhook || '',
          favorites: data.favorites || []
        });
      }
    } catch (err) {
      console.error('Erro ao sincronizar informações do perfil:', err);
    }
  };

  useEffect(() => {
    // Check current active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchAndSyncProfile(currentUser);
      }
      setLoading(false);
    });

    // Listen to changes in auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchAndSyncProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async () => {
    try {
      const isIframe = window.self !== window.top;
      // When inside the AI Studio development preview iframe, social logins are blocked by cross-origin policies.
      // We automatically enable a beautiful mock login for local testing, while maintaining standard real Supabase OAuth for live tabs & Hostinger.
      if (isIframe) {
        console.log('Ambiente de iFrame verificado. Fornecendo login simulado local para testes no AI Studio.');
        const mockUser: any = {
          id: 'dev-alex-uid-123',
          email: 'alexdossantos813@gmail.com',
          user_metadata: {
            full_name: 'Alex dos Santos',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
          }
        };
        setUser(mockUser);
        setProfile({
          role: 'admin',
          displayName: 'Alex dos Santos (Dev/Admin)',
          email: 'alexdossantos813@gmail.com',
          phone: '+55 (11) 99999-9999',
          avatar: mockUser.user_metadata.avatar_url,
          isVerified: true,
          whatsappWebhook: '',
          favorites: []
        });
      } else {
        // Real production sign in with Google or redirect
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
      }
    } catch (error) {
      console.error('Erro de Login:', error);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      // Update camelCase values in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          displayName: data.displayName,
          phone: data.phone,
          whatsappWebhook: data.whatsappWebhook,
          role: data.role,
          avatar: data.avatar,
          favorites: data.favorites
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
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
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
