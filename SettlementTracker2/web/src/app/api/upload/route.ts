import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/helpers/auth";
import { uploadImage } from "@/lib/uploadImage";

export async function POST(
  request: NextRequest
) {
  try {
    const user = await requireUser();

    const formData =
      await request.formData();

    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            "No image file provided",
        },
        { status: 400 }
      );
    }

    const fileName = file.name
      .split(".")[0]
      .replace(
        /[^a-zA-Z0-9-_]/g,
        ""
      );

    const result = await uploadImage(
      file,
      {
        folder: `trips/${user.id}`,
        publicId: `${Date.now()}-${fileName}`,
        overwrite: false,
        alt: `Trip cover image for ${
          user.name || "user"
        }`,
        uploadedBy: user.email,
      }
    );

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      uploadedAt:
        result.created_at,
    });
  } catch (error) {
    console.error(
      "Error uploading image:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload image",
      },
      { status: 500 }
    );
  }
}