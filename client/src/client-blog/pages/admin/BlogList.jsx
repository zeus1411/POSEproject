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
  const [confirmId, setConfirmId] = React.useState(null);
  
  useEffect(() => {
        dispatch(getAllBlogs({ page: 1, limit: 10 }));
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
      <div className="p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">📝 Quản lý Blog</h1>

          <button
            onClick={() => navigate('/admin/blogs/create')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            + Tạo bài viết
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Ảnh</th>
                <th className="p-3">Tiêu đề</th>
                <th className="p-3">Danh mục</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center p-4">
                    Đang tải...
                  </td>
                </tr>
              ) : blogs?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-4">
                    Không có bài viết
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog._id} className="border-t">
                    <td className="p-3">
                      <img
                        src={blog.coverImage?.url}
                        alt=""
                        className="w-20 h-14 object-cover rounded"
                      />
                    </td>

                    <td className="p-3 font-medium">
                      {blog.title}
                    </td>

                    <td className="p-3">
                      {blog.category?.name || '-'}
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-1 rounded bg-gray-200 text-sm">
                        {blog.status}
                      </span>
                    </td>

                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() =>
                          navigate(`/admin/blogs/edit/${blog._id}`)
                        }
                        className="px-3 py-1 bg-yellow-400 rounded"
                      >
                        Sửa
                      </button>

                      <button
                        onClick={() => setConfirmId(blog._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-6 gap-2">
            <button
                disabled={page === 1}
                onClick={() =>
                dispatch(getAllBlogs({ page: page - 1, limit: 10 }))
                }
                className="px-3 py-1 border rounded"
            >
                Prev
            </button>

            <span className="px-4 py-1">
                Page {page} / {totalPages}
            </span>

            <button
                disabled={page === totalPages}
                onClick={() =>
                dispatch(getAllBlogs({ page: page + 1, limit: 10 }))
                }
                className="px-3 py-1 border rounded"
            >
                Next
            </button>
        </div>
      </div>

        {/* CONFIRM DELETE */}
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
    </AdminLayout>
  );
};

export default BlogList;