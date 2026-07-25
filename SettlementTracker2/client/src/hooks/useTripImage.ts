// hooks/useTripImage.ts
import { useState, useRef } from 'react';
import { toast } from 'sonner';

interface UploadResponse {
  success: boolean;
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
  uploadedAt: string;
}

export const useTripImage = () => {
  const [tripImage, setTripImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageData, setUploadedImageData] = useState<UploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImage = (file: File): boolean => {
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return false;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload JPEG, PNG, WebP, or GIF image');
      return false;
    }

    return true;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateImage(file)) {
      setTripImage(file);
      // Create local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setTripImage(null);
    setImagePreview(null);
    setUploadedImageData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!tripImage) return null;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', tripImage);
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || 'Failed to upload image');
      }
      
      const data: UploadResponse = await uploadResponse.json();
      setUploadedImageData(data);
      
      toast.success('Image uploaded successfully!');
      return data.url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      toast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Delete image from Cloudinary
  const deleteUploadedImage = async (publicId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/upload/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
      return false;
    }
  };

  return {
    tripImage,
    imagePreview,
    isUploading,
    uploadedImageData,
    fileInputRef,
    handleImageUpload,
    removeImage,
    uploadImage,
    deleteUploadedImage,
    setTripImage,
    setImagePreview,
  };
};