import api from '../../client-eco/services/api';

const blogTagService = {
  getBlogTags: async (includeInactive = false) => {
    const response = await api.get('/tags', {
      params: { includeInactive }
    });
    return response.data;
  },

  getBlogTagById: async (tagId) => {
  const response = await api.get(`/tags/${tagId}`);
  return response.data.tag;
  },

  createBlogTag: async (tagData) => {
    const response = await api.post('/tags', tagData);
    return response.data;
  },

  updateBlogTag: async (tagId, tagData) => {
    const response = await api.put(`/tags/${tagId}`, tagData);
    return response.data;
  },

  deleteBlogTag: async (tagId) => {
    const response = await api.delete(`/tags/${tagId}`);
    return response.data;
  },

  updateBlogTagStatus: async (tagId, isActive) => {
    const response = await api.patch(`/tags/${tagId}/status`, { isActive });
    return response.data;
  }
};

export default blogTagService;