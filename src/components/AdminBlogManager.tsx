'use client';

import { useEffect, useState } from 'react';

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  cover_image_url: string | null;
  author: string | null;
  read_time: number | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const emptyForm = {
  title: '',
  excerpt: '',
  content: '',
  category: 'Legal News',
  cover_image_url: '',
  author: '',
  read_time: 5,
  published: false,
};

export default function AdminBlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function loadPosts() {
    try {
      setLoading(true);

      const response = await fetch('/api/blog/posts?admin=true');

      if (!response.ok) {
        throw new Error('Failed to load posts');
      }

      const data = await response.json();
      setPosts(data.posts ?? []);
    } catch (error) {
      console.error(error);
      setMessage('Unable to load blog posts.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  function updateField(
    field: keyof typeof emptyForm,
    value: string | number | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function savePost(publish: boolean) {
    try {
      setSaving(true);
      setMessage('');

      const payload = {
        ...form,
        published: publish,
      };

      const response = await fetch(
        editingId
          ? `/api/blog/posts/${editingId}`
          : '/api/blog/posts',
        {
          method: editingId ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save post');
      }

      setMessage(
        publish
          ? 'Article published successfully.'
          : 'Draft saved successfully.'
      );

      resetForm();
      await loadPosts();
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error
          ? error.message
          : 'Failed to save article.'
      );
    } finally {
      setSaving(false);
    }
  }

  function editPost(post: BlogPost) {
    setEditingId(post.id);

    setForm({
      title: post.title,
      excerpt: post.excerpt ?? '',
      content: post.content,
      category: post.category,
      cover_image_url: post.cover_image_url ?? '',
      author: post.author ?? '',
      read_time: post.read_time ?? 5,
      published: post.published,
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  async function deletePost(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this article?'
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/blog/posts/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete post');
      }

      setMessage('Article deleted.');
      await loadPosts();
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error
          ? error.message
          : 'Failed to delete article.'
      );
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-navy">
          Blog & Legal News
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Create and manage OGA Solicitors articles and legal updates.
        </p>
      </div>

      {message && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          {message}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-navy">
              {editingId ? 'Edit Article' : 'Create Article'}
            </h3>

            <p className="text-sm text-gray-500">
              Write an original legal article for the OGA website.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm font-semibold text-gray-500 hover:text-navy"
            >
              Cancel editing
            </button>
          )}
        </div>

        <div className="grid gap-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Article title
            </label>

            <input
              value={form.title}
              onChange={(e) =>
                updateField('title', e.target.value)
              }
              placeholder="Enter article title"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-navy"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category
              </label>

              <select
                value={form.category}
                onChange={(e) =>
                  updateField('category', e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-navy"
              >
                <option>Legal News</option>
                <option>Corporate Law</option>
                <option>Technology Law</option>
                <option>Employment Law</option>
                <option>Immigration</option>
                <option>Human Rights</option>
                <option>Property Law</option>
                <option>Family Law</option>
                <option>Litigation</option>
                <option>Business Law</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Read time (minutes)
              </label>

              <input
                type="number"
                min="1"
                value={form.read_time}
                onChange={(e) =>
                  updateField(
                    'read_time',
                    Number(e.target.value)
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-navy"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Short excerpt
            </label>

            <textarea
              value={form.excerpt}
              onChange={(e) =>
                updateField('excerpt', e.target.value)
              }
              rows={3}
              placeholder="Brief summary of the article..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-navy"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Article content
            </label>

            <textarea
              value={form.content}
              onChange={(e) =>
                updateField('content', e.target.value)
              }
              rows={14}
              placeholder="Write the full article..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm outline-none focus:border-navy"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Cover image URL
            </label>

            <input
              value={form.cover_image_url}
              onChange={(e) =>
                updateField(
                  'cover_image_url',
                  e.target.value
                )
              }
              placeholder="https://..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-navy"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Author
            </label>

            <input
              value={form.author}
              onChange={(e) =>
                updateField('author', e.target.value)
              }
              placeholder="OGA Solicitors"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-navy"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => savePost(false)}
              className="rounded-lg border border-navy px-5 py-3 text-sm font-bold text-navy hover:bg-gray-50 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => savePost(true)}
              className="rounded-lg bg-navy px-5 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Publish Article'}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
        <h3 className="text-lg font-bold text-navy">
  Articles & Drafts
</h3>

<p className="text-sm text-gray-500">
  Manage published articles and unpublished drafts.
</p>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">
            Loading articles...
          </p>
        ) : posts.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-8 text-center">
            <p className="font-semibold text-gray-600">
              No articles or drafts yet.
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Create your first article above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col gap-4 rounded-xl border border-gray-200 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">
                      {post.category}
                    </span>

                    {post.published && (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                        Published
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-navy">
                    {post.title}
                  </h4>

                  <p className="mt-1 text-sm text-gray-500">
                    {post.excerpt || 'No excerpt'}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => editPost(post)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deletePost(post.id)}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}