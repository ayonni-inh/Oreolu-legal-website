import type { Metadata } from "next";
import PropertyDetails from "@/src/components/PropertyDetails";
import { getSupabaseAdminClient } from "@/lib/server/admin";

type PropertyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;

  let title = "Property Advertisement";
  let description =
    "Property advertisement from OROELU GODWIN AGIDI & CO.";
  let image: string | undefined;

  try {
    const client = getSupabaseAdminClient();

    if (client) {
      const { data } = await client
        .from("properties")
        .select(
          "title, description, location, price, currency, cover_image_url, published",
        )
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();

      if (data) {
        title = data.title;
        description = `${data.description || "Property advertisement"} ${
          data.location ? `Located in ${data.location}.` : ""
        }`.trim();
        image = data.cover_image_url || undefined;
      }
    }
  } catch (error) {
    console.error("Error generating property metadata:", error);
  }

  return {
    title: `${title} | OROELU GODWIN AGIDI & CO`,
    description,
    alternates: {
      canonical: `/properties/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function PropertyPage({
  params,
}: PropertyPageProps) {
  const { slug } = await params;

  return <PropertyDetails id={slug} />;
}