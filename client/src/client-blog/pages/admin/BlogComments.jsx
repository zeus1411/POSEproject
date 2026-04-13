import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BlogComments = () => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    // 👉 FAKE DATA
    setComments([
      {
        _id: '1',
        user: 'Nguyễn Văn A',
        content: 'Bài viết hay!',
        blogTitle: 'Setup hồ thủy sinh',
        createdAt: new Date(),
        isHidden: false
      },
      {
        _id: '2',
        user: 'Trần Thị B',
        content: 'Spam link abcxyz',
        blogTitle: 'Setup hồ thủy sinh',
        createdAt: new Date(),
        isHidden: true
      }
    ]);
  }, []);

  const toggleHide = (id) => {
    setComments(prev =>
      prev.map(c =>
        c._id === id ? { ...c, isHidden: !c.isHidden } : c
      )
    );
  };

   const navigate = useNavigate();

   const goToComment = (comment) => {
      navigate(`/blog/${comment.blogSlug}?commentId=${comment._id}`);
   };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        🛡️ Quản lý bình luận
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Comment</th>
              <th className="p-2 text-left">Blog</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {comments.map(c => (
              <tr key={c._id} className="border-t">
                <td className="p-2">{c.user}</td>
                <td className="p-2">{c.content}</td>
                <td className="p-2">{c.blogTitle}</td>
                <td className="p-2">
                  {new Date(c.createdAt).toLocaleString('vi-VN')}
                </td>

                <td className="p-2 text-center">
                  <button
                    onClick={() => toggleHide(c._id)}
                    className={`px-3 py-1 rounded text-white text-xs ${
                      c.isHidden
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  >
                    {c.isHidden ? 'Hiện lại' : 'Ẩn'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

            <button
                onClick={() => goToComment(c)}
                className="px-3 py-1 text-xs rounded bg-blue-500 text-white"
                >
                Xem bình luận
            </button>

        </table>
      </div>
    </div>
  );
};

export default BlogComments;