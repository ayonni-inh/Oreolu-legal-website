'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, Clock, Link as LinkIcon, Loader2, RefreshCw, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl?: string;
  cover_image_url?: string | null;
  author: string;
  date: string;
  readTime: string;
  published_at?: string | null;
};

export default function Blog({ slug }: { slug?: string }) {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(Boolean(slug));
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/blog/posts');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load articles');
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (err) {
      console.error(err);
      setError('Unable to load published articles right now.');
    } finally {
      setLoading(false);
    }
  };

  const loadPost = async (postSlug: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/blog/posts/${encodeURIComponent(postSlug)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Article not found');
      setSelectedPost({
        ...data,
        imageUrl: data.cover_image_url || data.imageUrl || '',
        date: data.published_at || data.created_at,
        readTime: data.read_time || data.readTime,
      });
    } catch (err) {
      console.error(err);
      setError('This article is unavailable or is no longer published.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) loadPost(slug);
    else loadPosts();
  }, [slug]);

  const openPost = (post: BlogPost) => router.push(`/blog/${post.slug}`);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  if (slug) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 mb-8">
            <button onClick={() => router.push('/blog')} className="flex items-center gap-2 text-sm font-bold text-navy hover:text-gold"><ArrowLeft className="w-4 h-4" /> Back to Articles</button>
            <button onClick={copyLink} className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600">{copied ? <Check className="w-4 h-4 text-emerald-600" /> : <LinkIcon className="w-4 h-4" />}{copied ? 'Copied' : 'Copy Link'}</button>
          </div>
          {loading ? <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div> : error ? <div className="bg-red-50 text-red-700 rounded-2xl p-6 text-center">{error}</div> : selectedPost ? (
            <article className="bg-white rounded-3xl shadow-sm overflow-hidden">
              {selectedPost.imageUrl && <img src={selectedPost.imageUrl} alt={selectedPost.title} className="w-full h-72 md:h-96 object-cover" referrerPolicy="no-referrer" />}
              <div className="p-7 md:p-12">
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6"><span className="rounded-full bg-navy/5 text-navy px-3 py-1 font-bold">{selectedPost.category}</span><span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(selectedPost.date).toLocaleDateString()}</span><span className="flex items-center gap-1"><Clock className="w-4 h-4" />{selectedPost.readTime}</span></div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight text-navy mb-4">{selectedPost.title}</h1>
                <p className="text-sm text-gray-500 mb-10">By {selectedPost.author}</p>
                <div className="prose prose-lg max-w-none text-gray-700">{selectedPost.content.split(/\n{2,}/).map((paragraph, index) => <p key={index} className="mb-6 leading-relaxed whitespace-pre-line">{paragraph}</p>)}</div>
              </div>
            </article>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-12">
          <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-gold mb-3">Original OGA content</p><h1 className="text-4xl font-serif font-bold text-navy mb-3">Blog &amp; Legal News</h1><p className="text-lg text-gray-600 max-w-2xl">Practical legal updates and insights from OROELU GODWIN AGIDI &amp; CO.</p></div>
          <button onClick={loadPosts} disabled={loading} className="flex items-center gap-2 text-sm font-bold text-navy hover:text-gold disabled:opacity-50"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
        </div>
        {loading ? <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div> : error ? <div className="bg-red-50 text-red-700 rounded-2xl p-6 text-center">{error}<button onClick={loadPosts} className="block mx-auto mt-3 underline font-bold">Try again</button></div> : posts.length === 0 ? <div className="bg-white rounded-2xl p-12 text-center text-gray-500">No published articles are available yet.</div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">{posts.map((post) => <article key={post.id} onClick={() => openPost(post)} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer group flex flex-col">{post.imageUrl && <img src={post.imageUrl} alt={post.title} className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />}<div className="p-6 flex-1 flex flex-col"><span className="text-xs font-bold text-gold uppercase tracking-wider mb-3">{post.category}</span><h2 className="text-xl font-serif font-bold text-navy mb-3 group-hover:text-gold">{post.title}</h2><p className="text-sm text-gray-600 line-clamp-3 flex-1">{post.excerpt}</p><div className="flex items-center justify-between mt-6 text-xs text-gray-500"><span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(post.date).toLocaleDateString()}</span><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTime}</span></div><div className="flex items-center gap-1 text-sm font-bold text-gold mt-5">Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></div></div></article>)}</div>}
      </div>
    </div>
  );
}