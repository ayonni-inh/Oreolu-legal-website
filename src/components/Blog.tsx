import { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowRight, Loader2, RefreshCw, ChevronLeft, Link, Check } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  category: string;
  imageUrl: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/blog/posts');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("Failed to load the latest legal news. Please try again later.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setSelectedPost(null)}
              className="flex items-center text-navy hover:text-gold transition-colors font-medium"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Articles
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-navy transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Link className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>

          <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <img
              src={selectedPost.imageUrl}
              alt={selectedPost.title}
              className="w-full h-80 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <span className="bg-navy/5 text-navy px-3 py-1 rounded-full font-medium">
                  {selectedPost.category}
                </span>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  {selectedPost.date}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {selectedPost.readTime}
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-serif font-bold text-navy mb-8 leading-tight">
                {selectedPost.title}
              </h1>

              <div className="prose prose-xl max-w-none text-gray-700">
                {selectedPost.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-8 leading-loose text-lg md:text-xl">{paragraph}</p>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h1 className="text-4xl font-serif font-bold text-navy mb-4">Legal Insights & News</h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Stay informed with the latest legal developments worldwide, with a focus on Africa and Nigeria.
            </p>
          </div>
          <button
            onClick={fetchNews}
            disabled={loading}
            className="mt-6 md:mt-0 flex items-center gap-2 text-navy hover:text-gold transition-colors font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh News
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Curating the latest legal news...</p>
          </div>
        ) : error && posts.length === 0 ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center">
            <p>{error}</p>
            <button
              onClick={fetchNews}
              className="mt-4 bg-red-100 hover:bg-red-200 text-red-700 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col cursor-pointer group"
                onClick={() => setSelectedPost(post)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-navy">
                    {post.category}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {post.date}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {post.readTime}
                    </div>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-navy mb-3 line-clamp-2 group-hover:text-gold transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center text-gold font-medium text-sm mt-auto">
                    Read Article
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
