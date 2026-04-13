import React from 'react';
import { Link } from 'react-router-dom';

const formatNumber = (num) => {
  if (!num) return 0;
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num;
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
};

const BlogCard = ({ blog }) => {
  return (
    <Link
      to={`/blogs/${blog.slug || blog._id}`}
      className="block border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition shadow-gray-200 bg-white"
    >
      {/* Cover Image */}
      {blog.coverImage?.url && (
        <div className="h-40 w-full overflow-hidden">
          <img
            src={blog.coverImage.url}
            alt={blog.title}
            className="w-full h-full object-cover transform hover:scale-105 transition duration-300"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-bold text-lg line-clamp-2">{blog.title}</h3>

        <p className="text-gray-600 text-sm line-clamp-3">
          {blog.excerpt || blog.content}
        </p>

        {/* 👇 Stats */}
        <div className="flex justify-between items-end text-xs text-gray-500 mt-2">
          {/* Left: likes + views */}
          <div className="flex gap-3">
            <span>❤️ {formatNumber(blog.likesCount)}</span>
            <span>👁 {formatNumber(blog.views)}</span>
          </div>

          {/* Right: comments + date */}
          <div className="text-right">
            <div>💬 {formatNumber(blog.commentsCount)}</div>
            <div className="text-[10px] text-gray-400">
              {formatDate(blog.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;