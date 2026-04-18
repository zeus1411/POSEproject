import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Heart, MessageCircle } from 'lucide-react';

import blogService from '../../services/blogService';
import commentService from '../../services/commentService';
import cartService from '../../../client-eco/services/cartService';

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const commentId = searchParams.get('commentId');

  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const [liked, setLiked] = useState(false);
  const [newComment, setNewComment] = useState('');

  const [replyingTo, setReplyingTo] = useState(null);
  const [commentLikes, setCommentLikes] = useState({});

  const commentRefs = useRef({});

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  // ================= FETCH BLOG =================
  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const data = await blogService.getBlogBySlug(slug);

      console.log("DETAIL API:", data);

      // tăng view FE session
      const viewed = sessionStorage.getItem(`viewed_${slug}`);
      if (!viewed) {
        data.views = (data.views || 0) + 1;
        sessionStorage.setItem(`viewed_${slug}`, 'true');
      }

      setBlog(data.blog);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH COMMENTS =================
  useEffect(() => {
    if (blog?._id) fetchComments();
  }, [blog]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const data = await commentService.getCommentsByBlog(blog._id);
      setComments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  // ================= SCROLL TO COMMENT =================
  useEffect(() => {
    if (commentId && comments.length > 0) {
      const el = document.getElementById(`comment-${commentId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('bg-blue-50', 'ring-2', 'ring-blue-400');
        setTimeout(() => {
          el.classList.remove('bg-blue-50', 'ring-2', 'ring-blue-400');
        }, 2000);
      }
    }
  }, [comments, commentId]);

  // ================= BLOG LIKE =================
  const handleLike = () => {
    setLiked(!liked);
    setBlog((prev) => ({
      ...prev,
      likesCount: prev.likesCount + (liked ? -1 : 1)
    }));
  };

  // ================= ADD COMMENT =================
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!token) return alert('Vui lòng đăng nhập');

    try {
      const res = await commentService.createComment({
        blogId: blog._id,
        content: newComment
      });

      setComments([res, ...comments]);
      setNewComment('');

      setBlog((prev) => ({
        ...prev,
        commentsCount: (prev.commentsCount || 0) + 1
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // ================= REPLY =================
  const handleReply = async (parentId) => {
    if (!newComment.trim()) return;

    try {
      const res = await commentService.createComment({
        blogId: blog._id,
        content: newComment,
        parentId
      });

      setComments([res, ...comments]);
      setNewComment('');
      setReplyingTo(null);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= LIKE COMMENT =================
  const handleLikeComment = (id) => {
    setCommentLikes((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // ================= COMMENT ITEM =================
  const CommentItem = ({ c, isReply = false }) => (
    <div
      id={`comment-${c._id}`}
      className={`flex gap-3 ${isReply ? 'ml-10 mt-3' : ''}`}
    >
      {/* avatar */}
      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs">
        {c.user?.name?.charAt(0) || 'U'}
      </div>

      {/* body */}
      <div className="flex-1 group">
        <div className="bg-gray-100 rounded-2xl px-4 py-2">
          <p className="text-sm font-semibold">
            {c.user?.name || 'User'}
          </p>
          <p className="text-sm">{c.content}</p>
        </div>

        {/* actions */}
        <div className="flex gap-4 text-xs text-gray-500 mt-1 ml-2 opacity-0 group-hover:opacity-100 transition">

          <button
            onClick={() => handleLikeComment(c._id)}
            className={`hover:text-blue-500 ${
              commentLikes[c._id] ? 'text-blue-500 font-semibold' : ''
            }`}
          >
            Like
          </button>

          <button
            onClick={() => setReplyingTo(c._id)}
            className="hover:text-blue-500"
          >
            Reply
          </button>

          <span>
            {new Date(c.createdAt).toLocaleString('vi-VN')}
          </span>

          {/* menu */}
          <div className="relative group/menu">
            <button>•••</button>
            <div className="absolute hidden group-hover/menu:block bg-white border shadow rounded text-xs right-0 mt-1">
              <button className="block px-3 py-1 hover:bg-gray-100 w-full text-left">
                Edit
              </button>
              <button className="block px-3 py-1 hover:bg-gray-100 w-full text-left text-red-500">
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* reply input */}
        {replyingTo === c._id && (
          <div className="flex gap-2 mt-2 ml-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 border rounded-full px-3 py-1 text-sm"
              placeholder="Write a reply..."
            />
            <button
              onClick={() => handleReply(c._id)}
              className="bg-blue-500 text-white px-3 rounded-full text-sm"
            >
              Reply
            </button>
          </div>
        )}

        {/* replies */}
        {c.replies?.length > 0 && (
          <div className="mt-2">
            {c.replies.map((r) => (
              <CommentItem key={r._id} c={r} isReply />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ================= UI =================
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!blog) return <div className="p-10 text-center">Blog not found</div>;

  return (
    <div className="container mx-auto py-10 max-w-5xl">

      {/* TITLE */}
      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        {blog.title}
      </h1>

      {/* META */}
      <div className="flex justify-between text-sm text-gray-500 mb-6 border-b pb-3">
        <div>👁 {blog.views}</div>
        <div className="text-right">
          <div>💬 {blog.commentsCount}</div>
          <div className="text-xs">
            {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
          </div>
        </div>
      </div>

      {/* COVER */}
      {blog.coverImage?.url && (
        <img
          src={blog.coverImage.url}
          alt={blog.title}
          className="w-full rounded-xl mb-8 shadow-md"
        />
      )}

      {/* CONTENT */}
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* SOCIAL */}
      <div className="mt-8 border-t pt-4">

        {/* like */}
        <button onClick={handleLike} className="flex items-center gap-2 mb-4">
          <Heart
            size={20}
            className={liked ? 'fill-red-500 stroke-red-500' : 'stroke-gray-500'}
          />
          <span>{blog.likesCount}</span>
        </button>

        {/* input */}
        {token ? (
          <div className="flex gap-2 mb-6">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 border rounded-full px-4 py-2"
              placeholder="Write a comment..."
            />
            <button
              onClick={handleAddComment}
              className="bg-blue-500 text-white px-4 rounded-full"
            >
              Post
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">
            👉 Bạn cần đăng nhập để bình luận
          </p>
        )}

        {/* list */}
        <div className="flex flex-col gap-4">
          {loadingComments ? (
            <p>Loading...</p>
          ) : comments.map((c) => (
            <CommentItem key={c._id} c={c} />
          ))}
        </div>

      </div>

      {/* PRODUCTS */}
      {blog.relatedProducts?.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">🛒 Sản phẩm liên quan</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {blog.relatedProducts.map((p) => (
              <div key={p._id} className="border rounded-xl p-3 flex flex-col">
                <img src={p.images?.[0]?.url} className="h-36 object-cover rounded mb-2" />
                <p className="text-sm">{p.name}</p>
                <p className="text-red-500">{p.price?.toLocaleString()}₫</p>
                <button
                  onClick={() => handleAddToCart(p._id)}
                  className="mt-2 bg-blue-500 text-white text-sm py-1 rounded"
                >
                  Add to cart
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default BlogDetailPage;