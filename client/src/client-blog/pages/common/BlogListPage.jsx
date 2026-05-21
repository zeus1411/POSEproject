import React, { useEffect, useState } from 'react';
import blogService from '../../services/blogService';
import { getPublicBlogs } from '../../redux/slices/blogSlice';
import BlogCard from '../../components/BlogCard';
import BlogFilters from '../../components/BlogFilters';
import SimplePagination from '../../components/SimplePagination';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PlusSquare } from 'lucide-react';
import { useTheme } from '../../../client-eco/context/ThemeContext';

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
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const { blogs, totalPages, isLoading } = useSelector((state) => state.blog);
  const { user } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [filters, setFilters] = useState({ search: '', category: '', tag: '', page: 1 });

  useEffect(() => { fetchCategoriesAndTags(); }, []);
  useEffect(() => { fetchBlogs(); }, [filters]);

  const fetchBlogs = () => {
    const params = {
      search: filters.search || undefined,
      category: filters.category || undefined,
      tag: filters.tag || undefined,
      page: filters.page,
      limit: PAGE_SIZE
    };
    
    dispatch(getPublicBlogs(params));
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
    <div className={`relative min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#051C1C] text-white' : 'bg-background text-foreground'}`}>
      {/* 1. Nền Gradient chính - Cố định (Fixed) */}
      <div className={`fixed inset-0 z-0 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-b from-[#051C1C] via-[#0a2828] to-[#051C1C]' 
          : 'bg-gradient-to-b from-[#FFFDF0] via-[#E8F6F6] to-[#FFFDF0]'
      }`}></div>

      {/* 2. Hệ thống vân sóng vô chậm lặp lại toàn trang */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: isDark
            ? `url("data:image/svg+xml,%3Csvg width='400' height='200' viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 Q 100 50 200 100 T 400 100' fill='none' stroke='%2310b981' stroke-width='1.5' stroke-opacity='0.5'/%3E%3Cpath d='M0 140 Q 100 90 200 140 T 400 140' fill='none' stroke='%2306b6d4' stroke-width='1' stroke-opacity='0.3'/%3E%3C/svg%3E")`
            : `url("data:image/svg+xml,%3Csvg width='400' height='200' viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 Q 100 50 200 100 T 400 100' fill='none' stroke='%234682A9' stroke-width='1.5' stroke-opacity='0.25'/%3E%3Cpath d='M0 140 Q 100 90 200 140 T 400 140' fill='none' stroke='%23749BC2' stroke-width='1' stroke-opacity='0.2'/%3E%3C/svg%3E")`,
          backgroundSize: '800px 400px',
          opacity: isDark ? 0.4 : 0.25,
        }}
      ></div>

      {/* 3. Các đốm sáng Glow cố định tạo chiều sâu */}
      <div className={`fixed top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full z-0 pointer-events-none blur-[120px] transition-colors duration-300 ${
        isDark ? 'bg-emerald-900/20' : 'bg-emerald-200/35'
      }`}></div>
      <div className={`fixed bottom-[10%] right-[-10%] w-[400px] h-[400px] rounded-full z-0 pointer-events-none blur-[100px] transition-colors duration-300 ${
        isDark ? 'bg-cyan-900/20' : 'bg-cyan-200/35'
      }`}></div>

      {/* Nội dung chính */}
      <div className="relative z-10 container mx-auto py-10 flex flex-col lg:flex-row gap-10 px-4 max-w-7xl">
        {/* SIDEBAR */}
        <aside className="w-full lg:w-80 lg:sticky lg:top-24 h-fit">
          <div className="glass-panel shadow-2xl rounded-[2.5rem] p-8 border border-water/45 dark:border-white/10">
            <h3 className="text-xl font-bold text-foreground mb-6">Bộ lọc bài viết</h3>
            <BlogFilters
              categories={categories}
              tags={tags}
              filters={filters}
              onChangeFilters={setFilters}
              onClearFilters={clearAllFilters}
            />
          </div>
        </aside>

        {/* MAIN FEED */}
        <main className="flex-1 w-full space-y-10">
          {/* COMPOSER PLACEHOLDER (Trình tạo bài viết giả lập đã được Glassmorphism hóa) */}
          {user && (
            <div className="glass-panel shadow-xl rounded-3xl p-5 border border-water/45 dark:border-white/10">
              <div className="flex items-center space-x-4 mb-4">
                <img 
                  src={user.avatar || 'https://via.placeholder.com/40'} 
                  alt="User" 
                  className="w-10 h-10 rounded-full border border-water/30 dark:border-white/10 object-cover ring-2 ring-nature/20 dark:ring-primary/20"
                />
                <button 
                  onClick={handleCreatePost}
                  className="flex-1 bg-aqua/5 dark:bg-white/5 hover:bg-aqua/10 dark:hover:bg-white/10 border border-water/30 dark:border-white/10 text-muted-foreground hover:text-foreground font-semibold text-left px-5 py-3 rounded-full transition-all text-sm outline-none"
                >
                  {user.name || user.fullName || user.username} ơi, bạn đang nghĩ gì thế?
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pl-4">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Bài viết mới nhất</h1>
          </div>

          <div className="space-y-12">
            {isLoading ? (
              <div className="text-center py-20 text-nature/60 dark:text-emerald-200/50 animate-pulse font-semibold">Đang tải dữ liệu thủy sinh...</div>
            ) : blogs.map((b) => (
              <BlogCard
                key={b._id}
                blog={{
                  ...b,
                  excerpt: truncateText(stripHTML(b.content), 200)
                }}
              />
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center pb-10">
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