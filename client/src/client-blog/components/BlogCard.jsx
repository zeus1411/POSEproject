import React from 'react';
import { Link } from 'react-router-dom';

const formatNumber = (num) => {
  if (!num) return 0;
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num;
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const BlogCard = ({ blog }) => {
  return (
    <Link
      to={`/blogs/${blog.slug || blog._id}`}
        className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/70 hover:-translate-y-1"    >
      {/* Cover Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
        {blog.coverImage?.url ? (
          <img
            src={blog.coverImage.url}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
             <span className="text-xs font-medium uppercase tracking-wider">No Image</span>
          </div>
        )}
        
        {/* Category Badge (Optional/Static for now as per design) */}
        {blog.category && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-semibold uppercase tracking-widest rounded-full border border-blue-100">
              {blog.category?.name}
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 p-6">
        <h3 className="text-xl font-bold text-gray-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
          {blog.title}
        </h3>

        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
          {blog.excerpt || blog.content?.substring(0, 150) + '...'}
        </p>

        {/* Footer / Stats Section */}
        <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4 text-gray-500">
            <div className="flex items-center gap-1.5 transition-colors hover:text-rose-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span className="text-xs font-semibold">{formatNumber(blog.likeCount)}</span>
            </div>
            <div className="flex items-center gap-1.5 transition-colors hover:text-indigo-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              <span className="text-xs font-semibold">{formatNumber(blog.viewCount)}</span>
            </div>
          </div>

          <div className="text-[11px] font-medium text-gray-400 uppercase tracking-widest italic">
            {formatDate(blog.createdAt)}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;