import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/server/admin";
import { loadUserById, readSessionCookie, requireRole, recordActivity } from "@/lib/server/shared";

const articleSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  excerpt: z.string().default(""),
  content: z.string().min(1),
  category: z.string().min(2),
   cover_image_url: z.string().url().or(z.literal("")).nullable().optional(),
author: z.string().optional(),
read_time: z.number().int().positive().optional(),
  published: z.boolean().default(false),
});
function createSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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

  const search =
    req.nextUrl.searchParams.get("search")?.trim().toLowerCase() || "";

  const category =
    req.nextUrl.searchParams.get("category")?.trim() || "";

  const supabase = getSupabaseAdminClient();

  try {
    let query = supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!isManager) {
      query = query.eq("published", true);
    }

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching blog posts:", error);

      return NextResponse.json(
        { error: "Failed to fetch blog posts" },
        { status: 500 },
      );
    }

    let posts = data || [];

    if (search) {
      posts = posts.filter((post) =>
        [post.title, post.excerpt, post.content, post.category, post.author]
          .join(" ")
          .toLowerCase()
          .includes(search),
      );
    }

    return NextResponse.json({
      posts: posts.map(mapPost),
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['Admin', 'Staff']);

    if (!auth.allowed) {
      return auth.response;
    }

    const user = auth.session;

    const body = await req.json();
   const parsed = articleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid post data',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();
    const post = parsed.data;

    let slug = createSlug(post.title);

    const { data: existingPost } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    const published = post.published ?? false;

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title: post.title,
        slug,
        excerpt: post.excerpt ?? null,
        content: post.content,
        category: post.category,
       cover_image_url: post.cover_image_url || null,
        author: post.author || user.email,
        read_time: post.read_time || null,
        published,
        published_at: published ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating blog post:', error);

      return NextResponse.json(
        { error: 'Failed to create blog post' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { post: data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Blog POST error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}