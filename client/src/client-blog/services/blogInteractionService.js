import api from '../../client-eco/services/api';

const API_URL='/blog-interactions';

const blogInteractionService={

 toggleLike: async(blogId)=>{
   const res=await api.post(
      `${API_URL}/like/${blogId}`
   );

   return res.data;
 },

 toggleBookmark: async(blogId)=>{
   const res=await api.post(
      `${API_URL}/bookmark/${blogId}`
   );

   return res.data;
 },

 getMyInteractions: async(blogIds)=>{
   const res=await api.post(
      `${API_URL}/status`,
      {blogIds}
   );

   return res.data;
 },

 // 🔥 Lấy bài viết TÔI ĐÃ BOOKMARK
  getMyBookmarks: async (params = {}) => {
    const res = await api.get('/blog-interactions/my-bookmarks', { params });
    return res.data;
  },

};

export default blogInteractionService;