import type { Metadata } from "next";
import Portal from "@/app/components/Portal";
import { getSupabaseAdminClient } from "@/lib/server/admin";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  let title = "Legal Article";
  let description = "Legal insights from OROELU GODWIN AGIDI & CO.";
  let image: string | undefined;
  try {
    const client = getSupabaseAdminClient();
    if (client) {
      const { data } = await client.from("blog_posts").select("title, excerpt, cover_image_url, published").eq("slug", slug).eq("published", true).maybeSingle();
      if (data) {
        title = data.title;
        description = data.excerpt || description;
        image = data.cover_image_url || undefined;
      }
    }
  } catch (error) {
    console.error("Error generating blog metadata:", error);
  }
  return {
    title: `${title} | OROELU GODWIN AGIDI & CO`,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { title, description, type: "article", ...(image ? { images: [image] } : {}) },
  };
}

export default function BlogArticlePage() {
  return <Portal />;
}