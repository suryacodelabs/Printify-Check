
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isProOrTeam: boolean;
  subscriptionTier: SubscriptionTier;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');
  const [isProOrTeam, setIsProOrTeam] = useState(false);

  // Fetch user's subscription tier
  const fetchSubscriptionTier = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching subscription tier:', error);
        return;
      }

      const tier = data?.tier as SubscriptionTier || 'free';
      setSubscriptionTier(tier);
      setIsProOrTeam(['pro', 'enterprise'].includes(tier));
    } catch (error) {
      console.error('Subscription fetch error:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          // Use setTimeout to avoid potential deadlock
          setTimeout(() => {
            fetchSubscriptionTier(newSession.user.id);
          }, 0);
        } else {
          setSubscriptionTier('free');
          setIsProOrTeam(false);
        }
        
        setIsLoading(false);
        
        // Show toast on sign in and sign out
        if (event === 'SIGNED_IN') {
          toast({
            title: "Signed in successfully",
            description: `Welcome${newSession?.user?.email ? ` ${newSession.user.email}` : ''}!`,
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
          });
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      if (initialSession?.user) {
        fetchSubscriptionTier(initialSession.user.id);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      isLoading, 
      isProOrTeam,
      subscriptionTier, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
