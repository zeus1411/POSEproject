import React, { useEffect, useState } from 'react';
import api from '../../../client-eco/services/api';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Eye, ShoppingBag, Globe } from 'lucide-react';

import blogService from '../../services/blogService';
import commentService from '../../services/commentService';
import BlogInteractionButtons from '../../components/BlogInteractionButtons';
import blogInteractionService from '../../services/blogInteractionService';
import { addToCart } from '../../../client-eco/redux/slices/cartSlice';

// Thêm props isAdminPreview vào
const BlogDetailPage = ({ isAdminPreview = false }) => {
  // Lấy CẢ slug (cho user) VÀ id (cho admin)
  const { slug, id } = useParams(); 
  const [searchParams] = useSearchParams();
  const commentId = searchParams.get('commentId');

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

  // State quản lý Popup Xóa
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, commentId: null });

  // Component con để hiển thị card sản phẩm liên quan trong bài viết
  const RelatedProductCard = ({ p, handleAddToCart }) => {
    const isOutOfStock = p.stock <= 0 && p.totalStock <= 0;
    const navigate = useNavigate();

    // Kiểm tra an toàn xem sản phẩm thực sự có biến thể hay không
    console.log("Dữ liệu sản phẩm từ BE:", p);
    const hasVariants = p.hasVariants === true || (p.variants && p.variants.length > 0);

    const handleButtonClick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (hasVariants) {
        // Có biến thể -> Chuyển hướng sang trang chi tiết để chọn loại
        navigate(`/product/${p._id}`);
      } else {
        // Không có biến thể -> Thêm thẳng vào giỏ hàng
        handleAddToCart(p);
      }
    };
    
    return (
      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-4 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all duration-500 group flex flex-col h-full">
        <div className="relative overflow-hidden rounded-[1.5rem] mb-4 aspect-square">
          <Link to={`/product/${p._id}`}>
            <img 
              src={p.images?.[0] || '/placeholder-product.jpg'} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              alt={p.name} 
            />
          </Link>
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold uppercase tracking-widest">
              Hết hàng
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          <Link to={`/product/${p._id}`}>
            <p className="font-bold text-sm text-white line-clamp-2 mb-2 group-hover:text-emerald-400 transition-colors" title={p.name}>
              {p.name}
            </p>
          </Link>
          
          <p className="text-emerald-400 font-bold text-lg mt-auto">
            {p.minPrice && p.maxPrice && p.minPrice !== p.maxPrice ? (
              // Nếu có khoảng giá của biến thể (Ví dụ: 150.000₫ - 250.000₫)
              `${p.minPrice.toLocaleString('vi-VN')}₫ - ${p.maxPrice.toLocaleString('vi-VN')}₫`
            ) : (
              // Nếu là sản phẩm đơn giá hoặc min == max
              `${(p.displayPrice || p.minPrice || p.price)?.toLocaleString('vi-VN')}₫`
            )}
          </p>
        </div>
        
        <button 
          onClick={handleButtonClick} // 🔥 CHÚ Ý: Phải gọi đúng hàm handleButtonClick ở đây!
          disabled={isOutOfStock}
          className={`w-full mt-4 text-white text-xs font-bold py-3 rounded-2xl transition-all active:scale-95 ${
            isOutOfStock 
              ? 'bg-gray-700 cursor-not-allowed opacity-50' 
              : hasVariants
                ? 'bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-900/20' // Nút màu xanh cyan cho sản phẩm có biến thể
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/20' // Nút màu xanh lá cho sản phẩm thường
          }`}
        >
          {isOutOfStock ? 'Hết hàng' : hasVariants ? 'Xem chi tiết' : 'Thêm vào giỏ'}
        </button>
      </div>
    );
  };

  // Theo dõi cả id và slug
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
      
      // 🔥 LOGIC PHÂN LUỒNG MỚI NẰM Ở ĐÂY:
      if (isAdminPreview) {
        // Nếu là Admin -> Dùng hàm getBlogById để "xuyên thủng" rào cản PUBLISHED, xem được cả DRAFT/PENDING
        data = await blogService.getBlogById(id);
      } else {
        // Khách bình thường -> Dùng getBlogBySlug, chỉ xem được bài PUBLISHED
        data = await blogService.getBlogBySlug(slug);
      }
      
      // Đảm bảo lấy đúng object (tùy BE trả về {blog: ...} hay trả thẳng object)
      const blogData = data.blog || data;
      
      // Không cần tăng view ảo nếu admin đang mải mê test bài
      if (!isAdminPreview) {
        const viewed = sessionStorage.getItem(`viewed_${blogData.slug}`);
        if (!viewed) {
          blogData.viewCount = (blogData.viewCount || 0) + 1;
          sessionStorage.setItem(`viewed_${blogData.slug}`, 'true');
        }
      }
      
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

  // 🔥 THÊM VÀO GIỎ HÀNG
  const dispatch = useDispatch();
  // State quản lý popup thông báo
  const [cartPopup, setCartPopup] = useState({ isOpen: false, productName: '' });

  const handleAddToCart = async (product) => {
    if (!token) return alert('Vui lòng đăng nhập để thêm vào giỏ hàng!');
    if (user?.role === 'admin') return alert('Tài khoản Admin không có tính năng giỏ hàng!');
    
    if (product.stock <= 0 && product.totalStock <= 0) {
      return alert('Sản phẩm này đã hết hàng!');
    }

    try {
      // Dùng dispatch để gọi Redux Thunk. Phải có .unwrap() để bắt lỗi bằng try-catch
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      
      // Mở Popup xịn xò
      setCartPopup({ isOpen: true, productName: product.name });
      
      // Tự động tắt sau 3 giây
      setTimeout(() => setCartPopup({ isOpen: false, productName: '' }), 3000);
      
    } catch (err) {
      // err ở đây chính là payload từ rejectWithValue trong cartSlice
      alert(`Lỗi: ${err}`);
    }
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
      
      // Lọc khỏi cây state
      const removeFromTree = (list) => list.filter(item => item._id !== deleteModal.commentId).map(item => ({
        ...item, replies: item.replies ? removeFromTree(item.replies) : []
      }));
      
      setComments(prev => removeFromTree(prev));
      setBlog(prev => ({ ...prev, commentCount: Math.max(0, (prev.commentCount || 1) - 1) }));
      
      // Đóng modal sau khi xóa thành công
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
      setBlog(prev => ({ ...prev, likeCount: res.newCount }));
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

  // 🔥 COMPONENT COMMENT CHỨA LOGIC XÓA/SỬA Ở ĐÂY NÈ
  const CommentItem = ({ c, isReply = false }) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState('');
    
    // State cho edit
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(c.content);

    // Quyền hạn
    // Bao lô mọi kiểu đặt tên ID trong localStorage (_id, id, userId)
    const myId = user?._id || user?.id || user?.userId; 
    
    // Phòng trường hợp backend trả author là object hoặc chỉ là 1 chuỗi ID
    const authorId = c.author?._id || c.author?.id || c.author; 

    // Đưa cả 2 về kiểu String để so sánh chuẩn xác 100%
    const isOwner = Boolean(myId && authorId && String(myId) === String(authorId));
    
    const isAdmin = user?.role === 'admin';
    const canEdit = isOwner;
    const canDelete = isOwner || isAdmin;
    // ------------------------

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
      // Gọi state của thằng cha để bật popup
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
      <div id={`comment-${c._id}`} className={`flex gap-4 mt-6 ${isReply ? 'ml-12 border-l border-white/10 pl-6' : ''}`}>
        <img src={c.author?.avatar || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full ring-2 ring-white/5" alt="Avatar" />
        <div className="flex-1">
          <div className="bg-white/5 border border-white/5 rounded-3xl px-5 py-4 inline-block min-w-[200px] shadow-sm">
            <p className="font-bold text-emerald-400 text-sm mb-1">{c.author?.fullName || c.author?.username}</p>
            {isEditing ? (
              <div className="mt-1">
                <input 
                  value={editText} 
                  onChange={(e) => setEditText(e.target.value)}
                  className="bg-black/20 border-white/10 text-white rounded-lg px-2 w-full"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                />
                <div className="flex gap-3 mt-2 text-xs">
                  <button onClick={handleSaveEdit} className="text-blue-600 font-bold hover:underline">Lưu</button>
                  <button onClick={() => {setIsEditing(false); setEditText(c.content)}} className="text-gray-500 hover:underline">Hủy</button>
                </div>
              </div>
            ) : (
              <p className="text-gray-200 text-[15px] leading-relaxed">{c.content}</p>
            )}
          </div>

          {!isEditing && (
            <div className="flex gap-4 text-[12px] text-gray-500 mt-2 ml-4 font-semibold uppercase tracking-wider">
              <button onClick={() => setShowReplyInput(!showReplyInput)} className="hover:text-emerald-400 transition-colors">Phản hồi</button>
              {canEdit && <button  onClick={() => setIsEditing(true)} className="hover:text-white transition-colors">Sửa</button>}
              {canDelete && <button onClick={handleDelete} className="hover:text-rose-400 transition-colors">Xóa</button>}
            </div>
          )}

          {showReplyInput && (
            <div className="flex gap-3 mt-4 items-start animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Avatar nhỏ hơn một chút cho phần reply */}
              <img 
                src={user?.avatar || 'https://via.placeholder.com/32'} 
                className="w-8 h-8 rounded-full border border-white/10 object-cover" 
                alt="My Avatar" 
              />
              
              <div className="flex-1 flex flex-col gap-2">
                <div className="relative group">
                  <input 
                    autoFocus
                    value={replyText} 
                    onChange={(e) => setReplyText(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white/10 transition-all shadow-inner"
                    placeholder={`Phản hồi bình luận của ${c.author?.fullName || c.author?.username}...`} 
                    onKeyPress={(e) => e.key === 'Enter' && handleReplySubmit()}
                  />
                </div>

                <div className="flex gap-3 ml-1">
                  <button 
                    onClick={handleReplySubmit} 
                    disabled={!replyText.trim()} 
                    className="text-[13px] font-bold text-emerald-400 hover:text-emerald-300 disabled:opacity-30 disabled:text-gray-500 transition-colors"
                  >
                    Gửi phản hồi
                  </button>
                  
                  <button 
                    onClick={() => {
                      setShowReplyInput(false);
                      setReplyText('');
                    }} 
                    className="text-[13px] font-bold text-gray-500 hover:text-white transition-colors"
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">Đang tải...</div>;
  if (!blog) return <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">Không tìm thấy bài viết</div>;

  return (
    <div className="relative min-h-screen bg-[#051C1C] text-white">
      {/* 1. Nền Gradient chính - Cố định (Fixed) */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#051C1C] via-[#0a2828] to-[#051C1C] z-0"></div>
      
      {/* 2. Hệ thống vân sóng vô tận lặp lại toàn trang */}
      <div 
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='200' viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 Q 100 50 200 100 T 400 100' fill='none' stroke='%2310b981' stroke-width='1.5' stroke-opacity='0.5'/%3E%3Cpath d='M0 140 Q 100 90 200 140 T 400 140' fill='none' stroke='%2306b6d4' stroke-width='1' stroke-opacity='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: '1000px 500px', // Cho Detail vân sóng to hơn chút để sang hơn
        }}
      ></div>

      {/* 3. Decorative blur spots - Cố định */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-emerald-900/10 blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10 container mx-auto max-w-4xl px-4 py-12">
        <main className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden">
          {/* HEADER: Thông tin tác giả */}
          <div className="p-8 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-4">
              <img 
                src={blog.author?.avatar || 'https://via.placeholder.com/48'} 
                alt="Author" 
                className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20" 
              />
              <div>
                <h3 className="font-bold text-lg text-white hover:text-emerald-400 transition-colors cursor-pointer">
                  {blog.author?.fullName || blog.author?.username || 'Tác giả'}
                </h3>
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('vi-VN')}
                  <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                  <Globe size={14} className="text-emerald-500" />
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {!isAdminPreview && user?.role !== 'admin' && (
                <button 
                  onClick={handleBookmark} 
                  className={`p-3 rounded-2xl transition-all ${
                    interaction.isBookmarked 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  <Bookmark size={22} fill={interaction.isBookmarked ? "currentColor" : "none"} />
                </button>
              )}
            </div>
          </div>

          {/* BODY: Đã sửa màu chữ text-white và text-gray-200 */}
          <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-8 leading-tight tracking-tight">
              {blog.title}
            </h1>

            {blog.coverImage?.url && (
              <div className="mb-10 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                <img src={blog.coverImage.url} alt="Cover" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            )}

            {/* Typography: Sử dụng prose-invert để tự làm sáng nội dung HTML */}
            <div 
              className="prose prose-invert prose-emerald max-w-none 
                        text-gray-200 text-lg leading-relaxed
                        prose-headings:text-white prose-strong:text-emerald-400
                        prose-img:rounded-3xl prose-img:border prose-img:border-white/10" 
              dangerouslySetInnerHTML={{ __html: blog.content }} 
            />
          </div>

          {/* STATS & INTERACTIONS */}
          <div className="px-8 py-6 bg-white/5 border-t border-white/5 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-8 text-gray-300">
              <button 
                onClick={!isAdminPreview ? handleLike : undefined} 
                className={`flex items-center gap-2 group transition-colors ${interaction.isLiked ? 'text-rose-400' : 'hover:text-rose-400'}`}
              >
                <div className={`p-2 rounded-xl transition-all ${interaction.isLiked ? 'bg-rose-500/20' : 'bg-white/5 group-hover:bg-rose-500/10'}`}>
                  <Heart size={20} fill={interaction.isLiked ? "currentColor" : "none"} />
                </div>
                <span className="font-bold">{blog.likeCount || 0}</span>
              </button>

              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/5 rounded-xl"><MessageCircle size={20} /></div>
                <span className="font-bold">{blog.commentCount || 0}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/5 rounded-xl"><Eye size={20} /></div>
                <span className="font-bold">{blog.viewCount || 0}</span>
              </div>
            </div>
          </div>

          {/* COMMENT SECTION - ĐÃ CHỈNH MÀU MỤC NHẬP COMMENT */}
          {!isAdminPreview && (
            <div className="p-8 md:p-12 bg-black/20 border-t border-white/5">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                Bình luận <span className="px-3 py-1 bg-white/10 rounded-full text-xs">{comments.length}</span>
              </h3>
              
              <div className="flex gap-4 mb-10">
                <img src={user?.avatar || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full border border-white/10 object-cover" alt="Me" />
                <div className="flex-1 relative">
                  <input 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/10 transition-all"
                    placeholder="Chia sẻ ý kiến của bạn..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button 
                    onClick={handleAddComment} 
                    disabled={!newComment.trim()} 
                    className="absolute right-2 top-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 text-white font-bold px-4 py-1.5 rounded-xl transition-all"
                  >
                    Gửi
                  </button>
                </div>
              </div>

              <div className="space-y-6 text-white">
                {loadingComments ? (
                  <p className="text-sm text-gray-500 text-center">Đang tải bình luận...</p> 
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
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 px-4">
              <ShoppingBag className="text-emerald-400" size={22} /> 
              Sản phẩm được nhắc đến
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blog.relatedProducts.map(p => (
                <RelatedProductCard 
                  key={p._id} 
                  p={p} 
                  handleAddToCart={handleAddToCart} 
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 🚀 MODAL XÓA BÌNH LUẬN "SANG CHẢNH" */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl transform transition-all scale-100 opacity-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Xóa bình luận?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ isOpen: false, commentId: null })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteComment}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm shadow-red-200"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🛒 POPUP THÊM GIỎ HÀNG THÀNH CÔNG */}
      {cartPopup.isOpen && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] animate-bounce-in">
          <div className="bg-gray-900/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/20">
            <div className="bg-green-500 p-2 rounded-full">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">Đã thêm vào giỏ hàng!</p>
              <p className="text-xs text-gray-300">Bạn đã thêm "{cartPopup.productName}"</p>
            </div>
            <Link 
              to="/checkout" 
              className="ml-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              Xem giỏ hàng
            </Link>
            <button 
              onClick={() => setCartPopup({ isOpen: false, productName: '' })}
              className="text-gray-400 hover:text-white"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default BlogDetailPage;