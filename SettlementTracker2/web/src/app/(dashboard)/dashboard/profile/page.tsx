// app/(dashboard)/dashboard/profile/page.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, X, User, Mail, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { imageService } from '@/services/image.service';
import { ImageCropper } from '@/components/dashboard/ImageCropper';
import Link from 'next/link';


export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [tempImagePreview, setTempImagePreview] = useState<string | null>(null);

  // ✅ Fetch user profile from API instead of just session
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/profile');
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 404) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        const userData = data.data || data.user || data;
        
        setName(userData.name || '');
        setEmail(userData.email || '');
        setImagePreview(userData.image || null);
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback to session data
        if (session?.user) {
          setName(session.user.name || '');
          setEmail(session.user.email || '');
          setImagePreview(session.user.image || null);
        }
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchProfile();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [session, status, router]);

  const handleImageSelect = async (file: File) => {
    const validation = imageService.validateImage(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Show cropper with the selected image
    const preview = await imageService.getImagePreview(file);
    setTempImagePreview(preview);
    setTempImageFile(file);
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedFile: File) => {
    setImageFile(croppedFile);
    const preview = await imageService.getImagePreview(croppedFile);
    setImagePreview(preview);
    toast.success('Image cropped successfully!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = session?.user?.image || null;

      // Upload new image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('userId', session?.user?.id || '');

        const response = await fetch('/api/upload/profile-image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to upload image');
        }
        const data = await response.json();
        imageUrl = data.url;
      } else if (imagePreview === null && session?.user?.image) {
        // User removed their profile image
        imageUrl = null;
      }

      // Update user profile
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          image: imageUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      const data = await response.json();
      const updatedUser = data.data || data.user || data;

      // Update local state
      setName(updatedUser.name || '');
      setEmail(updatedUser.email || '');
      setImagePreview(updatedUser.image || null);

      // Update session with new user data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: updatedUser.name,
          image: updatedUser.image,
        },
      });

      toast.success('Profile updated successfully!');
      router.refresh();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Show loading state
  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // ✅ If no session, don't render (will redirect)
  if (status === 'unauthenticated' || !session) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Back Button */}
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Update your profile information</p>
      </div>

      {/* Profile Image */}
      <div className="space-y-4">
        <Label className="text-sm sm:text-base">Profile Picture</Label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="relative">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-3xl sm:text-4xl font-bold text-gray-400 dark:text-gray-500">
                  {name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>
            {imagePreview && (
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            )}
          </div>
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="relative w-full sm:w-auto"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isUploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              JPG, PNG, WEBP, or GIF. Max 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm sm:text-base">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="max-w-md"
        />
      </div>

      {/* Email (read-only) */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
        <Input
          id="email"
          value={email}
          disabled
          className="max-w-md bg-gray-50 dark:bg-gray-800"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Email cannot be changed. Contact support for assistance.
        </p>
      </div>

      {/* Save Button */}
      <div className="pt-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="min-w-[120px] bg-indigo-600 hover:bg-indigo-700 w-full text-white sm:w-auto"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2 text-white" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Image Cropper */}
      <ImageCropper
        open={showCropper}
        onClose={() => {
          setShowCropper(false);
          setTempImagePreview(null);
          setTempImageFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
        imageSrc={tempImagePreview || ''}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
        circularCrop={true}
        minDimension={400}
        cropShape="round"
      />
    </div>
  );
}