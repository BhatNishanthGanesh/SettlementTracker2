import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";
import { requireUser } from "@/helpers/auth";
import { uploadImage } from "@/lib/uploadImage";

export async function POST(
  request: NextRequest
) {
  try {
    const user = await requireUser();

    const formData =
      await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const result = await uploadImage(
      file,
      {
        folder: "profile_images",
        publicId: `user_${user.id}`,
        overwrite: true,
        alt: `Profile image for ${user.name}`,
        uploadedBy: user.email,
      }
    );

    const updatedUser =
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          image: result.secure_url,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      });

    return NextResponse.json({
      success: true,
      url: updatedUser.image,
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "Error uploading profile image:",
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