import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { MessageSquare, EyeOff, Search } from 'lucide-react';

import AdminLayout from '../../../client-eco/components/admin/AdminLayout';

import commentService from '../../services/commentService';
import blogService from '../../services/blogService';
import ConfirmDialog from '../../../client-eco/components/common/ConfirmDialog';

const BlogComment = () => {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const data = await blogService.getAllBlogs();

      const blogList = data.blogs || [];

      setBlogs(blogList);

      if (blogList.length > 0) {
        const firstBlogId = blogList[0]._id;

        setSelectedBlog(firstBlogId);

        loadComments(firstBlogId);
      }
    } catch (error) {
      toast.error('Không tải được danh sách bài viết');
    }
  };

  const loadComments = async (blogId) => {
    try {
      setLoading(true);

      const data = await commentService.getCommentsByBlog(blogId);

      setComments(data.comments || []);
    } catch (error) {
      toast.error('Không tải được bình luận');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeBlog = (e) => {
    const blogId = e.target.value;

    setSelectedBlog(blogId);

    loadComments(blogId);
  };

  const handleHideComment = async () => {

    if (!selectedCommentId) return;

    try {

      await commentService.hideComment(selectedCommentId);

      toast.success('Đã ẩn bình luận');

      setComments(prev =>
        prev.filter(
          item => item._id !== selectedCommentId
        )
      );

    } catch (error) {

      toast.error('Ẩn bình luận thất bại');

    } finally {

      setShowConfirm(false);
      setSelectedCommentId(null);

    }

  };

  const filteredComments = comments.filter((comment) =>
    comment.content
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className='p-6'>
        <div className='flex items-center gap-3 mb-6'>
          <MessageSquare size={28} />
          <h1 className='text-2xl font-bold'>
            Quản lý bình luận
          </h1>
        </div>

        <div className='bg-white p-5 rounded-xl shadow mb-6'>
          <div className='grid md:grid-cols-2 gap-4'>
            <select
              value={selectedBlog}
              onChange={handleChangeBlog}
              className='border rounded-lg p-3'
            >
              {blogs.map((blog) => (
                <option
                  key={blog._id}
                  value={blog._id}
                >
                  {blog.title}
                </option>
              ))}
            </select>

            <div className='relative'>
              <Search
                size={18}
                className='absolute left-3 top-3'
              />

              <input
                type='text'
                placeholder='Tìm bình luận...'
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className='w-full border rounded-lg p-3 pl-10'
              />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl shadow'>
          {loading ? (
            <div className='text-center p-10'>
              Đang tải...
            </div>
          ) : filteredComments.length === 0 ? (
            <div className='text-center p-10'>
              Không có bình luận
            </div>
          ) : (
            <table className='w-full'>
              <thead className='bg-gray-50 border-b'>
                <tr>
                  <th className='p-4 text-left'>
                    Người dùng
                  </th>
                  <th className='p-4 text-left'>
                    Nội dung
                  </th>
                  <th className='p-4 text-left'>
                    Ngày tạo
                  </th>
                  <th className='p-4 text-center'>
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredComments.map((comment) => (
                  <tr
                    key={comment._id}
                    className='border-b'
                  >
                    <td className='p-4'>
                      {comment.author?.fullName ||
                        comment.author?.username ||
                        'Unknown'}
                    </td>

                    <td className='p-4'>
                      {comment.content}
                    </td>

                    <td className='p-4'>
                      {new Date(
                        comment.createdAt
                      ).toLocaleDateString('vi-VN')}
                    </td>

                    <td className='p-4 text-center'>
                      <button
                        onClick={() => {
                          setSelectedCommentId(comment._id);
                          setShowConfirm(true);
                        }}
                        className='bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2'
                      >
                        <EyeOff size={16} />
                        Ẩn
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={showConfirm}
        title="Xác nhận ẩn bình luận"
        message="Bạn có chắc muốn ẩn bình luận này? Bình luận sẽ không còn hiển thị với người dùng."
        confirmText="Ẩn bình luận"
        cancelText="Hủy"
        onConfirm={handleHideComment}
        onCancel={() => {
          setShowConfirm(false);
          setSelectedCommentId(null);
        }}
      />
    </AdminLayout>
  );
};

export default BlogComment;