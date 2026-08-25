'use client';

import { useEffect, useState } from 'react';
import { blogAPI } from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await blogAPI.getAll({
          filters: { publishedAt: { $notNull: true } },
          populate: ['author'],
          sort: 'createdAt:desc',
        });
        setPosts(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch blog posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No blog posts yet.</div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <Link
                key={post.documentId}
                href={`/blog/${post.documentId}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                {post.coverImage && (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-2 hover:text-indigo-600">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 line-clamp-3 mb-4">{post.body}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>By {post.author?.username || 'Unknown'}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
