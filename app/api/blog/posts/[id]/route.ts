import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/server/admin";
import {
  BlogPostRecord,
  fallbackBlogPosts,
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
  excerpt: z.string().optional(),
  content: z.string().optional(),
  category: z.string().min(2).optional(),
  coverImageUrl: z.string().url().or(z.literal("")).nullable().optional(),
  author: z.string().min(2).optional(),
  readTime: z.string().min(2).optional(),
  published: z.boolean().optional(),
});

async function canManage(req: NextRequest) {
  return requireRole(req, ["Admin", "Staff"]);
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
      let query = supabase.from("blog_posts").select("*");
      query = /^[0-9a-f-]{36}$/i.test(id) ? query.eq("id", id) : query.eq("slug", id);
      if (!isManager) query = query.eq("published", true);
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      if (data) return NextResponse.json(data);
    } else {
      const post = fallbackBlogPosts.find(
        (item) => (item.id === id || item.slug === id) && (isManager || item.published),
      );
      if (post) return NextResponse.json(post);
    }
  } catch (error) {
    console.error("Error fetching blog post:", error);
  }

  return NextResponse.json({ error: "Article not found" }, { status: 404 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await canManage(req);
  if (!auth.allowed) return auth.response;
  const { id } = await params;

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid article details" }, { status: 400 });
  }

  const input = parsed.data;
  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    ...(input.title !== undefined && { title: input.title.trim() }),
    ...(input.slug !== undefined && { slug: slugify(input.slug || input.title || id) }),
    ...(input.excerpt !== undefined && { excerpt: input.excerpt.trim() }),
    ...(input.content !== undefined && { content: input.content.trim() }),
    ...(input.category !== undefined && { category: input.category.trim() }),
    ...(input.coverImageUrl !== undefined && { cover_image_url: input.coverImageUrl || null }),
    ...(input.author !== undefined && { author: input.author.trim() }),
    ...(input.readTime !== undefined && { read_time: input.readTime.trim() }),
    ...(input.published !== undefined && {
      published: input.published,
      published_at: input.published ? now : null,
    }),
    updated_at: now,
  };

  const supabase = getSupabaseAdminClient();
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("blog_posts")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error) throw error;
      if (data) {
        recordActivity({
          actorId: auth.session.id,
          actorName: auth.session.email,
          actorRole: auth.session.role,
          category: "CONTENT",
          action: input.published === true ? "BLOG_ARTICLE_PUBLISHED" : input.published === false ? "BLOG_ARTICLE_UNPUBLISHED" : "BLOG_ARTICLE_UPDATED",
          target: data.id,
          details: `Updated article: ${data.title}`,
        });
        return NextResponse.json(data);
      }
    } else {
      const index = fallbackBlogPosts.findIndex((item) => item.id === id || item.slug === id);
      if (index >= 0) {
        fallbackBlogPosts[index] = { ...fallbackBlogPosts[index], ...updates } as BlogPostRecord;
        return NextResponse.json(fallbackBlogPosts[index]);
      }
    }
  } catch (error) {
    console.error("Error updating blog post:", error);
    if ((error as { code?: string })?.code === "23505") {
      return NextResponse.json({ error: "That article slug is already in use" }, { status: 409 });
    }
  }

  return NextResponse.json({ error: "Article not found" }, { status: 404 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await canManage(req);
  if (!auth.allowed) return auth.response;
  const { id } = await params;
  const supabase = getSupabaseAdminClient();

  try {
    if (supabase) {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    } else {
      const index = fallbackBlogPosts.findIndex((item) => item.id === id || item.slug === id);
      if (index >= 0) fallbackBlogPosts.splice(index, 1);
    }
    recordActivity({
      actorId: auth.session.id,
      actorName: auth.session.email,
      actorRole: auth.session.role,
      category: "CONTENT",
      action: "BLOG_ARTICLE_DELETED",
      target: id,
      details: `Deleted article: ${id}`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json({ error: "Unable to delete article" }, { status: 500 });
  }
}