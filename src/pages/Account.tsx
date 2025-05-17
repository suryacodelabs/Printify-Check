
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, User, CreditCard, Settings, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const Account = () => {
  const { user, signOut, subscriptionTier } = useAuth();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: user?.email || '',
  });
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      if (data) {
        setProfileData({
          fullName: data.full_name || '',
          email: data.email || user.email || '',
        });
      }
      return data;
    },
    enabled: !!user
  });
  
  const { data: usageData, isLoading: isUsageLoading } = useQuery({
    queryKey: ['usage', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // In a real app, fetch actual usage data
      // For demo, return mock data
      return {
        checksThisMonth: 12,
        checksLimit: subscriptionTier === 'free' ? 10 : 
                     subscriptionTier === 'basic' ? 100 : 
                     subscriptionTier === 'pro' ? 500 : 
                     Number.POSITIVE_INFINITY,
        storageUsed: 45.8, // MB
        storageLimit: subscriptionTier === 'free' ? 100 : 
                      subscriptionTier === 'basic' ? 1024 : 
                      subscriptionTier === 'pro' ? 5120 : 
                      Number.POSITIVE_INFINITY,
      };
    },
    enabled: !!user && !!subscriptionTier
  });
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.fullName,
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const getSubscriptionBadge = () => {
    switch (subscriptionTier) {
      case 'pro':
        return <Badge className="bg-indigo-500">Pro</Badge>;
      case 'enterprise':
        return <Badge className="bg-purple-500">Enterprise</Badge>;
      case 'basic':
        return <Badge className="bg-blue-500">Basic</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };
  
  if (!user) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="flex items-center justify-center">
            <Card>
              <CardHeader>
                <CardTitle>Not Authenticated</CardTitle>
                <CardDescription>You need to sign in to view your account.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="bg-muted border-b">
        <div className="container py-6">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and subscription
          </p>
        </div>
      </div>
      
      <div className="container py-8">
        <Tabs defaultValue="profile">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-64 flex-shrink-0">
              <div className="sticky top-6">
                <TabsList className="flex flex-col h-auto gap-2">
                  <TabsTrigger value="profile" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="subscription" className="w-full justify-start">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Subscription
                  </TabsTrigger>
                  <TabsTrigger value="security" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Security
                  </TabsTrigger>
                </TabsList>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <div className="text-sm font-medium">
                    <div className="flex items-center gap-2 mb-1">
                      Current Plan: {getSubscriptionBadge()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {subscriptionTier === 'free' && 'Limited features and usage'}
                      {subscriptionTier === 'basic' && 'Standard features and usage'}
                      {subscriptionTier === 'pro' && 'Advanced features and higher limits'}
                      {subscriptionTier === 'enterprise' && 'All features with unlimited usage'}
                    </div>
                  </div>
                  
                  {subscriptionTier === 'free' && (
                    <Button 
                      className="w-full" 
                      size="sm" 
                      onClick={() => navigate('/pricing')}
                    >
                      Upgrade Plan
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <TabsContent value="profile" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your account information
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleUpdateProfile}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-medium">
                          Full Name
                        </label>
                        <Input
                          id="fullName"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email
                        </label>
                        <Input
                          id="email"
                          value={profileData.email}
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">
                          Email can't be changed. Contact support for assistance.
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="ghost">Cancel</Button>
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Account details and usage
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Account ID</p>
                        <p className="text-sm font-mono">{user.id}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Account Created</p>
                        <p className="text-sm">
                          {/* In a real app, get this from the profile creation date */}
                          {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-3">Account Usage</h4>
                      
                      {isUsageLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-6 w-full" />
                        </div>
                      ) : usageData ? (
                        <>
                          <div className="space-y-1 mb-3">
                            <div className="flex items-center justify-between text-sm">
                              <span>Checks This Month</span>
                              <span className="font-medium">
                                {usageData.checksThisMonth} / {usageData.checksLimit === Number.POSITIVE_INFINITY ? '∞' : usageData.checksLimit}
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded overflow-hidden">
                              <div 
                                className={`h-full ${usageData.checksThisMonth / usageData.checksLimit > 0.9 ? 'bg-red-500' : 'bg-primary'}`}
                                style={{ width: `${Math.min(usageData.checksThisMonth / (usageData.checksLimit === Number.POSITIVE_INFINITY ? 1 : usageData.checksLimit) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>Storage Used</span>
                              <span className="font-medium">
                                {usageData.storageUsed} MB / {usageData.storageLimit === Number.POSITIVE_INFINITY ? '∞' : `${usageData.storageLimit} MB`}
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded overflow-hidden">
                              <div 
                                className={`h-full ${usageData.storageUsed / usageData.storageLimit > 0.9 ? 'bg-red-500' : 'bg-primary'}`}
                                style={{ width: `${Math.min(usageData.storageUsed / (usageData.storageLimit === Number.POSITIVE_INFINITY ? 1 : usageData.storageLimit) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Failed to load usage data</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="subscription" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>
                      Manage your subscription and billing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} Plan
                          {getSubscriptionBadge()}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {subscriptionTier === 'free' && 'Limited features with basic functionality'}
                          {subscriptionTier === 'basic' && '$9.99/month • Standard features for individuals'}
                          {subscriptionTier === 'pro' && '$29.99/month • Advanced features for professionals'}
                          {subscriptionTier === 'enterprise' && 'Custom pricing • Full suite with premium support'}
                        </p>
                      </div>
                      
                      {subscriptionTier !== 'free' && (
                        <Badge variant="outline">Active</Badge>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Plan Features</h4>
                      
                      {subscriptionTier === 'free' && (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                              <span className="text-sm">10 checks per month</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                              <span className="text-sm">Basic preflight checks</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                              <span className="text-sm">Up to 10MB file size</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <span className="text-sm text-muted-foreground">OCR functionality</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <span className="text-sm text-muted-foreground">Redaction features</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <span className="text-sm text-muted-foreground">Advanced auto-fix</span>
                            </div>
                          </div>
                          
                          <Button onClick={() => navigate('/pricing')}>
                            Upgrade to Pro
                          </Button>
                        </>
                      )}
                      
                      {subscriptionTier === 'basic' && (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                              <span className="text-sm">100 checks per month</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                              <span className="text-sm">Advanced preflight checks</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                              <span className="text-sm">Up to 50MB file size</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                              <span className="text-sm">Basic OCR functionality</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <span className="text-sm text-muted-foreground">Redaction features</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <span className="text-sm text-muted-foreground">Advanced auto-fix</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button onClick={() => navigate('/pricing')}>
                              Upgrade to Pro
                            </Button>
                            <Button variant="outline">
                              Manage Subscription
                            </Button>
                          </div>
                        </>
                      )}
                      
                      {(subscriptionTier === 'pro' || subscriptionTier === 'enterprise') && (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                              <span className="text-sm">{subscriptionTier === 'pro' ? '500' : 'Unlimited'} checks per month</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                              <span className="text-sm">Complete preflight checks</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                              <span className="text-sm">Up to {subscriptionTier === 'pro' ? '100MB' : '200MB'} file size</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                              <span className="text-sm">Advanced OCR functionality</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                              <span className="text-sm">Full redaction features</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                              <span className="text-sm">Advanced auto-fix</span>
                            </div>
                          </div>
                          
                          <Button variant="outline">
                            Manage Subscription
                          </Button>
                        </>
                      )}
                    </div>
                    
                    {subscriptionTier !== 'free' && (
                      <>
                        <Separator />
                        
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">Billing Information</h4>
                          
                          <div className="rounded-md border border-dashed p-4">
                            <p className="text-sm text-center text-muted-foreground">
                              This is a demo application.<br />
                              In a real app, billing details would be displayed here.
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>
                      View your past invoices and payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border border-dashed p-8 text-center">
                      <p className="text-muted-foreground">
                        No billing history available
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                      Update your account password
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="currentPassword" className="text-sm font-medium">
                        Current Password
                      </label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="newPassword" className="text-sm font-medium">
                        New Password
                      </label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="text-sm font-medium">
                        Confirm New Password
                      </label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Update Password</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Account Security</CardTitle>
                    <CardDescription>
                      Manage security settings for your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="twoFactor" className="text-sm font-medium">
                          Two-Factor Authentication (2FA)
                        </label>
                        <Button size="sm">Enable</Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Add an extra layer of security to your account by requiring a verification code along with your password.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          Active Sessions
                        </label>
                      </div>
                      <div className="rounded-md border p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Current Session</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              This device • Last active now
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Log Out
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Danger Zone</CardTitle>
                    <CardDescription>
                      Irreversible account actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Delete Account</AlertTitle>
                      <AlertDescription>
                        This action is irreversible and will permanently delete all your data including preflight checks, reports, and account information.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                  <CardFooter>
                    <Button variant="destructive">
                      Delete Account
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Account;
