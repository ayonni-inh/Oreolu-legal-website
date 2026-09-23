import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, requireRole } from '@/lib/server/shared';
import { getSupabaseAdminClient } from '@/lib/server/admin';
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json({ properties: [] });
    }

    const { searchParams } = new URL(req.url);
    const adminRequest = searchParams.get('admin') === 'true';

    let query = supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (adminRequest) {
      const auth = await requireRole(req, ['Admin', 'Staff']);

      if (!auth.allowed) {
        return auth.response;
      }
    } else {
      query = query.eq('published', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Properties fetch error:', error.message);

      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      properties: data || [],
    });
  } catch (error) {
    console.error('Properties GET error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await requireRole(req, ['Admin', 'Staff']);

    if (!auth.allowed) {
      return auth.response;
    }

    const { id } = await context.params;
    const body = await req.json();

    const supabase = getSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database is not configured' },
        { status: 500 }
      );
    }

    const updates: Record<string, unknown> = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.description !== undefined) updates.description = body.description;

    if (body.propertyType !== undefined) {
      updates.property_type = body.propertyType;
    }

    if (body.listingType !== undefined) {
      updates.listing_type = body.listingType;
    }

    if (body.price !== undefined) {
      updates.price =
        body.price === '' || body.price == null
          ? null
          : Number(body.price);
    }

    if (body.currency !== undefined) {
      updates.currency = body.currency;
    }

    if (body.location !== undefined) updates.location = body.location;
    if (body.address !== undefined) updates.address = body.address;

    if (body.bedrooms !== undefined) {
      updates.bedrooms =
        body.bedrooms === '' || body.bedrooms == null
          ? null
          : Number(body.bedrooms);
    }

    if (body.bathrooms !== undefined) {
      updates.bathrooms =
        body.bathrooms === '' || body.bathrooms == null
          ? null
          : Number(body.bathrooms);
    }

    if (body.area !== undefined) {
      updates.area =
        body.area === '' || body.area == null
          ? null
          : Number(body.area);
    }

    if (body.areaUnit !== undefined) {
      updates.area_unit = body.areaUnit;
    }

    if (body.landSize !== undefined) {
      updates.land_size =
        body.landSize === '' || body.landSize == null
          ? null
          : Number(body.landSize);
    }

    if (body.furnished !== undefined) {
      updates.furnished = Boolean(body.furnished);
    }

    if (body.featured !== undefined) {
      updates.featured = Boolean(body.featured);
    }

    if (body.status !== undefined) {
      updates.status = body.status;
    }

    if (body.coverImageUrl !== undefined) {
      updates.cover_image_url = body.coverImageUrl || null;
    }

    if (body.galleryImages !== undefined) {
      updates.gallery_images = Array.isArray(body.galleryImages)
        ? body.galleryImages
        : [];
    }

    if (body.contactName !== undefined) {
      updates.contact_name = body.contactName;
    }

    if (body.contactPhone !== undefined) {
      updates.contact_phone = body.contactPhone;
    }

    if (body.contactEmail !== undefined) {
      updates.contact_email = body.contactEmail;
    }

    if (body.published !== undefined) {
      updates.published = Boolean(body.published);
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Property update error:', error.message);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Property PATCH error:', error);

    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await requireRole(req, ['Admin', 'Staff']);

    if (!auth.allowed) {
      return auth.response;
    }

    const { id } = await context.params;

    const supabase = getSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database is not configured' },
        { status: 500 }
      );
    }

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Property deletion error:', error.message);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id,
    });
  } catch (error) {
    console.error('Property DELETE error:', error);

    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}