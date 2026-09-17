'use client';

import { useEffect, useMemo, useState } from 'react';
import { FileText, Pencil, Plus, Search, Trash2, X, CheckCircle2 } from 'lucide-react';

const categories = [
  'Legal News', 'Corporate Law', 'Technology Law', 'Employment Law',
  'Immigration', 'Human Rights', 'Property Law', 'Family Law',
  'Litigation', 'Business Law',
];

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image_url?: string | null;
  author: string;
  read_time: string;
  published: boolean;
  published_at?: string | null;
  created_at: string;
};

const emptyArticle = {
  title: '',
  slug: '',
  category: 'Legal News',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  author: 'OGA Solicitors',
  readTime: '5 min read',
  published: false,
};

export default function AdminBlogManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [form, setForm] = useState(emptyArticle);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      const response = await fetch(`/api/blog/posts?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load articles');
      setArticles(Array.isArray(data.posts) ? data.posts : []);
    } catch (error) {
      console.error(error);
      setNotice({ text: 'Unable to load the article library.', error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [category]);

  const filteredArticles = useMemo(() => {
    if (!search) return articles;
    const query = search.toLowerCase();
    return articles.filter((article) =>
      `${article.title} ${article.excerpt} ${article.author}`.toLowerCase().includes(query),
    );
  }, [articles, search]);

  const updateField = (field: keyof typeof emptyArticle, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const startEdit = (article: Article) => {
    setEditingId(article.id);
    setForm({
      title: article.title,
      slug: article.slug,
      category: article.category,
      excerpt: article.excerpt || '',
      content: article.content || '',
      coverImageUrl: article.cover_image_url || '',
      author: article.author,
      readTime: article.read_time,
      published: article.published,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyArticle);
  };

  const saveArticle = async (published: boolean) => {
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch(editingId ? `/api/blog/posts/${editingId}` : '/api/blog/posts', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, published }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save article');
      setNotice({ text: published ? 'Article published successfully.' : 'Draft saved successfully.' });
      resetForm();
      await loadArticles();
    } catch (error) {
      console.error(error);
      setNotice({ text: error instanceof Error ? error.message : 'Unable to save article.', error: true });
    } finally {
      setSaving(false);
    }
  };

  const deleteArticle = async (id: string) => {
    if (!window.confirm('Delete this article permanently?')) return;
    try {
      const response = await fetch(`/api/blog/posts/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Unable to delete article');
      setNotice({ text: 'Article deleted.' });
      if (editingId === id) resetForm();
      await loadArticles();
    } catch (error) {
      console.error(error);
      setNotice({ text: 'Unable to delete article.', error: true });
    }
  };

  const togglePublished = async (article: Article) => {
    try {
      const response = await fetch(`/api/blog/posts/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !article.published }),
      });
      if (!response.ok) throw new Error('Unable to update publication status');
      await loadArticles();
    } catch (error) {
      console.error(error);
      setNotice({ text: 'Unable to update publication status.', error: true });
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center"><FileText className="w-5 h-5" /></div>
            <h3 className="font-serif text-2xl font-bold text-navy">Blog &amp; Legal News</h3>
          </div>
          <p className="text-sm text-gray-500">Create original OGA content, save drafts, and publish approved articles.</p>
        </div>
        {notice && <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${notice.error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{notice.text}</div>}
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 md:p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <h4 className="font-bold text-navy">{editingId ? 'Edit Article' : 'New Article'}</h4>
          {editingId && <button onClick={resetForm} className="text-xs font-bold text-gray-500 hover:text-navy flex items-center gap-1"><X className="w-3 h-3" /> Cancel edit</button>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="md:col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Article title
            <input value={form.title} onChange={(e) => updateField('title', e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-gold" placeholder="Enter the article title" />
          </label>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category
            <select value={form.category} onChange={(e) => updateField('category', e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gold">{categories.map((item) => <option key={item}>{item}</option>)}</select>
          </label>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Read time
            <input value={form.readTime} onChange={(e) => updateField('readTime', e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gold" placeholder="5 min read" />
          </label>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Author
            <input value={form.author} onChange={(e) => updateField('author', e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gold" />
          </label>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cover image URL
            <input value={form.coverImageUrl} onChange={(e) => updateField('coverImageUrl', e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gold" placeholder="https://..." />
          </label>
          <label className="md:col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Short excerpt
            <textarea value={form.excerpt} onChange={(e) => updateField('excerpt', e.target.value)} rows={2} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gold" placeholder="A concise summary for the article card" />
          </label>
          <label className="md:col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Full article content
            <textarea value={form.content} onChange={(e) => updateField('content', e.target.value)} rows={8} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gold" placeholder="Write the full article content..." />
          </label>
        </div>
        <div className="flex flex-wrap justify-end gap-3 mt-5">
          {editingId && <button onClick={resetForm} className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-white">Cancel</button>}
          <button disabled={saving} onClick={() => saveArticle(false)} className="px-5 py-3 rounded-xl border border-navy text-sm font-bold text-navy hover:bg-white disabled:opacity-50"><Plus className="w-4 h-4 inline mr-2" />Save Draft</button>
          <button disabled={saving} onClick={() => saveArticle(true)} className="px-5 py-3 rounded-xl bg-navy text-white text-sm font-bold hover:bg-navy-light disabled:opacity-50"><CheckCircle2 className="w-4 h-4 inline mr-2" />{editingId ? 'Update & Publish' : 'Publish Article'}</button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadArticles()} placeholder="Search articles..." className="w-full rounded-xl border border-gray-200 px-10 py-3 text-sm outline-none focus:border-gold" /></div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold"><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
      </div>

      <div className="border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 bg-gray-50 flex justify-between items-center"><span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Article library</span><span className="text-xs text-gray-400">{filteredArticles.length} article{filteredArticles.length === 1 ? '' : 's'}</span></div>
        {loading ? <div className="p-10 text-center text-gray-500 text-sm">Loading articles...</div> : filteredArticles.length === 0 ? <div className="p-10 text-center text-gray-500 text-sm">No articles yet. Create a draft above to begin.</div> : (
          <div className="divide-y divide-gray-100">{filteredArticles.map((article) => (
            <div key={article.id} className="p-5 flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2 mb-1"><h5 className="font-bold text-navy truncate">{article.title}</h5><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${article.published ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{article.published ? 'Published' : 'Draft'}</span></div><p className="text-xs text-gray-500">{article.category} · {article.author} · {new Date(article.published_at || article.created_at).toLocaleDateString()}</p></div>
              <div className="flex items-center gap-2"><button onClick={() => togglePublished(article)} className="px-3 py-2 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:border-gold">{article.published ? 'Unpublish' : 'Publish'}</button><button onClick={() => startEdit(article)} className="p-2 rounded-lg text-navy hover:bg-navy/5" title="Edit"><Pencil className="w-4 h-4" /></button><button onClick={() => deleteArticle(article.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50" title="Delete"><Trash2 className="w-4 h-4" /></button></div>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}