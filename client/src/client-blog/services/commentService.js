import api from '../../client-eco/services/api';

const API_URL = '/comments';

const commentService = {

  // 🔥 Lấy comment theo blog
  getCommentsByBlog: async (blogId) => {
    const res = await api.get(`${API_URL}/blog/${blogId}`);
    return res.data; 
    // expect: [{ _id, content, user, createdAt }]
  },

  // 🔥 Tạo comment
  createComment: async (data) => {
    const res = await api.post(API_URL, data);
    return res.data;
    // expect: { _id, content, user, createdAt }
  },

  // 🔥 (Admin) Ẩn comment
  hideComment: async (commentId) => {
    const res = await api.patch(`${API_URL}/${commentId}/hide`);
    return res.data;
  },

  // 🔥 (Optional) Xoá comment
  deleteComment: async (commentId) => {
    const res = await api.delete(`${API_URL}/${commentId}`);
    return res.data;
  }

};

export default commentService;