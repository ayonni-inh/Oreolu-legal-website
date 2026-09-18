import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/server/admin";
import {
  fallbackBlogPosts,
  newContentId,
  slugify,
} from "@/lib/server/content";
import { loadUserById, readSessionCookie, requireRole, recordActivity } from "@/lib/server/shared";

const articleSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  excerpt: z.string().default(""),
  content: z.string().min(1),
  category: z.string().min(2),
  coverImageUrl: z.string().url().or(z.literal("")).nullable().optional(),
  author: z.string().min(2),
  readTime: z.string().min(2),
  published: z.boolean().default(false),
});

function mapPost(post: any) {
  return {
    ...post,
    imageUrl: post.cover_image_url || post.imageUrl || "",
    date: post.published_at || post.created_at,
    readTime: post.read_time || post.readTime,
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
  const search = req.nextUrl.searchParams.get("search")?.trim().toLowerCase() || "";
  const category = req.nextUrl.searchParams.get("category")?.trim() || "";
  const supabase = getSupabaseAdminClient();

  try {
    let posts: any[] = [];
    if (supabase) {
      let query = supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      if (!isManager) query = query.eq("published", true);
      if (category) query = query.eq("category", category);
      const { data, error } = await query;
      if (error) throw error;
      posts = data || [];
    } else {
      posts = fallbackBlogPosts.filter(
        (post) =>
          (isManager || post.published) &&
          (!category || post.category === category),
      );
    }

    if (search) {
      posts = posts.filter((post) =>
        [post.title, post.excerpt, post.content, post.category, post.author]
          .join(" ")
          .toLowerCase()
          .includes(search),
      );
    }
    return NextResponse.json({ posts: posts.map(mapPost) });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json({
      posts: fallbackBlogPosts
        .filter((post) => isManager || post.published)
        .filter((post) => !category || post.category === category)
        .filter((post) => !search || `${post.title} ${post.excerpt}`.toLowerCase().includes(search))
        .map(mapPost),
    });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ['Admin', 'Staff']);

if (!auth.allowed) {
  return auth.response;
}

const user = auth.session;
  const parsed = articleSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid article details" }, { status: 400 });
  const input = parsed.data;
  const now = new Date().toISOString();
  const post = {
    title: input.title.trim(),
    slug: slugify(input.slug || input.title),
    excerpt: input.excerpt.trim(),
    content: input.content.trim(),
    category: input.category.trim(),
    cover_image_url: input.coverImageUrl || null,
    author: input.author.trim(),
    read_time: input.readTime.trim(),
    published: input.published,
    published_at: input.published ? now : null,
    created_at: now,
    updated_at: now,
  };
  const supabase = getSupabaseAdminClient();

  try {
    if (supabase) {
      const { data, error } = await supabase.from("blog_posts").insert(post).select().single();
      if (error) throw error;
      recordActivity({
        actorId: auth.session.id,
        actorName: auth.session.email,
        actorRole: auth.session.role,
        category: "CONTENT",
        action: input.published ? "BLOG_ARTICLE_PUBLISHED" : "BLOG_ARTICLE_DRAFTED",
        target: data.id,
        details: `${input.published ? "Published" : "Saved draft"} article: ${input.title}`,
      });
      return NextResponse.json(data, { status: 201 });
    }
    const fallback = { id: newContentId("blog"), ...post };
    fallbackBlogPosts.unshift(fallback);
    recordActivity({
      actorId: auth.session.id,
      actorName: auth.session.email,
      actorRole: auth.session.role,
      category: "CONTENT",
      action: input.published ? "BLOG_ARTICLE_PUBLISHED" : "BLOG_ARTICLE_DRAFTED",
      target: fallback.id,
      details: `${input.published ? "Published" : "Saved draft"} article: ${input.title}`,
    });
    return NextResponse.json(fallback, { status: 201 });
  } catch (error) {
    console.error("Error creating blog post:", error);
    if ((error as { code?: string })?.code === "23505") {
      return NextResponse.json({ error: "That article slug is already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to save article. Check that the blog_posts table exists." }, { status: 500 });
  }
}
