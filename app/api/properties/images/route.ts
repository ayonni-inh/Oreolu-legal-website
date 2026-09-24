import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/server/admin';
import { requireRole } from '@/lib/server/shared';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['Admin', 'Staff']);

    if (!auth.allowed) {
      return auth.response;
    }

    const form = await req.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            'Invalid image type. Please upload JPG, PNG, WebP, or GIF.',
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'Image is too large. Maximum size is 10MB.',
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Storage service is not configured' },
        { status: 500 }
      );
    }

    const extension =
      file.name.split('.').pop()?.toLowerCase() || 'jpg';

    const uniqueName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}.${extension}`;

    const storagePath = `properties/${auth.session.id}/${uniqueName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error(
        'Property image upload failed:',
        uploadError.message
      );

      return NextResponse.json(
        { error: 'Image upload failed' },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from('property-images')
      .getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: storagePath,
      name: file.name,
    });
  } catch (error) {
    console.error('Property image upload error:', error);

    return NextResponse.json(
      { error: 'Image upload failed' },
      { status: 500 }
    );
  }
}