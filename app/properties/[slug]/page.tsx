import type { Metadata } from "next";
import Portal from "@/app/components/Portal";
import { getSupabaseAdminClient } from "@/lib/server/admin";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  let title = "Property Advertisement";
  let description = "Property advertisement from OROELU GODWIN AGIDI & CO.";
  let image: string | undefined;
  try {
    const client = getSupabaseAdminClient();
    if (client) {
      const { data } = await client.from("property_listings").select("title, description, location, price, currency, cover_image_url, published").eq("slug", slug).eq("published", true).maybeSingle();
      if (data) {
        title = data.title;
        description = `${data.description || "Property advertisement"} ${data.location ? `Located in ${data.location}.` : ""}`.trim();
        image = data.cover_image_url || undefined;
      }
    }
  } catch (error) {
    console.error("Error generating property metadata:", error);
  }
  return {
    title: `${title} | OROELU GODWIN AGIDI & CO`,
    description,
    alternates: { canonical: `/properties/${slug}` },
    openGraph: { title, description, type: "website", ...(image ? { images: [image] } : {}) },
  };
}

export default function PropertyDetailPage() {
  return <Portal />;
}