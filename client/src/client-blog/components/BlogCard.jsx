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
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-5 transition-all hover:shadow-md group">
      {/* CARD HEADER */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img 
              src={authorAvatar} 
              alt={authorName} 
              className="w-10 h-10 rounded-full object-cover border border-gray-100 hover:opacity-90 transition-opacity cursor-pointer"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-gray-900 text-[15px] hover:underline cursor-pointer leading-none">
                {authorName}
              </h3>
              {authorRole && (
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-md tracking-wider">
                  {authorRole}
                </span>
              )}
            </div>
            <p className="text-[12px] text-gray-500 mt-1 flex items-center">
              {formattedDate} <span className="mx-1">·</span> <span className="hover:underline cursor-pointer">Công khai</span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleBookmark}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
          >
            <Bookmark
              size={20}
              className={bookmarked ? "text-blue-600 fill-blue-600" : ""}
            />
          </button>
        </div>
      </div>
      
      {/* CARD CONTENT */}
      <div className="px-4 pb-3">
        <Link to={`/blogs/${slug || _id}`}>
          <h2 className="text-[19px] font-bold text-gray-900 mb-2 leading-snug hover:text-blue-600 transition-colors">
            {title}
          </h2>
        </Link>
        <p className="text-gray-600 text-[14px] leading-relaxed line-clamp-3">
          {excerpt}
        </p>
      </div>

      {/* COVER IMAGE */}
      {coverImage && (
        <Link to={`/blogs/${slug || _id}`} className="block overflow-hidden">
          <img 
            src={coverImage?.url || coverImage}
            alt={title} 
            className="w-full aspect-[16/9] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </Link>
      )}

      {/* STATS SUMMARY */}
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center text-[13px] text-gray-500">
        <div className="flex items-center space-x-2">
          <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center ring-2 ring-white">
            <Heart size={12} className="text-white fill-current" />
          </span>
          <span className="hover:underline cursor-pointer">{likes.toLocaleString()}</span>
        </div>
        <div className="flex space-x-4">
          <span className="hover:underline cursor-pointer">{commentCount.toLocaleString()} bình luận</span>
          <span className="hover:underline cursor-pointer">{viewCount.toLocaleString()} lượt xem</span>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="px-2 py-1 flex justify-between space-x-1">
        <button
          onClick={handleLike}
          className="flex-1 flex items-center justify-center space-x-2 py-2 text-gray-600 font-semibold text-[14px] hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-all"
        >
          <Heart
            size={20}
            className={isLiked ? "text-red-500 fill-red-500" : ""}
          />
          <span>Thích</span>
        </button>
        <Link 
          to={`/blogs/${slug || _id}`}
          className="flex-1 flex items-center justify-center space-x-2 py-2 text-blue-600 font-bold text-[14px] hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-all"
        >
          <Eye size={20} />
          <span>Xem thêm</span>
        </Link>
      </div>
    </div>
  );
};

export default BlogCard;