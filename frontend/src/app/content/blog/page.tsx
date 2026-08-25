'use client';

import { useEffect, useState } from 'react';
import { blogAPI } from '@/lib/api';

export default function ContentBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', body: '', coverImage: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await blogAPI.getAll({ populate: ['author'], sort: 'createdAt:desc' });
      setPosts(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await blogAPI.create({ ...newPost, publishedAt: new Date().toISOString() });
      setNewPost({ title: '', body: '', coverImage: '' });
      setShowCreate(false);
      fetchPosts();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to create post');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await blogAPI.create(newPost);
      setNewPost({ title: '', body: '', coverImage: '' });
      setShowCreate(false);
      fetchPosts();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to create draft');
    } finally {
      setCreating(false);
    }
  };

  const handlePublish = async (documentId: string) => {
    try {
      await blogAPI.update(documentId, { publishedAt: new Date().toISOString() });
      fetchPosts();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to publish');
    }
  };

  const handleUnpublish = async (documentId: string) => {
    try {
      await blogAPI.update(documentId, { publishedAt: null });
      fetchPosts();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to unpublish');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await blogAPI.delete(documentId);
      fetchPosts();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading blog posts...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Blog Management</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          {showCreate ? 'Cancel' : '+ New Post'}
        </button>
      </div>

      {showCreate && (
        <form className="bg-white rounded-xl shadow-sm border p-6 mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea
              value={newPost.body}
              onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={6}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
            <input
              type="text"
              value={newPost.coverImage}
              onChange={(e) => setNewPost({ ...newPost, coverImage: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="https://..."
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleCreateDraft}
              disabled={creating}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {creating ? 'Publishing...' : 'Publish Now'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.documentId}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.body}</p>
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  <span>By {post.author?.username || 'Unknown'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    post.publishedAt ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {post.publishedAt ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                {post.publishedAt ? (
                  <button
                    onClick={() => handleUnpublish(post.documentId)}
                    className="px-3 py-1.5 border border-yellow-300 text-yellow-700 rounded-lg text-sm hover:bg-yellow-50"
                  >
                    Unpublish
                  </button>
                ) : (
                  <button
                    onClick={() => handlePublish(post.documentId)}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                  >
                    Publish
                  </button>
                )}
                <button
                  onClick={() => handleDelete(post.documentId)}
                  className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
