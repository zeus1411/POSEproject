import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AdminLayout from '../../../client-eco/components/admin/AdminLayout';
import ConfirmDialog from '../../../client-eco/components/common/ConfirmDialog';
import { getAllBlogs, deleteBlog } from '../../redux/slices/blogSlice';
import { useTheme } from '../../../client-eco/context/ThemeContext';

const BlogList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { blogs, isLoading, page, totalPages } = useSelector((state) => state.blog);
  console.log({ page, totalPages, blogs });
  const [confirmId, setConfirmId] = React.useState(null);
  
  useEffect(() => {
        dispatch(getAllBlogs({ page: 1, limit: 10 }))
        .then(res => console.log(res.payload));
  }, [dispatch]);

  const handleDelete = async (id) => {    
    try {
        await dispatch(deleteBlog(id)).unwrap();
        toast.success('Xoá bài viết thành công');
        dispatch(getAllBlogs({ page, limit: 10 }));
    } catch (err) {
        toast.error('Xoá thất bại: ' + err);
    } finally {
        setConfirmId(null);
    }};

  return (
    <AdminLayout>
      <div className="min-h-screen bg-transparent p-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className={`text-3xl font-black tracking-tight transition-all duration-300 ${
                isDark ? 'text-white' : 'text-[#1e293b]'
              }`}>
                Quản lý Blog
              </h1>

              <span className={`px-3 py-1 rounded-full text-sm font-bold transition-all duration-300 ${
                isDark 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'bg-[#4f46e5]/10 text-[#4f46e5]'
              }`}>
                {blogs?.length || 0} bài viết
              </span>
            </div>

            <p className={`font-medium transition-all duration-300 ${
              isDark ? 'text-gray-400' : 'text-slate-500'
            }`}>
              Quản lý, chỉnh sửa, xoá và kiểm duyệt bài viết trong hệ thống.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/blogs/create")}
            className={`px-5 py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ${
              isDark 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/20' 
                : 'bg-[#4f46e5] hover:bg-[#4338ca] text-white shadow-indigo-900/10'
            }`}
          >
            + Tạo bài viết
          </button>
        </div>

        {/* TABLE */}
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
                }`}>
                  Bài viết
                </th>

                <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-slate-400'
                }`}>
                  Danh mục
                </th>

                <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-slate-400'
                }`}>
                  Trạng thái
                </th>

                <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-center transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-slate-400'
                }`}>
                  Hành động
                </th>
              </tr>
            </thead>

            <tbody className={`divide-y transition-colors duration-300 ${
              isDark ? 'divide-white/10' : 'divide-water/10'
            }`}>
              {isLoading ? (
                <tr>
                  <td
                    colSpan="4"
                    className={`px-6 py-12 text-center font-medium transition-colors duration-300 ${
                      isDark ? 'text-gray-400' : 'text-slate-400'
                    }`}
                  >
                    Đang tải danh sách...
                  </td>
                </tr>
              ) : blogs?.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className={`px-6 py-12 text-center font-medium transition-colors duration-300 ${
                      isDark ? 'text-gray-400' : 'text-slate-400'
                    }`}
                  >
                    Không có bài viết
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr
                    key={blog._id}
                    className={`transition-colors group ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-water/5'
                    }`}
                  >
                    {/* BLOG */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={blog.coverImage?.url}
                          alt=""
                          className={`w-20 h-14 rounded-xl object-cover border transition-colors duration-300 ${
                            isDark ? 'border-white/10' : 'border-slate-100'
                          }`}
                        />

                        <div>
                          <h3
                            className={`font-bold transition-colors line-clamp-1 ${
                              isDark 
                                ? 'text-white group-hover:text-emerald-400' 
                                : 'text-[#1e293b] group-hover:text-[#4f46e5]'
                            }`}
                          >
                            {blog.title}
                          </h3>

                          <p className={`text-sm mt-1 transition-colors duration-300 ${
                            isDark ? 'text-gray-500' : 'text-slate-400'
                          }`}>
                            ID: {blog._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold border transition-all duration-300 ${
                          isDark 
                            ? 'bg-white/5 border-white/10 text-gray-300' 
                            : 'bg-slate-100 border-water/10 text-slate-600'
                        }`}
                      >
                        {blog.category?.name || "-"}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-5">
                      {blog.status === "PUBLISHED" && (
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border transition-all duration-300 ${
                          isDark 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-green-100 text-green-700 border-green-200/50'
                        }`}>
                          ● Đã đăng
                        </span>
                      )}

                      {blog.status === "PENDING" && (
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border transition-all duration-300 ${
                          isDark 
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' 
                            : 'bg-orange-100 text-orange-600 border-orange-200/50'
                        }`}>
                          ● Chờ duyệt
                        </span>
                      )}

                      {blog.status === "DRAFT" && (
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border transition-all duration-300 ${
                          isDark 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                            : 'bg-red-100 text-red-600 border-red-200/50'
                        }`}>
                          ● Bị từ chối
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            window.open(`/admin/blogs/preview/${blog._id}`, "_blank")
                          }
                          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all border duration-200 ${
                            isDark
                              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-600 hover:text-white border-emerald-500/20'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border-emerald-100/50'
                          }`}
                        >
                          Xem bài
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/admin/blogs/edit/${blog._id}`)
                          }
                          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all border duration-200 ${
                            isDark
                              ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white border-blue-500/20'
                              : 'bg-[#4f46e5]/10 text-[#4f46e5] hover:bg-[#4f46e5] hover:text-white border-indigo-100/50'
                          }`}
                        >
                          Sửa
                        </button>

                        <button
                          onClick={() => setConfirmId(blog._id)}
                          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all border duration-200 ${
                            isDark
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white border-red-500/20'
                              : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-red-100/50'
                          }`}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className={`px-6 py-4 border-t flex items-center justify-between transition-colors duration-300 ${
            isDark ? 'border-white/10 text-gray-300' : 'border-water/20 text-slate-500'
          }`}>
            <p className="text-sm font-medium">
              Trang {page} / {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() =>
                  dispatch(
                    getAllBlogs({
                      page: page - 1,
                      limit: 10,
                    })
                  )
                }
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
                onClick={() =>
                  dispatch(
                    getAllBlogs({
                      page: page + 1,
                      limit: 10,
                    })
                  )
                }
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

        {/* DELETE CONFIRM */}
        {confirmId && (
          <ConfirmDialog
            isOpen={true}
            title="Xác nhận xóa"
            message="Bạn có chắc muốn xóa bài viết này?"
            onConfirm={() => handleDelete(confirmId)}
            onCancel={() => setConfirmId(null)}
            isDangerous={true}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default BlogList;