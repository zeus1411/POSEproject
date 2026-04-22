import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AdminLayout from '../../../client-eco/components/admin/AdminLayout';
import ConfirmDialog from '../../../client-eco/components/common/ConfirmDialog';
import { getAllBlogs, deleteBlog } from '../../redux/slices/blogSlice';

const BlogList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-[#f8f9ff] p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black tracking-tight text-[#1e293b]">
              Quản lý Blog
            </h1>

            <span className="bg-[#4f46e5]/10 text-[#4f46e5] px-3 py-1 rounded-full text-sm font-bold">
              {blogs?.length || 0} bài viết
            </span>
          </div>

          <p className="text-slate-500 font-medium">
            Quản lý, chỉnh sửa, xoá và kiểm duyệt bài viết trong hệ thống.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/blogs/create")}
          className="
            bg-[#4f46e5]
            text-white
            px-5 py-3
            rounded-xl
            font-bold
            shadow-md
            hover:shadow-lg
            hover:scale-[1.02]
            transition-all
          "
        >
          + Tạo bài viết
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(11,28,48,0.04)] overflow-hidden border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Bài viết
              </th>

              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Danh mục
              </th>

              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Trạng thái
              </th>

              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-12 text-center text-slate-400"
                >
                  Đang tải danh sách...
                </td>
              </tr>
            ) : blogs?.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-12 text-center text-slate-400"
                >
                  Không có bài viết
                </td>
              </tr>
            ) : (
              blogs.map((blog) => (
                <tr
                  key={blog._id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  {/* BLOG */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <img
                        src={blog.coverImage?.url}
                        alt=""
                        className="
                          w-20 h-14
                          rounded-xl
                          object-cover
                          border border-slate-100
                        "
                      />

                      <div>
                        <h3
                          className="
                            font-bold
                            text-[#1e293b]
                            group-hover:text-[#4f46e5]
                            transition-colors
                            line-clamp-1
                          "
                        >
                          {blog.title}
                        </h3>

                        <p className="text-sm text-slate-400 mt-1">
                          ID: {blog._id.slice(-8)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* CATEGORY */}
                  <td className="px-6 py-5">
                    <span
                      className="
                        bg-slate-100
                        text-slate-600
                        px-3 py-1
                        rounded-full
                        text-sm
                        font-semibold
                      "
                    >
                      {blog.category?.name || "-"}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-5">
                    {blog.status === "PUBLISHED" && (
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        ● Published
                      </span>
                    )}

                    {blog.status === "PENDING" && (
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-600">
                        ● Pending
                      </span>
                    )}

                    {blog.status === "DRAFT" && (
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
                        ● Draft (Rejected)
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      {blog.status === "PENDING" && (
                        <button
                          onClick={() => navigate("/admin/blogs/pending")}
                          className="
                            px-4 py-1.5
                            rounded-lg
                            bg-blue-50
                            text-blue-600
                            hover:bg-blue-600
                            hover:text-white
                            text-sm font-bold
                            transition-all
                          "
                        >
                          Duyệt
                        </button>
                      )}
                      <button
                        onClick={() =>
                          window.open(`/admin/blogs/preview/${blog._id}`, "_blank")
                        }
                        className="
                          px-4 py-1.5
                          rounded-lg
                          bg-emerald-50
                          text-emerald-600
                          hover:bg-emerald-600
                          hover:text-white
                          text-sm font-bold
                          transition-all
                        "
                      >
                        Xem bài
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/admin/blogs/edit/${blog._id}`)
                        }
                        className="
                          px-4 py-1.5
                          rounded-lg
                          bg-[#4f46e5]/10
                          text-[#4f46e5]
                          hover:bg-[#4f46e5]
                          hover:text-white
                          text-sm font-bold
                          transition-all
                        "
                      >
                        Sửa
                      </button>

                      <button
                        onClick={() => setConfirmId(blog._id)}
                        className="
                          px-4 py-1.5
                          rounded-lg
                          bg-red-50
                          text-red-600
                          hover:bg-red-600
                          hover:text-white
                          text-sm font-bold
                          transition-all
                        "
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
        <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between">
          <p className="text-sm text-slate-500">
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
              className={`
                px-4 py-2 rounded-lg border font-medium
                ${
                  page === 1
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-white hover:bg-slate-50 text-slate-700"
                }
              `}
            >
              Prev
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
              className={`
                px-4 py-2 rounded-lg border font-medium
                ${
                  page === totalPages
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-white hover:bg-slate-50 text-slate-700"
                }
              `}
            >
              Next
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