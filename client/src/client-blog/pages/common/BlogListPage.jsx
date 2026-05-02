// import React, { useEffect, useState } from 'react';
// import blogService from '../../services/blogService';
// import BlogCard from '../../components/BlogCard';
// import { Link } from 'react-router-dom';
// import BlogFilters from '../../components/BlogFilters';
// import SimplePagination from '../../components/SimplePagination';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';

// const PAGE_SIZE = 6;

// const stripHTML = (html) => {
//   const tmp = document.createElement('div');
//   tmp.innerHTML = html;
//   return tmp.textContent || tmp.innerText || '';
// };

// const truncateText = (text, length = 100) => {
//   if (text.length <= length) return text;
//   return text.slice(0, length) + '...';
// };

// const BlogListPage = () => {
//   const navigate = useNavigate();

//   const { user } = useSelector(
//     (state) => state.auth
//   );

//   const [blogs, setBlogs] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [tags, setTags] = useState([]);
//   const [filters, setFilters] = useState({ search: '', category: '', tag: '', page: 1 });
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => { fetchCategoriesAndTags(); }, []);
//   useEffect(() => { fetchBlogs(); }, [filters]);

//   const fetchBlogs = async () => {
//     try {
//       setLoading(true);

//       const params = {
//         search: filters.search || undefined, // sửa q -> search
//         category: filters.category || undefined,
//         tag: filters.tag || undefined,
//         page: filters.page,
//         limit: PAGE_SIZE
//       };

//       const data = await blogService.getPublicBlogs(params);

//       console.log("BLOG API:", data);

//       setBlogs(data.blogs || []);
//       setTotalPages(data.pagination?.pages || 1);

//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCategoriesAndTags = async () => {
//     try {
//       const cats = await blogService.getAllCategories();
//       const tgs = await blogService.getAllTags();
//       setCategories(Array.isArray(cats?.items) ? cats.items : []);
//       setTags(Array.isArray(tgs?.items) ? tgs.items : []);
//     } catch (err) { console.error(err); }
//   };

//   const clearAllFilters = () => { setFilters({ search: '', category: '', tag: '', page: 1 }); };

//   return (
//     <div className="container mx-auto py-8 flex flex-col lg:flex-row gap-6">
//       <div className="w-full lg:w-64 flex-shrink-0">
//         <BlogFilters
//           categories={categories}
//           tags={tags}
//           filters={filters}
//           onChangeFilters={setFilters}
//           onClearFilters={clearAllFilters}
//         />
//       </div>

//       <div className="flex-1 flex flex-col gap-6">

//         {/* HEADER */}
//         <div className="flex justify-between items-center">

//           <h1 className="text-2xl font-bold">
//             Blog
//           </h1>

//           {user && (
//             <button
//             onClick={() => {

//               if(!user){
//                   navigate('/login');
//                   return;
//               }

//               if(user.role === 'admin'){
//                   navigate('/admin/blogs/create');
//               }else{
//                   navigate('/blogs/create');
//               }

//             }}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg"
//             >
//             + Viết bài
//             </button>
//           )}
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {loading
//             ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
//                 <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-xl" />
//               ))
//             : blogs.length === 0
//             ? <p className="col-span-full text-center text-gray-500">No blogs found</p>
//             : blogs.map((b) => (
//                 <BlogCard
//                       key={b._id}
//                       blog={{
//                         ...b,
//                         excerpt: truncateText(stripHTML(b.content),100)
//                       }}
//                   />
//               ))
//           }
//         </div>

//         {totalPages > 1 && (
//           <SimplePagination current={filters.page} total={totalPages} onPageChange={(p) => setFilters({ ...filters, page: p })} />
//         )}
//       </div>
//     </div>
//   );
// };

// export default BlogListPage;


import React, { useEffect, useState } from 'react';
import blogService from '../../services/blogService';
import BlogCard from '../../components/BlogCard';
import BlogFilters from '../../components/BlogFilters';
import SimplePagination from '../../components/SimplePagination';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PlusSquare } from 'lucide-react';

const PAGE_SIZE = 6;

const stripHTML = (html) => {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const truncateText = (text, length = 150) => {
  if (!text || text.length <= length) return text;
  return text.slice(0, length) + '...';
};

const BlogListPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [filters, setFilters] = useState({ search: '', category: '', tag: '', page: 1 });
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCategoriesAndTags(); }, []);
  useEffect(() => { fetchBlogs(); }, [filters]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        search: filters.search || undefined,
        category: filters.category || undefined,
        tag: filters.tag || undefined,
        page: filters.page,
        limit: PAGE_SIZE
      };
      const data = await blogService.getPublicBlogs(params);
      setBlogs(data.blogs || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesAndTags = async () => {
    try {
      const cats = await blogService.getAllCategories();
      const tgs = await blogService.getAllTags();

      console.log("CATEGORIES:", cats);
      console.log("TAGS:", tgs);

      setCategories(
        Array.isArray(cats?.categories)
          ? cats.categories
          : []
      );

      setTags(
        Array.isArray(tgs?.tags)
          ? tgs.tags
          : []
      );

    } catch (err) {
      console.error(err);
    }
  };
  
  const clearAllFilters = () => { setFilters({ search: '', category: '', tag: '', page: 1 }); };

  const handleCreatePost = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      navigate('/admin/blogs/create');
    } else {
      navigate('/blogs/create');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <div className="container mx-auto py-6 flex flex-col lg:flex-row gap-8 px-4">
        
      <aside className="w-full lg:w-72 lg:sticky lg:top-20 h-fit space-y-4">

        {/* FILTER CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Bộ lọc bài viết
          </h3>

          <BlogFilters
            categories={categories}
            tags={tags}
            filters={filters}
            onChangeFilters={setFilters}
            onClearFilters={clearAllFilters}
          />
        </div>

        {/* FOOTER */}
        <div className="hidden lg:block text-xs text-gray-400 px-2 leading-relaxed">
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            <span className="hover:underline cursor-pointer">Quyền riêng tư</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Điều khoản</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Quảng cáo</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Cookie</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Xem thêm</span>
          </div>

          <p className="mt-2 text-gray-300">
            © 2024 BlogStream
          </p>
        </div>

      </aside>

        {/* MAIN FEED */}
        <main className="flex-1 max-w-2xl mx-auto w-full">
          
          {/* COMPOSER PLACEHOLDER (Trình tạo bài viết giả lập) */}
          {user && (
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src={user.avatar || 'https://via.placeholder.com/40'} 
                  alt="User" 
                  className="w-10 h-10 rounded-full border border-gray-100"
                />
                <button 
                  onClick={handleCreatePost}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 text-left px-4 py-2.5 rounded-full transition-colors text-sm"
                >
                  {user.name} ơi, bạn đang nghĩ gì thế?
                </button>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-around">
                <button onClick={handleCreatePost} className="flex items-center space-x-2 text-gray-600 font-semibold text-sm py-2 px-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <PlusSquare className="text-blue-500" size={20} />
                  <span>Viết bài mới</span>
                </button>
              </div>
            </div>
          )}

          {/* FEED HEADER */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-900">Bài viết mới nhất</h1>
          </div>

          {/* BLOG LIST */}
          <div className="space-y-6">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden h-96 animate-pulse">
                    <div className="p-4 flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                        <div className="h-3 w-20 bg-gray-200 rounded" />
                      </div>
                    </div>
                    <div className="h-48 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-6 w-3/4 bg-gray-200 rounded" />
                      <div className="h-4 w-full bg-gray-200 rounded" />
                    </div>
                  </div>
                ))
              : blogs.length === 0
              ? <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <p className="text-gray-500 font-medium">Hiện chưa có bài viết nào phù hợp với tìm kiếm của bạn.</p>
                  <button onClick={clearAllFilters} className="mt-4 text-blue-600 font-bold hover:underline">Xóa tất cả bộ lọc</button>
                </div>
              : blogs.map((b) => (
                  <BlogCard
                        key={b._id}
                        blog={{
                          ...b,
                          excerpt: truncateText(stripHTML(b.content), 180)
                        }}
                    />
                ))
            }
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="mt-8 mb-12">
              <SimplePagination 
                current={filters.page} 
                total={totalPages} 
                onPageChange={(p) => {
                  setFilters({ ...filters, page: p });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BlogListPage;