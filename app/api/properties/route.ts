import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/server/admin";
import {
  fallbackPropertyListings,
  newContentId,
  slugify,
  asNullableNumber,
  asNullableString,
  asStringArray,
} from "@/lib/server/content";
import { loadUserById, readSessionCookie, requireRole, recordActivity } from "@/lib/server/shared";

const propertySchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  description: z.string().min(1),
  propertyType: z.string().min(2),
  listingType: z.string().min(2),
  price: z.union([z.number(), z.string(), z.null()]).optional(),
  currency: z.string().min(3).default("NGN"),
  location: z.string().min(2),
  address: z.string().nullable().optional(),
  bedrooms: z.union([z.number(), z.string(), z.null()]).optional(),
  bathrooms: z.union([z.number(), z.string(), z.null()]).optional(),
  area: z.union([z.number(), z.string(), z.null()]).optional(),
  areaUnit: z.string().default("sqm"),
  landSize: z.union([z.number(), z.string(), z.null()]).optional(),
  furnished: z.boolean().default(false),
  featured: z.boolean().default(false),
  status: z.string().default("Available"),
  coverImageUrl: z.string().url().or(z.literal("")).nullable().optional(),
  galleryImages: z.array(z.string().url()).default([]),
  contactName: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  contactEmail: z.string().email().or(z.literal("")).nullable().optional(),
  published: z.boolean().default(false),
});

function mapProperty(item: any) {
  return {
    ...item,
    propertyType: item.property_type,
    listingType: item.listing_type,
    areaUnit: item.area_unit,
    coverImageUrl: item.cover_image_url,
    galleryImages: item.gallery_images || [],
    contactName: item.contact_name,
    contactPhone: item.contact_phone,
    contactEmail: item.contact_email,
  };
}

function toRecord(input: z.infer<typeof propertySchema>, now: string) {
  return {
    title: input.title.trim(),
    slug: slugify(input.slug || input.title),
    description: input.description.trim(),
    property_type: input.propertyType.trim(),
    listing_type: input.listingType.trim(),
    price: asNullableNumber(input.price),
    currency: input.currency.trim().toUpperCase(),
    location: input.location.trim(),
    address: asNullableString(input.address),
    bedrooms: asNullableNumber(input.bedrooms),
    bathrooms: asNullableNumber(input.bathrooms),
    area: asNullableNumber(input.area),
    area_unit: input.areaUnit.trim(),
    land_size: asNullableNumber(input.landSize),
    furnished: input.furnished,
    featured: input.featured,
    status: input.status.trim(),
    cover_image_url: asNullableString(input.coverImageUrl),
    gallery_images: asStringArray(input.galleryImages),
    contact_name: asNullableString(input.contactName),
    contact_phone: asNullableString(input.contactPhone),
    contact_email: asNullableString(input.contactEmail),
    published: input.published,
    published_at: input.published ? now : null,
    created_at: now,
    updated_at: now,
  };
}

export async function GET(req: NextRequest) {
  const session = readSessionCookie(req);
  const sessionUser = session ? await loadUserById(session.id) : null;
  const isManager = Boolean(
    sessionUser?.status === "ACTIVE" &&
    (sessionUser.appRole === "Admin" || sessionUser.appRole === "Staff") &&
    sessionUser.appRole === session?.role,
  );
  const params = req.nextUrl.searchParams;
  const search = params.get("search")?.trim().toLowerCase() || "";
  const type = params.get("propertyType")?.trim() || "";
  const listing = params.get("listingType")?.trim() || "";
  const status = params.get("status")?.trim() || "";
  const supabase = getSupabaseAdminClient();

  try {
    let properties: any[] = [];
    if (supabase) {
      let query = supabase.from("property_listings").select("*").order("featured", { ascending: false }).order("created_at", { ascending: false });
      if (!isManager) query = query.eq("published", true);
      if (type) query = query.eq("property_type", type);
      if (listing) query = query.eq("listing_type", listing);
      if (status) query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw error;
      properties = data || [];
    } else {
      properties = fallbackPropertyListings.filter(
        (item) =>
          (isManager || item.published) &&
          (!type || item.property_type === type) &&
          (!listing || item.listing_type === listing) &&
          (!status || item.status === status),
      );
    }
    if (search) {
      properties = properties.filter((item) =>
        [item.title, item.description, item.location, item.property_type, item.listing_type]
          .join(" ")
          .toLowerCase()
          .includes(search),
      );
    }
    return NextResponse.json({ properties: properties.map(mapProperty) });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json({
      properties: fallbackPropertyListings
        .filter((item) => isManager || item.published)
        .map(mapProperty),
    });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["Admin", "Staff"]);
  if (!auth.allowed) return auth.response;
  const parsed = propertySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid property details" }, { status: 400 });
  const now = new Date().toISOString();
  const record = toRecord(parsed.data, now);
  const supabase = getSupabaseAdminClient();

  try {
    if (supabase) {
      const { data, error } = await supabase.from("property_listings").insert(record).select().single();
      if (error) throw error;
      recordActivity({
        actorId: auth.session.id,
        actorName: auth.session.email,
        actorRole: auth.session.role,
        category: "CONTENT",
        action: parsed.data.published ? "PROPERTY_PUBLISHED" : "PROPERTY_DRAFTED",
        target: data.id,
        details: `${parsed.data.published ? "Published" : "Saved draft"} property: ${parsed.data.title}`,
      });
      return NextResponse.json(data, { status: 201 });
    }
    const fallback = { id: newContentId("property"), ...record };
    fallbackPropertyListings.unshift(fallback);
    recordActivity({
      actorId: auth.session.id,
      actorName: auth.session.email,
      actorRole: auth.session.role,
      category: "CONTENT",
      action: parsed.data.published ? "PROPERTY_PUBLISHED" : "PROPERTY_DRAFTED",
      target: fallback.id,
      details: `${parsed.data.published ? "Published" : "Saved draft"} property: ${parsed.data.title}`,
    });
    return NextResponse.json(fallback, { status: 201 });
  } catch (error) {
    console.error("Error creating property:", error);
    if ((error as { code?: string })?.code === "23505") {
      return NextResponse.json({ error: "That property slug is already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to save property. Check that the property_listings table exists." }, { status: 500 });
  }
}