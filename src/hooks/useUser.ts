
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface UserSubscription {
  tier: 'free' | 'pro' | 'team' | 'enterprise';
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
  current_period_end?: Date;
}

export function useUser() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription>({
    tier: 'free',
    status: 'active'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Features based on subscription tier
  const features = {
    ocr: subscription.tier !== 'free',
    redaction: subscription.tier !== 'free',
    batchProcessing: ['team', 'enterprise'].includes(subscription.tier),
    maxFileSize: subscription.tier === 'free' ? 52428800 : 1073741824, // 50MB for free, 1GB for paid
    maxFilesPerMonth: subscription.tier === 'free' ? 10 : (subscription.tier === 'pro' ? 100 : 1000),
    advancedFixOptions: subscription.tier !== 'free',
    customRules: ['team', 'enterprise'].includes(subscription.tier),
    apiAccess: subscription.tier === 'enterprise',
    teamMembers: subscription.tier === 'free' ? 1 : (subscription.tier === 'pro' ? 1 : (subscription.tier === 'team' ? 5 : 15))
  };
  
  // Load user profile and subscription
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get current auth session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session?.user) {
          setProfile(null);
          return;
        }
        
        // Get profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }
        
        if (profileData) {
          setProfile({
            id: profileData.id,
            email: profileData.email,
            full_name: profileData.full_name,
            avatar_url: profileData.avatar_url
          });
        } else {
          // If no profile, use auth user data
          setProfile({
            id: session.user.id,
            email: session.user.email || '',
          });
        }
        
        // Get subscription
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (subscriptionError) throw subscriptionError;
        
        if (subscriptionData) {
          // Ensure tier is one of the allowed values
          let tier: 'free' | 'pro' | 'team' | 'enterprise' = 'free';
          if (['free', 'pro', 'team', 'enterprise'].includes(subscriptionData.tier)) {
            tier = subscriptionData.tier as 'free' | 'pro' | 'team' | 'enterprise';
          }
          
          // Ensure status is one of the allowed values
          let status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' = 'active';
          if (['active', 'trialing', 'past_due', 'canceled', 'incomplete'].includes(subscriptionData.status)) {
            status = subscriptionData.status as 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
          }
          
          setSubscription({
            tier,
            status,
            current_period_end: subscriptionData.current_period_end ? new Date(subscriptionData.current_period_end) : undefined
          });
        }
      } catch (err: any) {
        console.error('Error loading user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        loadUserData();
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setSubscription({
          tier: 'free',
          status: 'active'
        });
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Update profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!profile?.id) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);
      
      if (error) throw error;
      
      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      
      return true;
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message);
      
      toast({
        title: 'Update failed',
        description: err.message,
        variant: 'destructive',
      });
      
      return false;
    }
  };

  return {
    profile,
    subscription,
    features,
    loading,
    error,
    updateProfile,
    user
  };
}
