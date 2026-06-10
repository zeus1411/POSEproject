import React, { useEffect, useState } from 'react';
import api from '../../../client-eco/services/api';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Bookmark, Eye, ShoppingBag, Globe, Tag } from 'lucide-react';
import { useTheme } from '../../../client-eco/context/ThemeContext';

import blogService from '../../services/blogService';
import commentService from '../../services/commentService';
import BlogInteractionButtons from '../../components/BlogInteractionButtons';
import blogInteractionService from '../../services/blogInteractionService';

const BlogDetailPage = ({ isAdminPreview = false }) => {
  const { slug, id } = useParams(); 
  const [searchParams] = useSearchParams();
  const commentId = searchParams.get('commentId');
  const { isDark } = useTheme();

  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentLikes, setCommentLikes] = useState({});

  const [interaction, setInteraction] = useState({ isLiked: false, isBookmarked: false });

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const [loadingBookmark, setLoadingBookmark] = React.useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, commentId: null });

  // Component con để hiển thị card sản phẩm liên quan trong bài viết
  const RelatedProductCard = ({ p }) => {
    const isOutOfStock = p.stock <= 0 && p.totalStock <= 0;
    const navigate = useNavigate();

    console.log("Dữ liệu sản phẩm từ BE:", p);

    const handleButtonClick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      navigate(`/product/${p._id}`);
    };
    
    return (
      <div className="glass-panel border border-water/45 dark:border-white/10 rounded-[2rem] p-4 hover:bg-aqua/10 dark:hover:bg-white/10 hover:shadow-xl transition-all duration-500 group flex flex-col h-full">
        <div className="relative overflow-hidden rounded-[1.5rem] mb-4 aspect-square">
          <Link to={`/product/${p._id}`}>
            <img 
              src={p.images?.[0] || '/placeholder-product.jpg'} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              alt={p.name} 
            />
          </Link>
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-white">
              Hết hàng
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          <Link to={`/product/${p._id}`}>
            <p className="font-bold text-sm text-foreground line-clamp-2 mb-2 group-hover:text-nature dark:group-hover:text-emerald-400 transition-colors" title={p.name}>
              {p.name}
            </p>
          </Link>
          
          <p className="text-nature dark:text-emerald-400 font-bold text-lg mt-auto">
            {p.minPrice && p.maxPrice && p.minPrice !== p.maxPrice ? (
              `${p.minPrice.toLocaleString('vi-VN')}₫ - ${p.maxPrice.toLocaleString('vi-VN')}₫`
            ) : (
              `${(p.displayPrice || p.minPrice || p.price)?.toLocaleString('vi-VN')}₫`
            )}
          </p>
        </div>
        
        <button 
          onClick={handleButtonClick}
          disabled={isOutOfStock}
          className={`w-full mt-4 text-white text-xs font-bold py-3 rounded-2xl transition-all active:scale-95 ${
            isOutOfStock 
              ? 'bg-gray-700 cursor-not-allowed opacity-50' 
              : 'bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-900/20' 
          }`}
        >
          {isOutOfStock ? 'Hết hàng' : 'Xem chi tiết'}
        </button>
      </div>
    );
  };

  useEffect(() => { fetchBlog(); }, [slug, id, isAdminPreview]);
  useEffect(() => { if (blog?._id) fetchComments(); }, [blog]);
  useEffect(() => { if (blog?._id && token) loadInteractionStatus(); }, [blog, token]);
  
  useEffect(() => {
    if (!commentId || comments.length === 0) return;
    setTimeout(() => {
      const el = document.getElementById(`comment-${commentId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('bg-yellow-100');
        setTimeout(() => {
          el.classList.remove('bg-yellow-100');
        }, 2000);
      }
    }, 500);
  }, [commentId, comments]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      let data;
      
      if (isAdminPreview) {
        data = await blogService.getBlogById(id);
      } else {
        data = await blogService.getBlogBySlug(slug);
      }
      
      const blogData = data.blog || data;
      
      setBlog(blogData);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const data = await commentService.getCommentsByBlog(blog._id);
      setComments(data.comments || []);
    } catch (err) { console.error(err); } finally { setLoadingComments(false); }
  };

  const loadInteractionStatus = async () => {
    try {
      const data = await blogInteractionService.getMyInteractions([blog._id]);
      if (data?.statuses?.[blog._id]) {
        setInteraction(data.statuses[blog._id]);
      }
    } catch (err) { console.error('Load interaction lỗi', err); }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!token) return alert('Vui lòng đăng nhập');
    try {
      const res = await commentService.createComment({ blogId: blog._id, content: newComment });
      setComments([res, ...comments]);
      setNewComment('');
      setBlog(prev => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
    } catch (err) { console.error(err); }
  };

  const confirmDeleteComment = async () => {
    if (!deleteModal.commentId) return;
    try {
      await commentService.deleteComment(deleteModal.commentId);
      
      const removeFromTree = (list) => list.filter(item => item._id !== deleteModal.commentId).map(item => ({
        ...item, replies: item.replies ? removeFromTree(item.replies) : []
      }));
      
      setComments(prev => removeFromTree(prev));
      setBlog(prev => ({ ...prev, commentCount: Math.max(0, (prev.commentCount || 1) - 1) }));
      setDeleteModal({ isOpen: false, commentId: null });
    } catch (err) { 
      console.error(err); 
      alert("Lỗi khi xóa!"); 
    }
  };

  const handleLike = async () => {
    if (!token) return alert('Vui lòng đăng nhập');
    try {
      const res = await blogInteractionService.toggleLike(blog._id);
      setInteraction(prev => ({ ...prev, isLiked: res.isActed }));
      setBlog(prev => ({ ...prev, likeCount: Math.max(0, res.newCount ?? res.counts?.likes ?? 0) }));
    } catch (err) { console.error(err); }
  };

  const handleBookmark = async () => {
    if (!token) return alert('Vui lòng đăng nhập');
    if (user?.role === 'admin') return alert('Tài khoản Admin không có tính năng lưu bài viết!');
    if (loadingBookmark) return;
    setLoadingBookmark(true);
    try {
      const res = await api.post(`/blog-interactions/bookmark/${blog._id}`);
      setInteraction(prev => ({ ...prev, isBookmarked: res.data.isActed }));
    } catch (err) { console.log(err); } finally { setLoadingBookmark(false); }
  };

  const CommentItem = ({ c, isReply = false }) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(c.content);

    const myId = user?._id || user?.id || user?.userId; 
    const authorId = c.author?._id || c.author?.id || c.author; 
    const isOwner = Boolean(myId && authorId && String(myId) === String(authorId));
    
    const isAdmin = user?.role === 'admin';
    const canEdit = isOwner;
    const canDelete = isOwner || isAdmin;

    const handleReplySubmit = async () => {
      if (!replyText.trim()) return;
      try {
        const res = await commentService.createComment({
          blogId: blog._id,
          content: replyText,
          parentId: c._id
        });
        setComments(prev => {
          const addReply = (list) => list.map(item => {
            if (item._id === c._id) return { ...item, replies: [res, ...(item.replies || [])] };
            if (item.replies) return { ...item, replies: addReply(item.replies) };
            return item;
          });
          return addReply(prev);
        });
        setReplyText('');
        setShowReplyInput(false);
      } catch (err) { console.error(err); }
    };

    const handleDelete = () => {
      setDeleteModal({ isOpen: true, commentId: c._id });
    };

    const handleSaveEdit = async () => {
      if (!editText.trim()) return;
      try {
        await commentService.updateComment(c._id, editText);
        const updateInTree = (list) => list.map(item => {
          if (item._id === c._id) return { ...item, content: editText };
          if (item.replies) return { ...item, replies: updateInTree(item.replies) };
          return item;
        });
        setComments(prev => updateInTree(prev));
        setIsEditing(false);
      } catch (err) { console.error(err); alert("Lỗi khi cập nhật!"); }
    };

    return (
      <div id={`comment-${c._id}`} className={`flex gap-4 mt-6 ${isReply ? 'ml-12 border-l border-water/30 dark:border-white/10 pl-6' : ''}`}>
        <img src={c.author?.avatar || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full border border-water/30 dark:border-white/10 ring-2 ring-water/20 dark:ring-white/5 object-cover" alt="Avatar" />
        <div className="flex-1">
          <div className="glass-panel rounded-3xl px-5 py-4 inline-block min-w-[200px] border border-water/30 dark:border-white/5 shadow-sm">
            <p className="font-bold text-nature dark:text-emerald-400 text-sm mb-1">{c.author?.fullName || c.author?.username}</p>
            {isEditing ? (
              <div className="mt-1">
                <input 
                  value={editText} 
                  onChange={(e) => setEditText(e.target.value)}
                  className="bg-aqua/10 dark:bg-black/20 border border-water/30 dark:border-white/10 text-foreground rounded-xl px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-nature dark:focus:ring-primary"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                />
                <div className="flex gap-3 mt-2 text-xs font-semibold">
                  <button onClick={handleSaveEdit} className="text-nature dark:text-primary hover:underline">Lưu</button>
                  <button onClick={() => {setIsEditing(false); setEditText(c.content)}} className="text-muted-foreground hover:underline">Hủy</button>
                </div>
              </div>
            ) : (
              <p className="text-foreground text-[15px] leading-relaxed font-semibold">{c.content}</p>
            )}
          </div>

          {!isEditing && (
            <div className="flex gap-4 text-[12px] text-muted-foreground mt-2 ml-4 font-semibold uppercase tracking-wider">
              <button onClick={() => setShowReplyInput(!showReplyInput)} className="hover:text-nature dark:hover:text-emerald-400 transition-colors">Phản hồi</button>
              {canEdit && <button onClick={() => setIsEditing(true)} className="hover:text-nature dark:hover:text-primary transition-colors">Sửa</button>}
              {canDelete && <button onClick={handleDelete} className="hover:text-rose-400 transition-colors">Xóa</button>}
            </div>
          )}

          {showReplyInput && (
            <div className="flex gap-3 mt-4 items-start animate-in fade-in slide-in-from-top-2 duration-300">
              <img 
                src={user?.avatar || 'https://via.placeholder.com/32'} 
                className="w-8 h-8 rounded-full border border-water/30 dark:border-white/10 object-cover" 
                alt="My Avatar" 
              />
              
              <div className="flex-1 flex flex-col gap-2">
                <div className="relative group">
                  <input 
                    autoFocus
                    value={replyText} 
                    onChange={(e) => setReplyText(e.target.value)} 
                    className="w-full bg-aqua/5 dark:bg-white/5 border border-water/30 dark:border-white/10 rounded-2xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-nature dark:focus:ring-primary focus:bg-aqua/10 dark:focus:bg-white/10 transition-all shadow-inner font-medium"
                    placeholder={`Phản hồi bình luận của ${c.author?.fullName || c.author?.username}...`} 
                    onKeyPress={(e) => e.key === 'Enter' && handleReplySubmit()}
                  />
                </div>

                <div className="flex gap-3 ml-1">
                  <button 
                    onClick={handleReplySubmit} 
                    disabled={!replyText.trim()} 
                    className="text-[13px] font-bold text-nature dark:text-emerald-400 hover:opacity-80 disabled:opacity-30 disabled:text-muted-foreground transition-colors"
                  >
                    Gửi phản hồi
                  </button>
                  
                  <button 
                    onClick={() => {
                      setShowReplyInput(false);
                      setReplyText('');
                    }} 
                    className="text-[13px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          {c.replies?.map(r => <CommentItem key={r._id} c={r} isReply />)}
        </div>
      </div>
    );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-semibold">Đang tải...</div>;
  if (!blog) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-semibold">Không tìm thấy bài viết</div>;

  const visibleTags = Array.isArray(blog.tags)
    ? blog.tags.filter(Boolean).map((tag) => ({
        id: tag._id || tag.id || tag.slug || tag.name || tag,
        name: tag.name || tag.title || tag.slug || tag,
      })).filter((tag) => tag.name)
    : [];

  return (
    <div className={`relative min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#051C1C] text-white' : 'bg-background text-foreground'}`}>
      {/* 1. Nền Gradient chính - Cố định (Fixed) */}
      <div className={`fixed inset-0 z-0 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-b from-[#051C1C] via-[#0a2828] to-[#051C1C]' 
          : 'bg-gradient-to-b from-[#FFFDF0] via-[#E8F6F6] to-[#FFFDF0]'
      }`}></div>
      
      {/* 2. Hệ thống vân sóng vô tận lặp lại toàn trang */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: isDark
            ? `url("data:image/svg+xml,%3Csvg width='400' height='200' viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 Q 100 50 200 100 T 400 100' fill='none' stroke='%2310b981' stroke-width='1.5' stroke-opacity='0.5'/%3E%3Cpath d='M0 140 Q 100 90 200 140 T 400 140' fill='none' stroke='%2306b6d4' stroke-width='1' stroke-opacity='0.3'/%3E%3C/svg%3E")`
            : `url("data:image/svg+xml,%3Csvg width='400' height='200' viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 Q 100 50 200 100 T 400 100' fill='none' stroke='%234682A9' stroke-width='1.5' stroke-opacity='0.25'/%3E%3Cpath d='M0 140 Q 100 90 200 140 T 400 140' fill='none' stroke='%23749BC2' stroke-width='1' stroke-opacity='0.2'/%3E%3C/svg%3E")`,
          backgroundSize: '1000px 500px', 
        }}
      ></div>

      {/* 3. Decorative blur spots - Cố định */}
      <div className={`fixed top-0 left-0 w-full h-[500px] pointer-events-none z-0 blur-[120px] transition-colors duration-300 ${
        isDark ? 'bg-emerald-900/10' : 'bg-emerald-200/20'
      }`}></div>

      <div className="relative z-10 container mx-auto max-w-4xl px-4 py-12">
        <main className="glass-panel shadow-2xl rounded-[3rem] border border-water/45 dark:border-white/10 overflow-hidden">
          {/* HEADER: Thông tin tác giả */}
          <div className="p-8 flex items-center justify-between border-b border-water/20 dark:border-white/5">
            <div className="flex items-center gap-4">
              <img 
                src={blog.author?.avatar || 'https://via.placeholder.com/48'} 
                alt="Author" 
                className="w-12 h-12 rounded-full object-cover ring-2 ring-nature/20 dark:ring-emerald-500/20" 
              />
              <div>
                <h3 className="font-bold text-lg text-foreground hover:text-nature dark:hover:text-primary transition-colors cursor-pointer animate-none">
                  {blog.author?.fullName || blog.author?.username || 'Tác giả'}
                </h3>
                <p className="text-sm text-muted-foreground font-semibold flex items-center gap-2 mt-0.5">
                  {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('vi-VN')}
                  <span className="w-1 h-1 bg-water/60 dark:bg-white/10 rounded-full"></span>
                  <Globe size={14} className="text-nature dark:text-emerald-500" />
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {!isAdminPreview && user?.role !== 'admin' && (
                <button 
                  onClick={handleBookmark} 
                  className={`p-3 rounded-2xl border transition-all ${
                    interaction.isBookmarked 
                      ? 'bg-nature/20 dark:bg-emerald-500/20 text-nature dark:text-emerald-400 border-nature/30 dark:border-emerald-500/30 shadow-md' 
                      : 'bg-aqua/5 dark:bg-white/5 text-muted-foreground hover:bg-aqua/10 dark:hover:bg-white/10 border-water/30 dark:border-white/10'
                  }`}
                >
                  <Bookmark size={22} fill={interaction.isBookmarked ? "currentColor" : "none"} />
                </button>
              )}
            </div>
          </div>

          {/* BODY: Đã sửa màu chữ text-foreground và text-muted-foreground */}
          <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-8 leading-tight tracking-tight">
              {blog.title}
            </h1>

            {visibleTags.length > 0 && (
              <div className="mb-8 flex flex-wrap items-center gap-2">
                <span className="mr-1 inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground">
                  <Tag size={16} className="text-nature dark:text-emerald-400" />
                  Tags
                </span>
                {visibleTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full border border-water/30 bg-aqua/10 px-3.5 py-1.5 text-sm font-bold text-nature transition-colors dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {blog.coverImage?.url && (
              <div className="mb-10 rounded-[2rem] overflow-hidden border border-water/30 bg-aqua/5 shadow-2xl dark:border-white/10 dark:bg-white/5">
                <img src={blog.coverImage.url} alt="Cover" className="w-full h-auto object-contain" decoding="async" />
              </div>
            )}

            {/* Typography: Sử dụng prose-invert/prose-teal động dựa trên Theme */}
            <div 
              className={`blog-rich-content prose max-w-none text-lg leading-relaxed transition-colors duration-300 ${
                isDark 
                  ? 'prose-invert prose-emerald text-gray-200 prose-headings:text-white prose-strong:text-emerald-400 prose-img:border-white/10' 
                  : 'prose-teal text-gray-800 prose-headings:text-gray-900 prose-strong:text-teal-600 prose-img:border-water/30'
              } prose-img:rounded-3xl prose-img:border`} 
              dangerouslySetInnerHTML={{ __html: blog.content }} 
            />
          </div>

          {/* STATS & INTERACTIONS */}
          <div className="px-8 py-6 bg-aqua/5 dark:bg-white/5 border-t border-water/20 dark:border-white/5 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-8 text-foreground">
              <button 
                onClick={!isAdminPreview ? handleLike : undefined} 
                className={`flex items-center gap-2 group transition-colors ${interaction.isLiked ? 'text-rose-400' : 'hover:text-rose-400'}`}
              >
                <div className={`p-2 rounded-xl border transition-all ${
                  interaction.isLiked 
                    ? 'bg-rose-500/20 border-rose-500/30' 
                    : 'bg-aqua/5 dark:bg-white/5 group-hover:bg-rose-500/10 border-water/30 dark:border-white/10'
                }`}>
                  <Heart size={20} fill={interaction.isLiked ? "currentColor" : "none"} />
                </div>
                <span className="font-bold">{Math.max(0, blog.likeCount || 0)}</span>
              </button>

              <div className="flex items-center gap-2">
                <div className="p-2 bg-aqua/5 dark:bg-white/5 border border-water/30 dark:border-white/10 rounded-xl"><MessageCircle size={20} /></div>
                <span className="font-bold">{blog.commentCount || 0}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 bg-aqua/5 dark:bg-white/5 border border-water/30 dark:border-white/10 rounded-xl"><Eye size={20} /></div>
                <span className="font-bold">{blog.viewCount || 0}</span>
              </div>
            </div>
          </div>

          {/* COMMENT SECTION */}
          {!isAdminPreview && (
            <div className="p-8 md:p-12 bg-aqua/10 dark:bg-black/20 border-t border-water/20 dark:border-white/5">
              <h3 className="text-xl font-bold text-foreground mb-8 flex items-center gap-3">
                Bình luận <span className="px-3 py-1 bg-aqua/20 dark:bg-white/10 border border-water/30 dark:border-white/10 rounded-full text-xs text-foreground font-semibold">{comments.length}</span>
              </h3>
              
              <div className="flex gap-4 mb-10">
                <img src={user?.avatar || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full border border-water/30 dark:border-white/10 object-cover" alt="Me" />
                <div className="flex-1 relative">
                  <input 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-aqua/5 dark:bg-white/5 border border-water/30 dark:border-white/10 rounded-2xl px-5 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-nature dark:focus:ring-primary focus:bg-aqua/10 dark:focus:bg-white/10 transition-all font-medium"
                    placeholder="Chia sẻ ý kiến của bạn..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button 
                    onClick={handleAddComment} 
                    disabled={!newComment.trim()} 
                    className="absolute right-2 top-2 bg-gradient-to-r from-nature to-ocean text-white font-semibold px-4 py-1.5 rounded-xl shadow-md hover:opacity-90 disabled:opacity-30 transition-all"
                  >
                    Gửi
                  </button>
                </div>
              </div>

              <div className="space-y-6 text-foreground">
                {loadingComments ? (
                  <p className="text-sm text-muted-foreground text-center font-semibold">Đang tải bình luận...</p> 
                ) : (
                  comments.map(c => <CommentItem key={c._id} c={c} />)
                )}
              </div>
            </div>
          )}
        </main>

        {/* RELATED PRODUCTS */}
        {blog.relatedProducts?.length > 0 && (
          <section className="mt-12">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3 px-4">
              <ShoppingBag className="text-nature dark:text-emerald-400" size={22} /> 
              Sản phẩm được nhắc đến
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blog.relatedProducts.map(p => (
                <RelatedProductCard 
                  key={p._id} 
                  p={p} 
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* MODAL XÓA BÌNH LUẬN */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="glass-panel border border-water/45 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl transform transition-all scale-100 opacity-100 bg-[#FFFDF0] dark:bg-[#051C1C]">
            <h3 className="text-lg font-bold text-foreground mb-2">Xóa bình luận?</h3>
            <p className="text-sm text-muted-foreground mb-6 font-medium">
              Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ isOpen: false, commentId: null })}
                className="px-4 py-2 text-sm font-semibold text-foreground bg-aqua/10 dark:bg-white/5 hover:bg-aqua/20 dark:hover:bg-white/10 rounded-xl transition-all border border-water/20"
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteComment}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-sm"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BlogDetailPage;
