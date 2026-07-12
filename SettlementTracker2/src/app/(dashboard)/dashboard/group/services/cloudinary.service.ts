// app/(dashboard)/dashboard/group/services/cloudinary.service.ts
import { deleteImage as deleteCloudinaryImage } from '@/lib/cloudinary';

export class CloudinaryService {
  /**
   * Extract public ID from Cloudinary URL
   * Example: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
   * Returns: folder/public_id
   */
  extractPublicId(url: string): string | null {
    if (!url) return null;
    
    try {
      // If it's already a public ID (no URL format)
      if (!url.includes('cloudinary.com')) {
        return url;
      }

      // Remove everything before '/upload/'
      const uploadPart = url.split('/upload/');
      if (uploadPart.length < 2) return null;
      
      // Get the part after '/upload/'
      const path = uploadPart[1];
      
      // Remove the version part (v1234567890/) if present
      const withoutVersion = path.replace(/^v\d+\//, '');
      
      // Remove the extension
      const publicId = withoutVersion.replace(/\.[^.]+$/, '');
      
      return publicId;
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return null;
    }
  }

  async deleteImage(url: string): Promise<{ success: boolean; result?: any }> {
    if (!url) return { success: false };

    const publicId = this.extractPublicId(url);
    if (!publicId) {
      console.warn('Could not extract public ID from URL:', url);
      return { success: false };
    }

    try {
      // Using the existing deleteImage helper from lib/cloudinary.ts
      const result = await deleteCloudinaryImage(publicId);
      
      if (result.result === 'ok') {
        console.log('✅ Image deleted from Cloudinary:', publicId);
        return { success: true, result };
      } else {
        console.warn('⚠️ Image deletion returned:', result);
        return { success: false, result };
      }
    } catch (error) {
      console.error('❌ Error deleting image from Cloudinary:', error);
      return { success: false };
    }
  }

  async deleteMultipleImages(urls: string[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const url of urls) {
      const result = await this.deleteImage(url);
      if (result.success) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }

  async deleteOldImageOnUpdate(oldImageUrl: string | null, newImageUrl: string | null): Promise<boolean> {
    // If there's an old image and the new image is different, delete the old one
    if (oldImageUrl && oldImageUrl !== newImageUrl) {
      const result = await this.deleteImage(oldImageUrl);
      return result.success;
    }
    return false;
  }
}