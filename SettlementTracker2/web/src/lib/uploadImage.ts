// lib/uploadImage.ts

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function uploadImage(
  file: File,
  options: {
    folder: string;
    publicId: string;
    overwrite?: boolean;
    alt?: string;
    uploadedBy?: string;
  }
) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed"
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      "File size too large. Maximum size is 5MB"
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await new Promise<any>(
    (resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          public_id: options.publicId,
          overwrite:
            options.overwrite ?? false,

          resource_type: "image",

          transformation: [
            {
              width: 1200,
              height: 800,
              crop: "limit",
            },
            {
              quality: "auto:good",
            },
            {
              fetch_format: "auto",
            },
          ],

          tags: ["user-upload"],

          context: {
            ...(options.alt && {
              alt: options.alt,
            }),
            ...(options.uploadedBy && {
              uploaded_by:
                options.uploadedBy,
            }),
          },
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    }
  );

  if (!result?.secure_url) {
    throw new Error(
      "Failed to upload image"
    );
  }

  return result;
}