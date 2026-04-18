import React, { useEffect, useState } from 'react';
import blogService from '../../services/blogService';
import BlogCard from '../../components/BlogCard';
import { Link } from 'react-router-dom';
import BlogFilters from '../../components/BlogFilters';
import SimplePagination from '../../components/SimplePagination';

const PAGE_SIZE = 6;

const stripHTML = (html) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const truncateText = (text, length = 100) => {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

const BlogListPage = () => {
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
        search: filters.search || undefined, // sửa q -> search
        category: filters.category || undefined,
        tag: filters.tag || undefined,
        page: filters.page,
        limit: PAGE_SIZE
      };

      const data = await blogService.getPublicBlogs(params);

      console.log("BLOG API:", data);

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
      setCategories(Array.isArray(cats?.items) ? cats.items : []);
      setTags(Array.isArray(tgs?.items) ? tgs.items : []);
    } catch (err) { console.error(err); }
  };

  const clearAllFilters = () => { setFilters({ search: '', category: '', tag: '', page: 1 }); };

  return (
    <div className="container mx-auto py-8 flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-64 flex-shrink-0">
        <BlogFilters
          categories={categories}
          tags={tags}
          filters={filters}
          onChangeFilters={setFilters}
          onClearFilters={clearAllFilters}
        />
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-xl" />
              ))
            : blogs.length === 0
            ? <p className="col-span-full text-center text-gray-500">No blogs found</p>
            : blogs.map((b) => (
                <BlogCard
                      key={b._id}
                      blog={{
                        ...b,
                        excerpt: truncateText(stripHTML(b.content),100)
                      }}
                  />
              ))
          }
        </div>

        {totalPages > 1 && (
          <SimplePagination current={filters.page} total={totalPages} onPageChange={(p) => setFilters({ ...filters, page: p })} />
        )}
      </div>
    </div>
  );
};

export default BlogListPage;