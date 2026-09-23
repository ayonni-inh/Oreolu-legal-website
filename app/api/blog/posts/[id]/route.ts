import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdminClient } from '@/lib/server/admin';
import { requireRole } from '@/lib/server/shared';

const updatePostSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1).optional(),
  category: z.string().min(1).max(100).optional(),
  cover_image_url: z.string().url().or(z.literal("")).nullable().optional(),
author: z.string().optional(),
read_time: z.number().int().positive().optional(),
  published: z.boolean().optional(),
});

function createSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function getId(
  context: { params: Promise<{ id: string }> }
) {
  return context.params;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await getId(context);

    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching blog post:', error);

      return NextResponse.json(
        { error: 'Failed to fetch blog post' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ post: data });
  } catch (error) {
    console.error('Blog post GET error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(req, ['Admin', 'Staff']);

if (!auth.allowed) {
  return auth.response;
}

    const { id } = await getId(context);

    const body = await req.json();

    const parsed = updatePostSchema.safeParse(body);

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

    const updateData: Record<string, unknown> = {
      ...parsed.data,
      cover_image_url:
        parsed.data.cover_image_url || null,
      updated_at: new Date().toISOString(),
    };

    if (parsed.data.title) {
      updateData.slug = createSlug(parsed.data.title);
    }

    if (parsed.data.published === true) {
      updateData.published_at =
        new Date().toISOString();
    }

    if (parsed.data.published === false) {
      updateData.published_at = null;
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating blog post:', error);

      return NextResponse.json(
        { error: 'Failed to update blog post' },
        { status: 500 }
      );
    }

    return NextResponse.json({ post: data });
  } catch (error) {
    console.error('Blog post PATCH error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(req, ['Admin', 'Staff']);

if (!auth.allowed) {
  return auth.response;
}

    const { id } = await getId(context);

    const supabase = getSupabaseAdminClient();

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blog post:', error);

      return NextResponse.json(
        { error: 'Failed to delete blog post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Blog post DELETE error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}