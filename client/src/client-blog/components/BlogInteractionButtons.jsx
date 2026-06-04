import React, { useState } from 'react';
import { Heart, Bookmark } from 'lucide-react';
import { toast } from 'react-toastify';

import blogInteractionService from '../services/blogInteractionService';

const BlogInteractionButtons = ({
  blogId,
  initialLikes = 0,
  initialBookmarks = 0,
  initialLiked = false,
  initialBookmarked = false,
  isLoggedIn,
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [likes, setLikes] = useState(Math.max(0, initialLikes || 0));
  const [bookmarks, setBookmarks] = useState(Math.max(0, initialBookmarks || 0));

  const requireLogin = () => {
    if (!isLoggedIn) {
      toast.info('Vui lòng đăng nhập để sử dụng tính năng này');
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireLogin()) return;

    try {
      const data = await blogInteractionService.toggleLike(blogId);

      setLiked(data.isActed);
      setLikes(Math.max(0, data.counts?.likes ?? data.newCount ?? 0));
    } catch (e) {
      toast.error('Like thất bại');
    }
  };

  const handleBookmark = async () => {
    if (!requireLogin()) return;

    try {
      const data = await blogInteractionService.toggleBookmark(blogId);

      setBookmarked(data.isActed);
      setBookmarks(Math.max(0, data.counts?.bookmarks ?? data.newCount ?? 0));
    } catch (e) {
      toast.error('Lưu bài viết thất bại');
    }
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={handleLike}
        className="flex items-center gap-2"
      >
        <Heart fill={liked ? 'currentColor' : 'none'} />
        <span>{likes}</span>
      </button>

      <button
        onClick={handleBookmark}
        className="flex items-center gap-2"
      >
        <Bookmark fill={bookmarked ? 'currentColor' : 'none'} />
        <span>{bookmarks}</span>
      </button>
    </div>
  );
};

export default BlogInteractionButtons;
