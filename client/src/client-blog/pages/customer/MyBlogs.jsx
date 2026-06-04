import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileText, Clock, XCircle, Bookmark, Edit, Eye, EyeOff, MessageCircle, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import blogService from '../../services/blogService';
import blogInteractionService from '../../services/blogInteractionService';
import { useTheme } from '../../../client-eco/context/ThemeContext';

const MyBlogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'published';
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setBlogs([]);
    try {
      let res;
      if (activeTab === 'bookmarks') {
        res = await blogInteractionService.getMyBookmarks();
        setBlogs(res.bookmarks || []);
      } else {
        res = await blogService.getMyBlogs({ status: activeTab.toUpperCase() });
        setBlogs(res.blogs || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHiddenChange = async (blogId, isHidden) => {
    const result = await Swal.fire({
      icon: 'question',
      title: isHidden ? 'Ẩn bài viết?' : 'Gỡ ẩn bài viết?',
      text: isHidden ? 'Bài viết sẽ không còn hiển thị trên feed blog.' : 'Bài viết sẽ được hiển thị lại trên feed blog.',
      showCancelButton: true,
      confirmButtonText: isHidden ? 'Ẩn bài viết' : 'Gỡ ẩn',
      cancelButtonText: 'Hủy',
      confirmButtonColor: isHidden ? '#f97316' : '#10b981',
      cancelButtonColor: '#64748b',
    });

    if (!result.isConfirmed) return;

    try {
      await blogService.hideBlog(blogId, isHidden);
      await fetchData();
      Swal.fire({
        icon: 'success',
        title: isHidden ? 'Đã ẩn bài viết' : 'Đã gỡ ẩn bài viết',
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Không thể cập nhật',
        text: error.response?.data?.message || 'Không thể cập nhật trạng thái ẩn bài viết',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const handleDeleteBlog = async (blogId) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Xóa bản nháp?',
      text: 'Hành động này không thể hoàn tác.',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
    });

    if (!result.isConfirmed) return;

    try {
      await blogService.deleteBlog(blogId);
      await fetchData();
      Swal.fire({
        icon: 'success',
        title: 'Đã xóa bài viết',
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Không thể xóa bài viết',
        text: error.response?.data?.message || 'Không thể xóa bài viết',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const showAdminHiddenNotice = () => {
    Swal.fire({
      icon: 'info',
      title: 'Bài viết đã bị admin ẩn',
      text: 'Admin đã ẩn bài viết của bạn vì lý do vi phạm cộng đồng, bạn hãy liên hệ admin qua gmail "22110039@student.hcmute.edu.vn" để được giải quyết.',
      confirmButtonText: 'Đã hiểu',
      confirmButtonColor: '#0f766e',
    });
  };

  const tabs = [
    { id: 'published', label: 'Đã đăng', icon: <FileText size={16} /> },
    { id: 'pending', label: 'Chờ duyệt', icon: <Clock size={16} /> },
    { id: 'draft', label: 'Bị Từ chối / Nháp', icon: <XCircle size={16} /> },
    { id: 'bookmarks', label: 'Đã lưu', icon: <Bookmark size={16} /> },
  ];

  return (
    <div className={`relative min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#051C1C] text-white' : 'bg-background text-foreground'} py-8`}>
      {/* 1. Nền Gradient chính - Cố định (Fixed) */}
      <div className={`fixed inset-0 z-0 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-b from-[#051C1C] via-[#0a2828] to-[#051C1C]' 
          : 'bg-gradient-to-b from-[#FFFDF0] via-[#E8F6F6] to-[#FFFDF0]'
      }`}></div>

      {/* 2. Hệ thống vân sóng vô tận lặp lại toàn trang */}
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

      <div className="relative z-10 container mx-auto max-w-5xl px-4">
        
        {/* HEADER & TABS */}
        <div className="glass-panel shadow-xl rounded-3xl mb-6 overflow-hidden border border-water/45 dark:border-white/10">
          <div className="p-6 border-b border-water/20 dark:border-white/5">
            <h1 className="text-2xl font-bold text-foreground">Quản lý bài viết</h1>
            <p className="text-muted-foreground text-sm font-semibold mt-1">Theo dõi trạng thái và bài viết bạn đã lưu</p>
          </div>
          
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-nature dark:border-primary text-nature dark:text-primary bg-aqua/10 dark:bg-white/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-aqua/5 dark:hover:bg-white/5'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* MÀN HÌNH DANH SÁCH BÀI VIẾT */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground font-semibold">Đang tải dữ liệu...</div>
        ) : blogs.length === 0 ? (
          <div className="glass-panel shadow-xl rounded-3xl p-12 text-center border border-water/45 dark:border-white/10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-aqua/10 dark:bg-white/10 border border-water/30 dark:border-white/10 mb-4 text-muted-foreground">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold text-foreground">Không có bài viết nào</h3>
            <p className="text-muted-foreground text-sm font-semibold mt-2">Bạn chưa có bài viết nào trong mục này.</p>
          </div>
        ) : (
          // DANH SÁCH BÀI VIẾT KHỐI KÍNH MỜ
          <div className="space-y-4">
            {blogs.map((blog) => {
              const detailUrl = (activeTab === 'pending' || activeTab === 'draft' || blog.isHidden) 
                ? `/my-blogs/preview/${blog._id}` 
                : `/blogs/${blog.slug || blog._id}`;
              const hiddenByAdmin = blog.isHidden && blog.hiddenByRole !== 'user';

              return (
                <div key={blog._id} className="glass-panel border border-water/45 dark:border-white/10 rounded-3xl p-5 flex flex-col sm:flex-row gap-5 hover:shadow-xl transition-all duration-300">
                  
                  {/* Ảnh cover */}
                  <Link to={detailUrl} className="shrink-0">
                    <img 
                      src={blog.coverImage?.url || 'https://via.placeholder.com/150'} 
                      alt={blog.title} 
                      className="w-full sm:w-40 h-32 object-cover rounded-2xl border border-water/30 dark:border-white/10"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-2">
                      <Link to={detailUrl} className="text-lg font-bold text-foreground hover:text-nature dark:hover:text-primary transition-colors line-clamp-2">
                        {blog.title}
                      </Link>
                      
                      {activeTab === 'draft' && (
                        <span className={`px-2.5 py-1 border text-xs font-bold rounded-full whitespace-nowrap ${
                          blog.rejectionReason
                            ? 'bg-red-500/15 border-red-500/30 text-red-600 dark:text-red-400'
                            : 'bg-slate-500/15 border-slate-500/30 text-slate-600 dark:text-slate-300'
                        }`}>
                          {blog.rejectionReason ? 'Bị từ chối' : 'Nháp'}
                        </span>
                      )}
                      {activeTab === 'pending' && (
                        <span className="px-2.5 py-1 bg-yellow-500/15 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-xs font-bold rounded-full whitespace-nowrap">
                          Đang chờ duyệt
                        </span>
                      )}
                      {activeTab === 'published' && blog.isHidden && (
                        <span className="px-2.5 py-1 bg-slate-500/15 border border-slate-500/30 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full whitespace-nowrap">
                          {hiddenByAdmin ? 'Admin đã ẩn' : 'Đã ẩn'}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground font-semibold mt-2 line-clamp-2">
                      {blog.excerpt || "Không có mô tả..."}
                    </p>

                    {activeTab === 'draft' && blog.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl text-sm font-semibold">
                        <strong>Lý do từ chối:</strong> {blog.rejectionReason}
                      </div>
                    )}

                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground font-semibold">
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
                        <Link 
                          to={detailUrl}
                          className="px-4 py-1.5 text-sm font-bold text-nature dark:text-primary bg-aqua/10 dark:bg-white/5 border border-water/30 dark:border-white/10 rounded-xl hover:bg-aqua/20 dark:hover:bg-white/10 transition-all"
                        >
                          Xem
                        </Link>
                        
                        {(activeTab === 'draft' || activeTab === 'pending') && (
                          <Link 
                            to={`/blogs/edit/${blog._id}`} 
                            className="px-4 py-1.5 text-sm font-bold text-white bg-gradient-to-r from-nature to-ocean rounded-xl hover:opacity-90 shadow-md transition-all flex items-center gap-1"
                          >
                            <Edit size={14} /> Sửa bài
                          </Link>
                        )}

                        {activeTab === 'published' && (
                          <label
                            className="px-4 py-1.5 text-sm font-bold text-orange-600 dark:text-orange-300 bg-orange-500/10 border border-orange-500/30 rounded-xl hover:bg-orange-500/20 transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <EyeOff size={14} />
                            <input
                              type="checkbox"
                              checked={!!blog.isHidden}
                              onChange={(e) => {
                                if (hiddenByAdmin) {
                                  showAdminHiddenNotice();
                                  return;
                                }
                                handleHiddenChange(blog._id, e.target.checked);
                              }}
                              className="h-4 w-4 accent-orange-500"
                            />
                            Ẩn
                          </label>
                        )}

                        {activeTab === 'draft' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteBlog(blog._id)}
                            className="px-4 py-1.5 text-sm font-bold text-red-600 dark:text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-all flex items-center gap-1"
                          >
                            <Trash2 size={14} /> Xóa
                          </button>
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
