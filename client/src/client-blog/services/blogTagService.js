import api from '../../client-eco/services/api';

const blogTagService = {
  getBlogTags: async (options = false) => {
    const params = typeof options === 'object'
      ? options
      : { includeInactive: options };

    const response = await api.get('/tags', {
      params
    });
    return response.data;
  },

  getBlogTagById: async (tagId) => {
  const response = await api.get(`/tags/${tagId}`);
  return response.data.tag;
  },

  createBlogTag: async (tagData) => {
    const response = await api.post('/tags', tagData);
    return response.data.tag;
  },

  updateBlogTag: async (tagId, tagData) => {
    const response = await api.put(`/tags/${tagId}`, tagData);
    return response.data.tag;
  },

  deleteBlogTag: async (tagId) => {
    const response = await api.delete(`/tags/${tagId}`);
    return response.data;
  },

  updateBlogTagStatus: async (tagId, isActive) => {
    const response = await api.patch(`/tags/${tagId}/status`, { isActive });
    return response.data.tag;
  }
};

export default blogTagService;
