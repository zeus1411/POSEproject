import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileText, Clock, XCircle, Bookmark, Edit, Eye, MessageCircle, AlertCircle } from 'lucide-react';
import blogService from '../../services/blogService';
import blogInteractionService from '../../services/blogInteractionService';

const MyBlogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'published';

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

  const tabs = [
    { id: 'published', label: 'Đã đăng', icon: <FileText size={16} /> },
    { id: 'pending', label: 'Chờ duyệt', icon: <Clock size={16} /> },
    { id: 'draft', label: 'Bị Từ chối / Nháp', icon: <XCircle size={16} /> },
    { id: 'bookmarks', label: 'Đã lưu', icon: <Bookmark size={16} /> },
  ];

  return (
    <div className="relative min-h-screen bg-[#051C1C] py-12 overflow-hidden">
      {/* 1. Nền Gradient cố định tạo chiều sâu nước sâu */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#051C1C] via-[#0a2828] to-[#051C1C] z-0"></div>

      {/* 2. Hệ thống vân sóng thủy sinh vô tận đồng bộ toàn trang */}
      <div 
        className="absolute inset-0 z-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='200' viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 Q 100 50 200 100 T 400 100' fill='none' stroke='%2310b981' stroke-width='1.5' stroke-opacity='0.5'/%3E%3Cpath d='M0 140 Q 100 90 200 140 T 400 140' fill='none' stroke='%2306b6d4' stroke-width='1' stroke-opacity='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: '800px 400px',
        }}
      ></div>

      {/* 3. Các đốm sáng phát quang sinh học (Bioluminescent Glow) */}
      <div className="fixed top-[15%] right-[-10%] w-[450px] h-[450px] bg-emerald-900/15 blur-[120px] rounded-full z-0 pointer-events-none"></div>
      <div className="fixed bottom-[15%] left-[-10%] w-[450px] h-[450px] bg-cyan-900/15 blur-[120px] rounded-full z-0 pointer-events-none"></div>

      {/* NỘI DUNG CHÍNH */}
      <div className="relative z-10 container mx-auto max-w-4xl px-4">
        
        {/* PANEL ĐIỀU HƯỚNG TABS (GLASSMORPHISM) */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl mb-8 overflow-hidden transition-all duration-300">
          <div className="p-8 border-b border-white/5">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              🗂️ Không gian bài viết của bạn
            </h1>
            <p className="text-gray-400 text-sm mt-1.5 pl-1">
              Theo dõi tiến trình duyệt bài viết thủy sinh và kho lưu trữ cá nhân
            </p>
          </div>
          
          {/* THANH TABS NÊN TRONG SUỐT */}
          <div className="flex overflow-x-auto scrollbar-none px-4 bg-black/10">
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-xs font-semibold tracking-wide uppercase transition-all duration-300 border-b-2 whitespace-nowrap ${
                    isSelected
                      ? 'border-emerald-500 text-emerald-400 bg-white/[0.02] shadow-[inner_0_-4px_10px_rgba(16,185,129,0.05)]'
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-white/[0.01]'
                  }`}
                >
                  <span className={isSelected ? 'text-emerald-400' : 'text-gray-500'}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* MÀN HÌNH DANH SÁCH BÀI VIẾT */}
        {loading ? (
          <div className="text-center py-20 text-emerald-300/50 font-medium tracking-wide animate-pulse">
            Đang lọc dòng chảy dữ liệu bài viết...
          </div>
        ) : blogs.length === 0 ? (
          // TRẠNG THÁI TRỐNG RỖNG (EMPTY STATE)
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-16 text-center shadow-xl animate-in fade-in duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/5 mb-4 text-gray-500">
              <FileText size={26} />
            </div>
            <h3 className="text-lg font-bold text-white/90">Vùng nước trống rỗng</h3>
            <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">
              Bạn chưa có dữ liệu hoặc bài viết nào thuộc trạng thái này trong nhật ký.
            </p>
          </div>
        ) : (
          // DANH SÁCH BÀI VIẾT KHỐI KÍNH MỜ
          <div className="space-y-4">
            {blogs.map((blog) => {
              const detailUrl = (activeTab === 'pending' || activeTab === 'draft') 
                ? `/my-blogs/preview/${blog._id}` 
                : `/blogs/${blog.slug || blog._id}`;

              return (
                <div 
                  key={blog._id} 
                  className="group bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex flex-col sm:flex-row gap-6 hover:bg-white/[0.06] hover:border-white/20 hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] transition-all duration-300 shadow-lg relative overflow-hidden"
                >
                  {/* Ảnh cover có hover phóng to mềm mại */}
                  <Link to={detailUrl} className="shrink-0 overflow-hidden rounded-2xl border border-white/5 block bg-black/20">
                    <img 
                      src={blog.coverImage?.url || 'https://via.placeholder.com/150'} 
                      alt={blog.title} 
                      className="w-full sm:w-44 h-32 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Vùng thông tin văn bản */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        {/* Tiêu đề đổi màu khi hover thẻ cha */}
                        <Link to={detailUrl} className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                          {blog.title}
                        </Link>
                        
                        {/* Thẻ trạng thái phát quang (Badges Status) */}
                        {activeTab === 'draft' && (
                          <span className="flex items-center gap-1 px-3 py-1 bg-rose-500/15 text-rose-400 border border-rose-500/20 text-[11px] font-bold uppercase tracking-wider rounded-full whitespace-nowrap shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                            <AlertCircle size={12} /> Bị từ chối
                          </span>
                        )}
                        {activeTab === 'pending' && (
                          <span className="px-3 py-1 bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[11px] font-bold uppercase tracking-wider rounded-full whitespace-nowrap shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                            Chờ duyệt
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                        {blog.excerpt || "Không có tóm tắt ngắn nào cho nhật ký bài viết này..."}
                      </p>

                      {/* Lý do từ chối đồng bộ tone màu Rose mờ */}
                      {activeTab === 'draft' && blog.rejectionReason && (
                        <div className="mt-3 p-3.5 bg-rose-950/20 border border-rose-500/10 rounded-2xl text-xs text-rose-300 leading-relaxed flex gap-2 items-start">
                          <AlertCircle size={14} className="shrink-0 text-rose-400 mt-0.5" />
                          <div>
                            <strong className="text-rose-400 font-semibold">Lý do điều chỉnh:</strong> {blog.rejectionReason}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer của Thẻ: Thống kê & Nút nhấn */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-4">
                      {/* Thống kê bài viết dạng font chữ Monospace */}
                      <div className="flex items-center gap-4 text-xs font-medium text-gray-500 font-mono">
                        <span className="bg-white/5 px-2.5 py-0.5 rounded-md text-gray-400">
                          {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        {activeTab === 'published' && (
                          <>
                            <span className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
                              <Eye size={13} className="text-gray-600" /> {blog.viewCount || 0}
                            </span>
                            <span className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                              <MessageCircle size={13} className="text-gray-600" /> {blog.commentCount || 0}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Nhóm nút tác vụ bọc khối kính mờ */}
                      <div className="flex gap-2.5">
                        <Link 
                          to={detailUrl}
                          className="px-4 py-1.5 text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 rounded-xl transition-all"
                        >
                          Đọc bài
                        </Link>
                        
                        {activeTab === 'draft' && (
                          <Link 
                            to={`/blogs/edit/${blog._id}`} 
                            className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-900/20 flex items-center gap-1"
                          >
                            <Edit size={12} /> Sửa đổi
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