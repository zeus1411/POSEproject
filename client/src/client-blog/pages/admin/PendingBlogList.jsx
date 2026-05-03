import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import AdminLayout from '../../../client-eco/components/admin/AdminLayout';

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
      <div className="min-h-screen bg-[#f8f9ff] p-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black tracking-tight text-[#1e293b]">
                Bài viết chờ duyệt
              </h1>
              <span className="bg-[#4f46e5]/10 text-[#4f46e5] px-3 py-1 rounded-full text-sm font-bold">
                {blogs?.length || 0} bài chờ duyệt
              </span>
            </div>
            <p className="text-slate-500 font-medium">
              Quản lý và kiểm duyệt các bài viết mới gửi các users.
            </p>
          </div>
        </div>

        {/* Content Table Section */}
        <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(11,28,48,0.04)] overflow-hidden border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Bài viết</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Tác giả</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Ngày gửi</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Trạng thái</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                   <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      Đang tải danh sách...
                   </td>
                </tr>
              ) : blogs?.length === 0 ? (
                <tr>
                   <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      Không có bài viết nào đang chờ duyệt.
                   </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="max-w-md">
                        <h3 className="font-bold text-[#1e293b] group-hover:text-[#4f46e5] transition-colors mb-1 line-clamp-1">
                          {blog.title}
                        </h3>
                        <p className="text-sm text-slate-400 line-clamp-1">
                          {blog.excerpt || "Khám phá nội dung bài viết mới nhất từ cộng tác viên..."}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                          {blog.author?.avatar ? (
                            <img src={blog.author.avatar} alt={blog.author.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#4f46e5] text-white text-xs font-bold uppercase">
                              {blog.author?.fullName?.charAt(0) || 'A'}
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{blog.author?.fullName || "Ẩn danh"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-slate-500 font-medium">
                        {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Oct 24, 2023'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-600">
                        ● Chờ duyệt
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          disabled={processingId === blog._id}
                          onClick={() => handleApprove(blog._id)}
                          className={`
                            px-4 py-1.5 rounded-lg text-sm font-bold transition-all
                            ${processingId === blog._id 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                              : 'bg-[#4f46e5]/10 text-[#4f46e5] hover:bg-[#4f46e5] hover:text-white shadow-sm'}
                          `}
                        >
                          {processingId === blog._id ? '...' : 'Duyệt'}
                        </button>
                        <button
                          disabled={processingId === blog._id}
                          onClick={() => handleReject(blog._id)}
                          className={`
                            px-4 py-1.5 rounded-lg text-sm font-bold transition-all
                            ${processingId === blog._id 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                              : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white shadow-sm'}
                          `}
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

          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
                Trang {page} / {totalPages}
            </p>

            <div className="flex gap-2">

                <button
                disabled={page === 1}
                onClick={() => fetchPendingBlogs(page - 1)}
                className={`
                    px-4 py-2 rounded-lg border font-medium
                    ${page === 1
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-white hover:bg-slate-50 text-slate-700'}
                `}
                >
                Prev
                </button>

                <button
                disabled={page === totalPages}
                onClick={() => fetchPendingBlogs(page + 1)}
                className={`
                    px-4 py-2 rounded-lg border font-medium
                    ${page === totalPages
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-white hover:bg-slate-50 text-slate-700'}
                `}
                >
                Next
                </button>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default PendingBlogList;
