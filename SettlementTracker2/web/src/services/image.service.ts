import { api } from "@/lib/api";
import {
  ImageValidationResult,
  UploadImageResponse,
} from "@/types/trip.types";
import { IMAGE_CONFIG } from "@/constants/group.constant";

export const imageService = {
  validateImage(file: File): ImageValidationResult {
    if (file.size > IMAGE_CONFIG.MAX_SIZE) {
      return {
        valid: false,
        error: "Image size should be less than 5MB",
      };
    }

    if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: "Please upload JPEG, PNG, WebP, or GIF image",
      };
    }

    return { valid: true };
  },

  async uploadImage(file: File): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.url;
  },

  getImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result as string);

      reader.onerror = () =>
        reject(new Error("Failed to read image."));

      reader.readAsDataURL(file);
    });
  },
};