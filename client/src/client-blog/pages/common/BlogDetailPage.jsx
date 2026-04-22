import React, { useEffect, useState } from 'react';
import api from '../../../client-eco/services/api';
import { useParams, useSearchParams, Link } from 'react-router-dom';
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
      <div id={`comment-${c._id}`} className={`flex gap-2 mt-4 ${isReply ? 'ml-8' : ''}`}>
        <img src={c.author?.avatar || 'https://via.placeholder.com/32'} className="w-8 h-8 rounded-full" alt="Avatar" />
        <div className="flex-1">
          
          <div className="bg-[#F0F2F5] rounded-2xl px-3 py-2 inline-block min-w-[150px]">
            <p className="font-bold text-sm">{c.author?.fullName || c.author?.username}</p>
            
            {isEditing ? (
              <div className="mt-1">
                <input 
                  value={editText} 
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-white px-2 py-1 text-sm border rounded outline-none focus:border-blue-500"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                />
                <div className="flex gap-3 mt-2 text-xs">
                  <button onClick={handleSaveEdit} className="text-blue-600 font-bold hover:underline">Lưu</button>
                  <button onClick={() => {setIsEditing(false); setEditText(c.content)}} className="text-gray-500 hover:underline">Hủy</button>
                </div>
              </div>
            ) : (
              <p className="text-sm">{c.content}</p>
            )}
          </div>

          {!isEditing && (
            <div className="flex gap-3 text-xs text-gray-500 mt-1 ml-2">
              <button onClick={() => setShowReplyInput(!showReplyInput)} className="hover:text-black font-medium">Phản hồi</button>
              {canEdit && <button onClick={() => setIsEditing(true)} className="hover:text-blue-600 font-medium">Sửa</button>}
              {canDelete && <button onClick={handleDelete} className="hover:text-red-600 font-medium">Xóa</button>}
            </div>
          )}

          {showReplyInput && (
            <div className="flex gap-2 mt-2">
              <input 
                value={replyText} 
                onChange={(e) => setReplyText(e.target.value)} 
                className="flex-1 bg-gray-100 px-3 py-1.5 rounded-full text-sm outline-none focus:ring-1 focus:ring-blue-500" 
                placeholder="Viết phản hồi..." 
                onKeyPress={(e) => e.key === 'Enter' && handleReplySubmit()}
              />
              <button onClick={handleReplySubmit} disabled={!replyText.trim()} className="text-blue-600 font-bold text-sm px-2 disabled:opacity-50">Gửi</button>
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
    <div className="min-h-screen bg-[#F0F2F5] pt-4 pb-12">
      <div className="container mx-auto max-w-3xl px-4">
        <main className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* HEADER */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={blog.author?.avatar || 'https://via.placeholder.com/40'} alt="Author" className="w-10 h-10 rounded-full object-cover border border-gray-100" />
              <div>
                <h3 className="font-bold text-[15px] leading-tight hover:underline cursor-pointer">
                  {blog.author?.fullName || blog.author?.username || 'Tác giả'}
                </h3>
                <p className="text-[13px] text-gray-500 mt-0.5 flex items-center gap-1">
                  {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('vi-VN')}
                  · <Globe size={12} />
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {user?.role !== 'admin' && !isAdminPreview && (
                <button onClick={handleBookmark} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                  <Bookmark size={20} className={interaction.isBookmarked ? "text-blue-600 fill-blue-600" : ""} />
                </button>
              )}  
            </div>
          </div>

          {/* BODY */}
          <div className="px-4 pb-4">
            <h1 className="text-[24px] font-bold text-gray-900 mb-4 leading-tight">{blog.title}</h1>
            <div className="prose max-w-none text-[15px] text-gray-800 mb-6" dangerouslySetInnerHTML={{ __html: blog.content }} />
            {blog.coverImage?.url && <img src={blog.coverImage.url} alt="Cover" className="w-full rounded-lg mb-6 object-cover" />}
          </div>

          <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center text-[14px] text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {/* 🔥 KHÓA NÚT LIKE KHI PREVIEW */}
                {!isAdminPreview ? (
                  <button onClick={handleLike} className="flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-gray-100">
                    <Heart size={18} className={interaction.isLiked ? "text-red-500 fill-red-500" : ""} />
                    <span>{blog.likeCount || 0}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-lg opacity-60">
                    <Heart size={18} />
                    <span>{blog.likeCount || 0}</span>
                  </div>
                )}
              </div>
              <span>{blog.commentCount || 0} bình luận</span>
              <span>{blog.viewCount || 0} lượt xem</span>
            </div>
          </div>

          {/* COMMENT SECTION - 🔥 CHỈ HIỆN KHI KHÔNG PHẢI PREVIEW */}
          {!isAdminPreview && (
            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-2 mb-6">
                <img src={user?.avatar || 'https://via.placeholder.com/32'} alt="User" className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1 bg-[#F0F2F5] rounded-2xl flex items-center px-3">
                  <input 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)} 
                    placeholder="Viết bình luận..." 
                    className="flex-1 bg-transparent py-2 text-[14px] focus:outline-none" 
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()} 
                  />
                  <button onClick={handleAddComment} disabled={!newComment.trim()} className="text-blue-600 font-bold text-sm ml-2 disabled:opacity-50">Gửi</button>
                </div>
              </div>
              <div className="space-y-4">
                {loadingComments ? <p className="text-sm text-gray-500 text-center">Đang tải...</p> : comments.map(c => <CommentItem key={c._id} c={c} />)}
              </div>
            </div>
          )}
        </main>

        {/* RELATED PRODUCTS */}
        {blog.relatedProducts?.length > 0 && (
          <div className="mt-4 bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><ShoppingBag size={20} className="text-blue-600" /> Sản phẩm được nhắc đến</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {blog.relatedProducts.map(p => {
                const isOutOfStock = p.stock <= 0 && p.totalStock <= 0;
                return (
                  <div key={p._id} className="border border-gray-100 rounded-xl p-3 hover:shadow-md transition-shadow group flex flex-col justify-between">
                    <div>
                      <img src={p.images?.[0]} className="w-full h-40 object-cover rounded-lg mb-3" alt={p.name} />
                      <p className="font-bold text-sm text-gray-900 line-clamp-2" title={p.name}>{p.name}</p>
                      <p className="text-red-500 font-bold text-sm mt-1">
                        {(p.displayPrice || p.price)?.toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => handleAddToCart(p)}
                      disabled={isOutOfStock}
                      className={`w-full mt-3 text-white text-xs font-bold py-2 rounded-lg transition-colors ${
                        isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
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