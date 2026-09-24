import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/server/admin";
import {
  fallbackPropertyListings,
  asNullableNumber,
  asNullableString,
  asStringArray,
  slugify,
} from "@/lib/server/content";
import {
  loadUserById,
  readSessionCookie,
  recordActivity,
  requireRole,
} from "@/lib/server/shared";

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  propertyType: z.string().optional(),
  listingType: z.string().optional(),
  price: z.union([z.number(), z.string(), z.null()]).optional(),
  currency: z.string().optional(),
  location: z.string().optional(),
  address: z.string().nullable().optional(),
  bedrooms: z.union([z.number(), z.string(), z.null()]).optional(),
  bathrooms: z.union([z.number(), z.string(), z.null()]).optional(),
  area: z.union([z.number(), z.string(), z.null()]).optional(),
  areaUnit: z.string().optional(),
  landSize: z.union([z.number(), z.string(), z.null()]).optional(),
  furnished: z.boolean().optional(),
  featured: z.boolean().optional(),
  status: z.string().optional(),
  coverImageUrl: z.string().url().or(z.literal("")).nullable().optional(),
  galleryImages: z.array(z.string().url()).optional(),
  contactName: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  contactEmail: z.string().email().or(z.literal("")).nullable().optional(),
  published: z.boolean().optional(),
});

function mapProperty(item: any) {
  return {
    ...item,
    propertyType: item.property_type,
    listingType: item.listing_type,
    areaUnit: item.area_unit,
    coverImageUrl: item.cover_image_url,
    galleryImages: item.gallery_images || [],
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = readSessionCookie(req);
  const sessionUser = session ? await loadUserById(session.id) : null;
  const isManager = Boolean(
    sessionUser?.status === "ACTIVE" &&
    (sessionUser.appRole === "Admin" || sessionUser.appRole === "Staff") &&
    sessionUser.appRole === session?.role,
  );
  const supabase = getSupabaseAdminClient();
  try {
    if (supabase) {
      let query = supabase.from("properties").select("*");
      query = /^[0-9a-f-]{36}$/i.test(id) ? query.eq("id", id) : query.eq("slug", id);
      if (!isManager) query = query.eq("published", true);
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      if (data) return NextResponse.json(mapProperty(data));
    } else {
      const property = fallbackPropertyListings.find(
        (item) => (item.id === id || item.slug === id) && (isManager || item.published),
      );
      if (property) return NextResponse.json(mapProperty(property));
    }
  } catch (error) {
    console.error("Error fetching property:", error);
  }
  return NextResponse.json({ error: "Property not found" }, { status: 404 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(req, ["Admin", "Staff"]);
  if (!auth.allowed) return auth.response;
  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid property details" }, { status: 400 });
  const input = parsed.data;
  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    ...(input.title !== undefined && { title: input.title.trim() }),
    ...(input.slug !== undefined && { slug: slugify(input.slug || input.title || id) }),
    ...(input.description !== undefined && { description: input.description.trim() }),
    ...(input.propertyType !== undefined && { property_type: input.propertyType.trim() }),
    ...(input.listingType !== undefined && { listing_type: input.listingType.trim() }),
    ...(input.price !== undefined && { price: asNullableNumber(input.price) }),
    ...(input.currency !== undefined && { currency: input.currency.trim().toUpperCase() }),
    ...(input.location !== undefined && { location: input.location.trim() }),
    ...(input.address !== undefined && { address: asNullableString(input.address) }),
    ...(input.bedrooms !== undefined && { bedrooms: asNullableNumber(input.bedrooms) }),
    ...(input.bathrooms !== undefined && { bathrooms: asNullableNumber(input.bathrooms) }),
    ...(input.area !== undefined && { area: asNullableNumber(input.area) }),
    ...(input.areaUnit !== undefined && { area_unit: input.areaUnit.trim() }),
    ...(input.landSize !== undefined && { land_size: asNullableNumber(input.landSize) }),
    ...(input.furnished !== undefined && { furnished: input.furnished }),
    ...(input.featured !== undefined && { featured: input.featured }),
    ...(input.status !== undefined && { status: input.status.trim() }),
    ...(input.coverImageUrl !== undefined && { cover_image_url: asNullableString(input.coverImageUrl) }),
    ...(input.galleryImages !== undefined && { gallery_images: asStringArray(input.galleryImages) }),
    ...(input.contactName !== undefined && { contact_name: asNullableString(input.contactName) }),
    ...(input.contactPhone !== undefined && { contact_phone: asNullableString(input.contactPhone) }),
    ...(input.contactEmail !== undefined && { contact_email: asNullableString(input.contactEmail) }),
    ...(input.published !== undefined && { published: input.published }),
    updated_at: now,
  };
  const supabase = getSupabaseAdminClient();
  try {
    if (supabase) {
      const { data, error } = await supabase.from("properties").update(updates).eq("id", id).select().maybeSingle();
      if (error) throw error;
      if (data) {
        recordActivity({
          actorId: auth.session.id,
          actorName: auth.session.email,
          actorRole: auth.session.role,
          category: "CONTENT",
          action: input.published === true ? "PROPERTY_PUBLISHED" : input.published === false ? "PROPERTY_UNPUBLISHED" : input.featured === true ? "PROPERTY_FEATURED" : "PROPERTY_UPDATED",
          target: data.id,
          details: `Updated property: ${data.title}`,
        });
        return NextResponse.json(mapProperty(data));
      }
    } else {
      const index = fallbackPropertyListings.findIndex((item) => item.id === id || item.slug === id);
      if (index >= 0) {
        fallbackPropertyListings[index] = { ...fallbackPropertyListings[index], ...updates } as any;
        return NextResponse.json(mapProperty(fallbackPropertyListings[index]));
      }
    }
  } catch (error) {
    console.error("Error updating property:", error);
    if ((error as { code?: string })?.code === "23505") {
      return NextResponse.json({ error: "That property slug is already in use" }, { status: 409 });
    }
  }
  return NextResponse.json({ error: "Property not found" }, { status: 404 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(req, ["Admin", "Staff"]);
  if (!auth.allowed) return auth.response;
  const { id } = await params;
  const supabase = getSupabaseAdminClient();
  try {
    if (supabase) {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    } else {
      const index = fallbackPropertyListings.findIndex((item) => item.id === id || item.slug === id);
      if (index >= 0) fallbackPropertyListings.splice(index, 1);
    }
    recordActivity({
      actorId: auth.session.id,
      actorName: auth.session.email,
      actorRole: auth.session.role,
      category: "CONTENT",
      action: "PROPERTY_DELETED",
      target: id,
      details: `Deleted property: ${id}`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json({ error: "Unable to delete property" }, { status: 500 });
  }
}