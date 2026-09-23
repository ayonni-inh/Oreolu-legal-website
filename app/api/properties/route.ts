import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/server/shared';
import { getSupabaseAdminClient } from '@/lib/server/admin';

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json([]);
    }

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Properties fetch error:', error.message);

      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Properties GET error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['Admin', 'Staff']);

    if (!auth.allowed) {
      return auth.response;
    }

    const body = await req.json();

    if (!body.title || !body.slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    const property = {
      title: body.title,
      slug: body.slug,
      description: body.description || null,
      property_type: body.propertyType || 'House',
      listing_type: body.listingType || 'For Sale',

      price:
        body.price !== '' && body.price != null
          ? Number(body.price)
          : null,

      currency: body.currency || 'NGN',
      location: body.location || null,
      address: body.address || null,

      bedrooms:
        body.bedrooms !== '' && body.bedrooms != null
          ? Number(body.bedrooms)
          : null,

      bathrooms:
        body.bathrooms !== '' && body.bathrooms != null
          ? Number(body.bathrooms)
          : null,

      area:
        body.area !== '' && body.area != null
          ? Number(body.area)
          : null,

      area_unit: body.areaUnit || 'sqm',

      land_size:
        body.landSize !== '' && body.landSize != null
          ? Number(body.landSize)
          : null,

      furnished: Boolean(body.furnished),
      featured: Boolean(body.featured),
      status: body.status || 'Available',

      cover_image_url: body.coverImageUrl || null,

      gallery_images: Array.isArray(body.galleryImages)
        ? body.galleryImages
        : [],

      contact_name: body.contactName || null,
      contact_phone: body.contactPhone || null,
      contact_email: body.contactEmail || null,

      published: Boolean(body.published),
    };

    const { data, error } = await supabase
      .from('properties')
      .insert([property])
      .select()
      .single();

    if (error) {
      console.error('Property creation error:', error.message);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Properties POST error:', error);

    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}