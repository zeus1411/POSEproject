import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Eye, Bookmark, MoreHorizontal } from 'lucide-react';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { deleteBlog } from '../redux/slices/blogSlice';
import blogInteractionService from '../services/blogInteractionService';

const BlogCard = ({ blog }) => {
  const { 
    _id, title, slug, author, coverImage, 
    likeCount = 0, commentCount = 0, viewCount = 0, 
    excerpt, createdAt 
  } = blog;

  const authorName = author?.name || author?.fullName || author?.username || 'Người dùng ẩn danh';
  const authorAvatar = author?.avatar || 'https://via.placeholder.com/40';
  
  const getRoleLabel = (role) => {
    if (!role) return 'Thành viên';
    
    const lowerRole = String(role).toLowerCase();
    if (lowerRole === 'admin') return 'Quản trị viên';
    if (lowerRole === 'mod' || lowerRole === 'moderator') return 'Kiểm duyệt viên';
    
    return 'Thành viên';
  };

  const authorRole = getRoleLabel(author?.role);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [likes, setLikes] = useState(likeCount);
  const [isLiked, setIsLiked] = useState(false);

  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(blog.bookmarkCount || 0);

  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);

  const formattedDate = new Date(createdAt).toLocaleDateString('vi-VN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !_id) return;

    const fetchInteractionStatus = async () => {
      try {
        const data = await blogInteractionService.getMyInteractions([_id]);
        if (data?.statuses?.[_id]) {
          setIsLiked(data.statuses[_id].isLiked);
          setBookmarked(data.statuses[_id].isBookmarked);
        }
      } catch (error) {
        console.error("Lỗi tải trạng thái tương tác:", error);
      }
    };

    fetchInteractionStatus();
  }, [_id]);

  const handleLike = async (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (!localStorage.getItem('token')) {
      Swal.fire({
        icon: 'warning',
        title: 'Vui lòng đăng nhập',
        text: 'Bạn cần đăng nhập để thực hiện thao tác này.',
        confirmButtonText: 'Đóng'
      });
      return;
    }
    if (loadingLike) return;
    
    setLoadingLike(true);
    try {
      const res = await blogInteractionService.toggleLike(_id);
      setIsLiked(res.isActed);
      setLikes(res.counts?.likes || res.newCount || likes); 
    } catch (err) {
      console.log(err);
    } finally {
      style-setLoadingLike(false);
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!localStorage.getItem('token')) {
      Swal.fire({
        icon: 'warning',
        title: 'Vui lòng đăng nhập',
        text: 'Bạn cần đăng nhập để thực hiện thao tác này.',
        confirmButtonText: 'Đóng'
      });
      return;
    }
    if (loadingBookmark) return;

    setLoadingBookmark(true);
    try {
      const res = await blogInteractionService.toggleBookmark(_id);
      setBookmarked(res.isActed);
      setBookmarkCount(res.counts?.bookmarks || res.newCount || bookmarkCount);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingBookmark(false);
    }
  };

  return (
    <div className="group bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden mb-6 transition-all duration-500 hover:bg-white/10 hover:translate-y-[-4px] shadow-xl hover:shadow-[0_20px_40px_rgba(16,185,129,0.1)]">
      
      {/* 1. CARD HEADER (Dữ liệu cấu trúc Code 1 phối màu Code 2) */}
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img 
              src={authorAvatar} 
              alt={authorName} 
              className="w-10 h-10 rounded-full object-cover border border-white/10 hover:opacity-90 transition-opacity cursor-pointer ring-2 ring-emerald-500/20"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#051C1C] rounded-full"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-white text-[15px] hover:text-emerald-400 hover:underline cursor-pointer leading-none transition-colors">
                {authorName}
              </h3>
              {authorRole && (
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wider ${
                  author?.role?.toLowerCase() === 'admin'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' // Màu vàng/cam sang trọng cho Admin
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10' // Màu xanh cho User
                }`}>
                  {authorRole}
                </span>
              )}
            </div>
            <p className="text-[12px] text-gray-400 mt-1.5 flex items-center">
              {formattedDate} <span className="mx-1.5">·</span> <span className="hover:underline cursor-pointer">Công khai</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-full transition-all ${
              bookmarked ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bookmark
              size={20}
              className={bookmarked ? "fill-current" : ""}
            />
          </button>
        </div>
      </div>
      
      {/* 2. CARD CONTENT (Giữ nguyên thứ tự Code 1 nhưng đổi màu text) */}
      <div className="px-4 pt-4 pb-3">
        <Link to={`/blogs/${slug || _id}`}>
          <h2 className="text-[20px] font-bold text-white mb-2 leading-snug group-hover:text-cyan-300 transition-colors">
            {title}
          </h2>
        </Link>
        <p className="text-gray-300 text-[14px] leading-relaxed line-clamp-3 font-light">
          {excerpt}
        </p>
      </div>

      {/* 3. COVER IMAGE (Đặt ở giữa theo cấu trúc Code 1) */}
      {coverImage && (
        <Link to={`/blogs/${slug || _id}`} className="block overflow-hidden border-y border-white/5">
          <img 
            src={coverImage?.url || coverImage}
            alt={title} 
            className="w-full aspect-[16/9] object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </Link>
      )}

      {/* 4. STATS SUMMARY (Đổi màu hiển thị sáng hơn) */}
      <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center text-[13px] text-gray-400 bg-black/10">
        <div className="flex items-center space-x-2">
          <span className="w-5 h-5 bg-rose-500/20 rounded-full flex items-center justify-center ring-1 ring-rose-500/30">
            <Heart size={12} className="text-rose-400 fill-current" />
          </span>
          <span className="hover:text-white transition-colors cursor-pointer font-medium">{likes.toLocaleString()}</span>
        </div>
        <div className="flex space-x-4">
          <span className="hover:text-white transition-colors cursor-pointer">{commentCount.toLocaleString()} bình luận</span>
          <span className="hover:text-white transition-colors cursor-pointer">{viewCount.toLocaleString()} lượt xem</span>
        </div>
      </div>

      {/* 5. ACTION BUTTONS (Vị trí Code 1, style kính mờ xanh của Code 2) */}
      <div className="px-2 py-1 flex justify-between space-x-1 bg-white/[0.02]">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 font-semibold text-[14px] rounded-lg transition-all ${
            isLiked 
              ? 'bg-rose-500/10 text-rose-400' 
              : 'text-gray-300 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Heart
            size={18}
            className={isLiked ? "fill-current" : ""}
          />
          <span>Thích</span>
        </button>
        
        <Link 
          to={`/blogs/${slug || _id}`}
          className="flex-1 flex items-center justify-center space-x-2 py-2 text-emerald-400 font-bold text-[14px] hover:bg-emerald-500/10 rounded-lg transition-all"
        >
          <Eye size={18} />
          <span>Xem thêm</span>
        </Link>
      </div>
    </div>
  );
};

export default BlogCard;