// app/api/upload/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { requireUser } from '@/helpers/auth';

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser()
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    const username = user.email.split('@')[0];
    if (!publicId.includes(username)) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this image' },
        { status: 403 }
      );
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok') {
      throw new Error('Failed to delete image from Cloudinary');
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}