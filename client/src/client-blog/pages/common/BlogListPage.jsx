// import React, { useEffect, useState } from 'react';
// import blogService from '../../services/blogService';
// import BlogCard from '../../components/BlogCard';
// import { Link } from 'react-router-dom';
// import BlogFilters from '../../components/BlogFilters';
// import SimplePagination from '../../components/SimplePagination';

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
//         q: filters.search || undefined,
//         category: filters.category || undefined,
//         tag: filters.tag || undefined,
//         page: filters.page,
//         limit: PAGE_SIZE,
//       };
//       const data = await blogService.getAllBlogs(params);
//       setBlogs(data.items || []);
//       setTotalPages(data.totalPages || 1);
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
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {loading
//             ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
//                 <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-xl" />
//               ))
//             : blogs.length === 0
//             ? <p className="col-span-full text-center text-gray-500">No blogs found</p>
//             : blogs.map((b) => (
//                 <Link key={b._id} to={`/blog/${b.slug || b._id}`}>
//                   <BlogCard blog={{ ...b, excerpt: truncateText(stripHTML(b.content), 100) }} />
//                 </Link>
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
import BlogCard from '../../components/BlogCard';
import { Link } from 'react-router-dom';
import BlogFilters from '../../components/BlogFilters';
import SimplePagination from '../../components/SimplePagination';

const PAGE_SIZE = 6;

// fake data demo
const fakeBlogs = Array.from({ length: 12 }).map((_, i) => ({
  _id: `blog-${i + 1}`,
  slug: `blog-${i + 1}`,
  title: `Demo Blog Post #${i + 1}`,
  content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Blog content #${i + 1}...`,
  coverImage: { url: 'https://picsum.photos/400/200?random=' + (i + 1) },
  createdAt: new Date().toISOString(),
  category: i % 3 === 0 ? 'Tech' : i % 3 === 1 ? 'Travel' : 'Food',
  tags: i % 2 === 0 ? ['React', 'Frontend'] : ['Node.js', 'Backend']
}));

const fakeCategories = ['Tech', 'Travel', 'Food'];
const fakeTags = ['React', 'Frontend', 'Node.js', 'Backend'];

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

  useEffect(() => {
    // load fakedata
    setCategories(fakeCategories);
    setTags(fakeTags);
    setBlogs(fakeBlogs);
    setTotalPages(Math.ceil(fakeBlogs.length / PAGE_SIZE));
  }, []);

  const clearAllFilters = () => { setFilters({ search: '', category: '', tag: '', page: 1 }); };

  // filter fake data (demo)
  const filteredBlogs = blogs.filter(blog => {
    const matchSearch = !filters.search || blog.title.toLowerCase().includes(filters.search.toLowerCase());
    const matchCategory = !filters.category || blog.category === filters.category;
    const matchTag = !filters.tag || blog.tags.includes(filters.tag);
    return matchSearch && matchCategory && matchTag;
  }).slice((filters.page - 1) * PAGE_SIZE, filters.page * PAGE_SIZE);

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
            : filteredBlogs.length === 0
            ? <p className="col-span-full text-center text-gray-500">No blogs found</p>
            : filteredBlogs.map((b) => (
                <Link key={b._id} to={`/blog/${b.slug || b._id}`}>
                  <BlogCard blog={{ ...b, excerpt: truncateText(stripHTML(b.content), 100) }} />
                </Link>
              ))
          }
        </div>

        {totalPages > 1 && (
          <SimplePagination
            current={filters.page}
            total={totalPages}
            onPageChange={(p) => setFilters({ ...filters, page: p })}
          />
        )}
      </div>
    </div>
  );
};

export default BlogListPage;