// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

// Helper function to delete images
export const deleteImage = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Helper function to get image optimization URL
export const getOptimizedImageUrl = (
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
    crop?: 'fill' | 'fit' | 'limit' | 'thumb' | 'scale';
  }
) => {
  const {
    width = 800,
    height = 600,
    quality = 80,
    format = 'auto',
    crop = 'limit',
  } = options || {};

  return cloudinary.url(publicId, {
    width,
    height,
    quality: `auto:${quality}`,
    fetch_format: format,
    crop,
    secure: true,
  });
};

// Helper to get different image sizes for responsive images
export const getResponsiveImageUrls = (publicId: string) => {
  return {
    thumbnail: cloudinary.url(publicId, {
      width: 150,
      height: 150,
      crop: 'thumb',
      quality: 'auto:low',
      fetch_format: 'auto',
      secure: true,
    }),
    small: cloudinary.url(publicId, {
      width: 400,
      height: 300,
      crop: 'limit',
      quality: 'auto:good',
      fetch_format: 'auto',
      secure: true,
    }),
    medium: cloudinary.url(publicId, {
      width: 800,
      height: 600,
      crop: 'limit',
      quality: 'auto:good',
      fetch_format: 'auto',
      secure: true,
    }),
    large: cloudinary.url(publicId, {
      width: 1200,
      height: 900,
      crop: 'limit',
      quality: 'auto:best',
      fetch_format: 'auto',
      secure: true,
    }),
  };
};