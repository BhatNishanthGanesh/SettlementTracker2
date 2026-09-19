'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Settings as SettingsIcon,
  User,
  CreditCard,
  Moon,
  Sun,
  Monitor,
  Calendar,
  CircleDollarSign,
  Users,
  Mail,
  Edit2,
  Save,
  X,
  LogOut,
  Trash2,
  AlertCircle,
  HelpCircle,
  FileText,
  Camera,
  Download,
  RefreshCw,
  Database,
  Cloud,
  Plus,
  Minus,
  Sparkles,
  Compass,
  BadgeCheck,
  ReceiptText,
  Palette,
  ChevronRight,
  Clock,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDashboardData } from '@/hooks/useDashboardData';

export default function Settings() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const { loading: tripsLoading, stats } = useDashboardData();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    id: string;
    name: string;
    email: string;
    image?: string;
    budgetNotifications: boolean;
    paymentNotifications: boolean;
  } | null>(null);
  const [editForm, setEditForm] = useState({ name: '', image: '' });
  const [preferences, setPreferences] = useState({
    budgetNotifications: true,
    paymentNotifications: true,
  });
  const [savingPreferences, setSavingPreferences] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/profile');
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        const userData = data.data || data.user || data;
        setProfile(userData);
        setEditForm({ 
          name: userData.name || '', 
          image: userData.image || '' 
        });
        setPreferences({
          budgetNotifications: userData.budgetNotifications ?? true,
          paymentNotifications: userData.paymentNotifications ?? true,
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Use session data as fallback
        if (session?.user) {
          setProfile({
            id: session.user.id || '',
            name: session.user.name || '',
            email: session.user.email || '',
            image: session.user.image || '',
            budgetNotifications: true,
            paymentNotifications: true,
          });
          setEditForm({ 
            name: session.user.name || '', 
            image: session.user.image || '' 
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [session]);

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: editForm.name,
          image: editForm.image 
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update profile');
      
      const data = await response.json();
      const updatedUser = data.data || data.user || data;
      setProfile(updatedUser);
      setIsEditing(false);
      toast.success('✨ Profile updated successfully!');
      
      // Update session with new data
      await updateSession({
        name: updatedUser.name,
        image: updatedUser.image,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      toast.success('👋 Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleSavePreferences = async (nextPreferences: typeof preferences) => {
    setSavingPreferences(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextPreferences),
      });

      if (!response.ok) throw new Error('Failed to update preferences');
      const data = await response.json();
      const updatedUser = data.data || data.user || data;
      setProfile((current) => current ? { ...current, ...updatedUser } : current);
      setPreferences(nextPreferences);
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to update notification preferences');
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete account');
      setProfile(null);
      setEditForm({ name: '', image: '' });
      await signOut({ redirect: false });
      router.push('/login');
      router.refresh();
      toast.success('Account deleted successfully');
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'data', label: 'Data & Storage', icon: Database },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  if (loading || tripsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your personal information</p>
              </div>
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </div>

            {/* Profile Picture */}
            <div className="flex items-center gap-6 p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl">
              <div className="relative group">
                <Avatar className="h-24 w-24 ring-4 ring-white dark:ring-gray-800">
                  {profile?.image || editForm.image ? (
                    <AvatarImage src={profile?.image || editForm.image} />
                  ) : (
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {profile?.name?.charAt(0) || session?.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <button className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {profile?.name || session?.user?.name}
                  <BadgeCheck className="h-5 w-5 text-blue-500" />
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email || session?.user?.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-0">
                    Verified
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Profile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  Full Name
                </Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-purple-500" />
                  Email
                </Label>
                <Input
                  type="email"
                  value={profile?.email || session?.user?.email || ''}
                  disabled
                  className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                />
              </div>
            </div>

            <Separator />

            {/* ✅ Stats from DashboardStats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { 
                  label: 'Total Spent', 
                  value: `₹${stats.totalSpent.toLocaleString()}`, 
                  icon: CircleDollarSign, 
                  color: 'blue',
                  subtitle: `Avg. ₹${stats.averageSpent.toFixed(0)} per trip`
                },
                { 
                  label: 'Total Trips', 
                  value: stats.totalTrips, 
                  icon: Calendar, 
                  color: 'purple',
                  subtitle: `${stats.settledCount} settled · ${stats.pendingCount} pending`
                },
                { 
                  label: 'Pending Balance', 
                  value: `₹${stats.pendingBalance.toLocaleString()}`, 
                  icon: Users, 
                  color: 'amber',
                  subtitle: `${stats.pendingCount} unsettled`
                },
              ].map((stat) => (
                <div key={stat.label} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <stat.icon className={`h-5 w-5 text-${stat.color}-500 mb-2`} />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  {stat.subtitle && (
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{stat.subtitle}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Settings</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Control alerts for settlements and trip budgets.</p>
            </div>
            <div className="space-y-3">
              {[
                {
                  key: 'budgetNotifications' as const,
                  title: 'Budget alerts',
                  description: 'Receive local alerts when a trip crosses 25%, 50%, 75%, or 100% of its budget.',
                },
                {
                  key: 'paymentNotifications' as const,
                  title: 'Settlement alerts',
                  description: 'Receive local alerts for payment requests and completed settlements.',
                },
              ].map((preference) => (
                <div key={preference.key} className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{preference.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{preference.description}</p>
                  </div>
                  <Button
                    variant={preferences[preference.key] ? 'default' : 'outline'}
                    disabled={savingPreferences}
                    onClick={() => handleSavePreferences({
                      ...preferences,
                      [preference.key]: !preferences[preference.key],
                    })}
                  >
                    {preferences[preference.key] ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Data & Storage</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your data and storage</p>
            </div>

            <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Used</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">245 MB / 1 GB</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full" style={{ width: '24%' }}></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { label: 'Photos', value: '120 MB' },
                  { label: 'Documents', value: '80 MB' },
                  { label: 'Messages', value: '25 MB' },
                  { label: 'Other', value: '20 MB' },
                ].map((item) => (
                  <div key={item.label} className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Data Management</h4>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Cloud className="h-4 w-4" />
                Sync Now
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Download className="h-4 w-4" />
                Download My Data
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <RefreshCw className="h-4 w-4" />
                Clear Cache
              </Button>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Help & Support</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get help and support</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'FAQ', icon: HelpCircle, desc: 'Frequently asked questions' },
                { label: 'Email Support', icon: Mail, desc: 'support@tripsplit.com' },
                { label: 'Documentation', icon: FileText, desc: 'Read our user guide' },
              ].map((item) => (
                <div key={item.label} className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl cursor-pointer hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-b border-white/10 sticky top-0 z-20 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
                <SettingsIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  Settings
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                </h1>
                <p className="text-sm text-white/80 flex items-center gap-1">
                  <Compass className="h-3 w-3" />
                  Manage your account preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-20 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 rounded-2xl shadow-xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl">
                  <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-gray-800">
                    {profile?.image || editForm.image ? (
                      <AvatarImage src={profile?.image || editForm.image}  />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-lg">
                        {profile?.name?.charAt(0) || session?.user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {profile?.name || session?.user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                      <BadgeCheck className="h-3 w-3 text-blue-500" />
                      Verified
                    </p>
                  </div>
                </div>

                <Separator className="mb-3" />

                <div className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? 'secondary' : 'ghost'}
                        className={cn(
                          "w-full justify-start transition-all",
                          isActive && "bg-blue-50 dark:bg-blue-950/30"
                        )}
                        onClick={() => setActiveTab(item.id)}
                      >
                        <Icon className={cn("h-4 w-4 mr-3", isActive ? "text-blue-500" : "text-gray-500 dark:text-gray-400")} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {isActive && <ChevronRight className="h-4 w-4 text-blue-500" />}
                      </Button>
                    );
                  })}
                </div>

                <Separator className="my-3" />

                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={() => setShowLogoutDialog(true)}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-3" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white/90 backdrop-blur-sm dark:bg-gray-900/90 rounded-2xl shadow-xl overflow-hidden p-6">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 border-0 shadow-2xl">
          <DialogHeader>
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <LogOut className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle className="text-center text-xl">Logout?</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="flex-1">
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 border-0 shadow-2xl">
          <DialogHeader>
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle className="text-center text-xl text-red-600">Delete Account?</DialogTitle>
            <DialogDescription className="text-center">
              This action cannot be undone. All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">
              This will delete all your trip data, expenses, and group information permanently.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} className="flex-1">
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}