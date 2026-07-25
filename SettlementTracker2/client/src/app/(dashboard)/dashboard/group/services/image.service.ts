// services/image.service.ts
import { IMAGE_CONFIG, API_ENDPOINTS } from '../constants';

export class ImageService {
  validateImage(file: File): { valid: boolean; error?: string } {
    if (file.size > IMAGE_CONFIG.MAX_SIZE) {
      return { valid: false, error: 'Image size should be less than 5MB' };
    }
    if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'Please upload JPEG, PNG, WebP, or GIF image' };
    }
    return { valid: true };
  }

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(API_ENDPOINTS.UPLOAD, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to upload image');
    const data = await response.json();
    return data.url;
  }

  getImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}