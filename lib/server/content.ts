import crypto from "crypto";

export type BlogPostRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image_url: string | null;
  author: string;
  read_time: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PropertyListingRecord = {
  id: string;
  title: string;
  slug: string;
  description: string;
  property_type: string;
  listing_type: string;
  price: number | null;
  currency: string;
  location: string;
  address: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  area_unit: string;
  land_size: number | null;
  furnished: boolean;
  featured: boolean;
  status: string;
  cover_image_url: string | null;
  gallery_images: string[];
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export const fallbackBlogPosts: BlogPostRecord[] = [];
export const fallbackPropertyListings: PropertyListingRecord[] = [];

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || `content-${Date.now()}`;
}

export function newContentId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function asNullableString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export function asNullableNumber(value: unknown) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}