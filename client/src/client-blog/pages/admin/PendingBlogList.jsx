import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import AdminLayout from '../../../client-eco/components/admin/AdminLayout';
import { useTheme } from '../../../client-eco/context/ThemeContext';

import {
  getAllBlogs,
  updateBlogStatus
} from '../../redux/slices/blogSlice';

/**
 * Component hiển thị danh sách bài viết đang chờ duyệt.
 * Đã được cải thiện UI/UX theo phong cách Editorial Utility.
 */
const PendingBlogList = () => {
  const dispatch = useDispatch();
  const { isDark } = useTheme();

  // Lấy dữ liệu từ Redux store
  const {
    blogs,
    isLoading,
    page,
    totalPages
  } = useSelector((state) => state.blog);

  // Trạng thái để hiển thị loading trên từng dòng cụ thể khi đang thực hiện action
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingBlogs(page);
    
    // Dispatch event để cập nhật badge hoặc số lượng ở nơi khác nếu cần
    window.dispatchEvent(new Event('pending-blog-updated'));
  }, [dispatch]);

  const fetchPendingBlogs = (currentPage = 1) => {
    dispatch(
      getAllBlogs({
        status: 'PENDING',
        page: currentPage,
        limit: 10
      })
    );
  };

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      await dispatch(
        updateBlogStatus({
          id,
          status: 'PUBLISHED'
        })
      ).unwrap();

      toast.success("Đã duyệt bài viết thành công!");
      fetchPendingBlogs(page);
    } catch (err) {
      toast.error(err?.message || "Có lỗi xảy ra khi duyệt bài.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Lý do từ chối bài viết này:");
    if (!reason) return;

    try {
      setProcessingId(id);
      await dispatch(
        updateBlogStatus({
          id,
          status: 'REJECTED',
          rejectionReason: reason
        })
      ).unwrap();

      toast.success("Đã từ chối bài viết.");
      fetchPendingBlogs(page);
    } catch (err) {
      toast.error(err?.message || "Có lỗi xảy ra khi từ chối bài.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-transparent p-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className={`text-3xl font-black tracking-tight transition-all duration-300 ${
                isDark ? 'text-white' : 'text-[#1e293b]'
              }`}>
                Bài viết chờ duyệt
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-bold transition-all duration-300 ${
                isDark 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'bg-[#4f46e5]/10 text-[#4f46e5]'
              }`}>
                {blogs?.length || 0} bài chờ duyệt
              </span>
            </div>
            <p className={`font-medium transition-all duration-300 ${
              isDark ? 'text-gray-400' : 'text-slate-500'
            }`}>
              Quản lý và kiểm duyệt các bài viết mới gửi từ các users.
            </p>
          </div>
        </div>

        {/* Content Table Section */}
        <div className={`glass-panel rounded-3xl overflow-hidden mb-6 border transition-all duration-300 ${
          isDark ? 'border-white/10 shadow-black/40' : 'border-water/30 shadow-slate-900/5'
        }`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b transition-colors duration-300 ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50/50 border-water/20'
              }`}>
                <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-slate-400'
                }`}>Bài viết</th>
                <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-slate-400'
                }`}>Tác giả</th>
                <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-slate-400'
                }`}>Ngày gửi</th>
                <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-slate-400'
                }`}>Trạng thái</th>
                <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-center transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-slate-400'
                }`}>Hành động</th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors duration-300 ${
              isDark ? 'divide-white/10' : 'divide-water/10'
            }`}>
              {isLoading ? (
                <tr>
                   <td colSpan="5" className={`px-6 py-12 text-center font-medium transition-colors duration-300 ${
                     isDark ? 'text-gray-400' : 'text-slate-400'
                   }`}>
                      Đang tải danh sách...
                   </td>
                </tr>
              ) : blogs?.length === 0 ? (
                <tr>
                   <td colSpan="5" className={`px-6 py-12 text-center font-medium transition-colors duration-300 ${
                     isDark ? 'text-gray-400' : 'text-slate-400'
                   }`}>
                      Không có bài viết nào đang chờ duyệt.
                   </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog._id} className={`transition-colors group ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-water/5'
                  }`}>
                    <td className="px-6 py-5">
                      <div className="max-w-md">
                        <h3 className={`font-bold transition-colors mb-1 line-clamp-1 ${
                          isDark 
                            ? 'text-white group-hover:text-emerald-400' 
                            : 'text-[#1e293b] group-hover:text-[#4f46e5]'
                        }`}>
                          {blog.title}
                        </h3>
                        <p className={`text-sm line-clamp-1 transition-colors duration-300 ${
                          isDark ? 'text-gray-400' : 'text-slate-400'
                        }`}>
                          {blog.excerpt || "Khám phá nội dung bài viết mới nhất từ cộng tác viên..."}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border transition-colors duration-300 ${
                          isDark ? 'bg-white/5 border-white/10' : 'bg-slate-200 border-water/10'
                        }`}>
                          {blog.author?.avatar ? (
                            <img src={blog.author.avatar} alt={blog.author.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center text-white text-xs font-bold uppercase transition-colors duration-300 ${
                              isDark ? 'bg-emerald-600' : 'bg-[#4f46e5]'
                            }`}>
                              {blog.author?.fullName?.charAt(0) || 'A'}
                            </div>
                          )}
                        </div>
                        <span className={`text-sm font-semibold transition-colors duration-300 ${
                          isDark ? 'text-gray-300' : 'text-slate-700'
                        }`}>{blog.author?.fullName || "Ẩn danh"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-sm font-medium transition-colors duration-300 ${
                        isDark ? 'text-gray-400' : 'text-slate-500'
                      }`}>
                        {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Oct 24, 2023'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all duration-300 ${
                        isDark 
                          ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' 
                          : 'bg-orange-100 text-orange-600 border-orange-200/50'
                      }`}>
                        ● Chờ duyệt
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          disabled={processingId === blog._id}
                          onClick={() => handleApprove(blog._id)}
                          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all border duration-200 ${
                            processingId === blog._id 
                              ? 'opacity-40 cursor-not-allowed border-transparent bg-transparent' 
                              : isDark
                                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-600 hover:text-white border-emerald-500/20'
                                : 'bg-[#4f46e5]/10 text-[#4f46e5] hover:bg-[#4f46e5] hover:text-white border-indigo-100/50 shadow-sm'
                          }`}
                        >
                          {processingId === blog._id ? '...' : 'Duyệt'}
                        </button>
                        <button
                          disabled={processingId === blog._id}
                          onClick={() => handleReject(blog._id)}
                          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all border duration-200 ${
                            processingId === blog._id 
                              ? 'opacity-40 cursor-not-allowed border-transparent bg-transparent' 
                              : isDark
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white border-red-500/20'
                                : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-red-100/50 shadow-sm'
                          }`}
                        >
                          Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className={`px-6 py-4 border-t flex items-center justify-between transition-colors duration-300 ${
            isDark ? 'border-white/10 text-gray-300' : 'border-water/20 text-slate-500'
          }`}>
            <p className="text-sm font-medium">
                Trang {page} / {totalPages}
            </p>

            <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => fetchPendingBlogs(page - 1)}
                  className={`px-4 py-2 rounded-lg border font-semibold transition-all duration-200 ${
                    page === 1
                      ? 'opacity-40 cursor-not-allowed border-transparent bg-transparent'
                      : isDark
                        ? 'border-white/10 text-gray-300 bg-white/5 hover:bg-white/10 hover:text-white'
                        : 'border-water/20 text-slate-700 bg-white hover:bg-water/10 hover:text-slate-900'
                  }`}
                >
                  Trước
                </button>

                <button
                  disabled={page === totalPages}
                  onClick={() => fetchPendingBlogs(page + 1)}
                  className={`px-4 py-2 rounded-lg border font-semibold transition-all duration-200 ${
                    page === totalPages
                      ? 'opacity-40 cursor-not-allowed border-transparent bg-transparent'
                      : isDark
                        ? 'border-white/10 text-gray-300 bg-white/5 hover:bg-white/10 hover:text-white'
                        : 'border-water/20 text-slate-700 bg-white hover:bg-water/10 hover:text-slate-900'
                  }`}
                >
                  Tiếp
                </button>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default PendingBlogList;
