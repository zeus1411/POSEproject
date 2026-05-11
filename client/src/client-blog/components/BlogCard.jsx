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
  const authorRole = author?.role || 'Thành viên';
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
      setLoadingLike(false);
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
    <div className="group bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:bg-white/10 hover:translate-y-[-4px] shadow-xl">
      
      {/* 1. COVER IMAGE - Chiếm phần trên của thẻ */}
      {coverImage && (
        <Link to={`/blogs/${slug || _id}`} className="block overflow-hidden m-4 rounded-[2rem]">
          <img 
            src={coverImage?.url || coverImage}
            alt={title} 
            className="w-full aspect-[21/9] object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
      )}

      {/* 2. CARD CONTENT */}
      <div className="px-8 pb-6 pt-2">
        {/* Title */}
        <Link to={`/blogs/${slug || _id}`}>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight group-hover:text-cyan-300 transition-colors">
            {title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-300 text-base leading-relaxed mb-8 line-clamp-3 font-light">
          {excerpt}
        </p>

        {/* 3. AUTHOR & STATS ROW */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10">
          
          {/* Left: Author Info */}
          <div className="flex items-center space-x-3">
            <img 
              src={authorAvatar} 
              alt={authorName} 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-500/30"
            />
            <div>
              <p className="text-sm font-semibold text-white">{authorName}</p>
              <p className="text-[11px] text-gray-400 uppercase tracking-widest">{formattedDate}</p>
            </div>
          </div>

          {/* Right: Interaction Stats (Like, View, Comment) */}
          <div className="flex items-center space-x-6 text-gray-300">
            <div className="flex items-center space-x-1.5 cursor-pointer hover:text-red-400 transition-colors" onClick={handleLike}>
              <Heart size={18} className={isLiked ? "fill-red-500 text-red-500" : ""} />
              <span className="text-sm font-medium">{likes}</span>
            </div>
            
            <div className="flex items-center space-x-1.5">
              <Eye size={18} />
              <span className="text-sm font-medium">{viewCount}</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <MessageCircle size={18} />
              <span className="text-sm font-medium">{commentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;