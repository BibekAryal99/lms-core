'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { blogAPI } from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function BlogPostPage() {
  const params = useParams();
  const documentId = params.documentId as string;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await blogAPI.getOne(documentId);
        setPost(res.data.data);
      } catch (err) {
        console.error('Failed to fetch post:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [documentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-500">
          Post not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <article className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/blog" className="text-indigo-600 hover:text-indigo-700 text-sm mb-6 inline-block">
          ← Back to Blog
        </Link>

        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-64 object-cover rounded-xl mb-8"
          />
        )}

        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center text-sm text-gray-500 mb-8">
          <span>By {post.author?.username || 'Unknown'}</span>
          <span className="mx-2">•</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {post.body}
          </p>
        </div>
      </article>
    </div>
  );
}
