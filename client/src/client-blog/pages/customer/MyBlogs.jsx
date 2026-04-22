import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileText, Clock, XCircle, Bookmark, Edit, Eye, MessageCircle } from 'lucide-react';
import blogService from '../../services/blogService';
import blogInteractionService from '../../services/blogInteractionService';

const MyBlogs = () => {
  // 1. Khai báo hook để lấy param từ URL
  const [searchParams, setSearchParams] = useSearchParams();

  // 2. Lấy giá trị tab từ URL (mặc định là 'published' nếu không có)
  const tabFromUrl = searchParams.get('tab') || 'published';

  // 3. Vẫn giữ state để component phản ứng nhanh, nhưng khởi tạo bằng giá trị từ URL
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // 4. Khi user click chuyển tab, cập nhật cả state lẫn URL
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId }); // Đẩy lên URL: ?tab=pending
  };

  // 5. Nếu URL thay đổi (do user bấm Back), cập nhật lại state activeTab
  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  useEffect(() => {
    fetchData();
  }, [activeTab]); // fetchData vẫn chạy mỗi khi activeTab thay đổi

  // ... (Phần code fetchData giữ nguyên) ...

  const fetchData = async () => {
    setLoading(true);
    setBlogs([]); // Xóa data cũ mượt hơn
    try {
      let res;
      if (activeTab === 'bookmarks') {
        res = await blogInteractionService.getMyBookmarks();
        setBlogs(res.bookmarks || []);
      } else {
        // activeTab map trực tiếp với status: PUBLISHED, PENDING, DRAFT
        res = await blogService.getMyBlogs({ status: activeTab.toUpperCase() });
        setBlogs(res.blogs || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'published', label: 'Đã đăng', icon: <FileText size={18} /> },
    { id: 'pending', label: 'Chờ duyệt', icon: <Clock size={18} /> },
    { id: 'draft', label: 'Bị từ chối / Nháp', icon: <XCircle size={18} /> },
    { id: 'bookmarks', label: 'Đã lưu', icon: <Bookmark size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5] py-8">
      <div className="container mx-auto max-w-5xl px-4">
        
        {/* HEADER & TABS */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">Quản lý bài viết</h1>
            <p className="text-gray-500 text-sm mt-1">Theo dõi trạng thái và bài viết bạn đã lưu</p>
          </div>
          
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* DANH SÁCH BÀI VIẾT */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>
        ) : blogs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4 text-gray-400">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Không có bài viết nào</h3>
            <p className="text-gray-500 mt-2">Bạn chưa có bài viết nào trong mục này.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {blogs.map((blog) => {
                const detailUrl = (activeTab === 'pending' || activeTab === 'draft') 
                ? `/my-blogs/preview/${blog._id}` 
                : `/blogs/${blog.slug || blog._id}`;

                return (
                    <div key={blog._id} className="bg-white rounded-xl shadow-sm p-5 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-shadow">
                        
                        {/* Ảnh cover */}
                        <Link to={detailUrl} className="shrink-0">
                        <img 
                            src={blog.coverImage?.url || 'https://via.placeholder.com/150'} 
                            alt={blog.title} 
                            className="w-full sm:w-40 h-32 object-cover rounded-lg border border-gray-100"
                        />
                        </Link>

                        {/* Info */}
                        <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-start gap-2">
                                {/* Link ở Tiêu đề */}
                                <Link to={detailUrl} className="text-lg font-bold text-gray-900 hover:text-blue-600 line-clamp-2">
                                    {blog.title}
                                </Link>
                                
                                {/* Badge trạng thái (nếu ở tab draft/pending) */}
                                {activeTab === 'draft' && (
                                <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full whitespace-nowrap">
                                    Bị từ chối
                                </span>
                                )}
                                {activeTab === 'pending' && (
                                <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full whitespace-nowrap">
                                    Đang chờ duyệt
                                </span>
                                )}
                            </div>

                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                {blog.excerpt || "Không có mô tả..."}
                            </p>

                            {/* Hiển thị lý do từ chối nếu có */}
                            {activeTab === 'draft' && blog.rejectionReason && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                                    <strong>Lý do từ chối:</strong> {blog.rejectionReason}
                                </div>
                            )}

                            <div className="mt-auto pt-4 flex items-center justify-between">
                                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                                    <span>{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
                                    {activeTab === 'published' && (
                                        <>
                                        <span className="flex items-center gap-1"><Eye size={14} /> {blog.viewCount || 0}</span>
                                        <span className="flex items-center gap-1"><MessageCircle size={14} /> {blog.commentCount || 0}</span>
                                        </>
                                    )}
                                </div>

                                {/* Nút hành động */}
                                <div className="flex gap-2">
                                    {/* Nút xem chi tiết */}
                                    <Link 
                                        to={detailUrl}
                                        className="px-4 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                        Xem
                                    </Link>
                                    
                                    {/* Nút sửa (Chỉ hiện ở Tab Bị từ chối/Nháp) */}
                                    {activeTab === 'draft' && (
                                        <Link 
                                            to={`/blogs/edit/${blog._id}`} 
                                            className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1"
                                            >
                                            <Edit size={14} /> Sửa bài
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
            </div>
        )}
      </div>
    </div>
  );
};

export default MyBlogs;