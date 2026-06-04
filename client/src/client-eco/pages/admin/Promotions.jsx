import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  getAllPromotions, 
  createPromotion, 
  updatePromotion, 
  deletePromotion, 
  togglePromotionStatus,
  clearError,
  clearMessage
} from '../../redux/slices/promotionSlice';
import { getProducts } from '../../redux/slices/productSlice';
import { getCategories } from '../../redux/slices/categorySlice';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaPercent, FaDollarSign, FaShippingFast, FaGift, FaTags, FaShoppingCart, FaFilter, FaCreditCard } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

// Helper function to generate coupon code
const generateCouponCode = () => {
  return 'AQUA' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

const AdminPromotions = () => {
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const { promotions, isLoading, isError, error, message, pagination } = useSelector(state => state.promotions);
  const { products } = useSelector(state => state.products);
  const { categories } = useSelector(state => state.categories);

  // Helper: Convert UTC date to local datetime-local format (YYYY-MM-DDTHH:mm)
  const convertUTCToLocal = (utcDate) => {
    if (!utcDate) return '';
    const date = new Date(utcDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Helper: Convert local datetime-local to ISO string for backend
  const convertLocalToUTC = (localDateTime) => {
    if (!localDateTime) return null;
    return new Date(localDateTime).toISOString();
  };

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPromotionId, setCurrentPromotionId] = useState(null);

  // ==================== COUPON ONLY ====================
  const [selectedPromotionType, setSelectedPromotionType] = useState('COUPON');

  // Form data - COUPON only
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    promotionType: 'COUPON',
    discountType: 'PERCENTAGE',
    discountValue: '',
    applyTo: 'ORDER',
    applicableProducts: [],
    applicableCategories: [],
    conditions: {
      minOrderValue: '',
      minQuantity: '',
      maxDiscount: '',
      firstOrderOnly: false,
      buyQuantity: '',
      getQuantity: ''
    },
    usageLimit: {
      total: '',
      perUser: ''
    },
    startDate: '',
    endDate: '',
    isActive: true,
    code: generateCouponCode()
  });

  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState(''); // Local search input
  const [filters, setFilters] = useState({
    promotionType: '',
    isActive: '',
    search: ''
  });

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const nextSearch = searchInput.trim();
      if (filters.search === nextSearch) return;
      setFilters(prev => ({ ...prev, search: nextSearch }));
      setCurrentPage(1); // Reset to page 1 when search changes
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchInput, filters.search]);

  // Load initial data (products & categories)
  useEffect(() => {
    dispatch(getProducts({ page: 1, limit: 1000 }));
    dispatch(getCategories());
  }, [dispatch]);

  // Load promotions when page changes
  useEffect(() => {
    dispatch(getAllPromotions({ page: currentPage, limit: 10, filters }));
  }, [dispatch, currentPage, filters]);

  // Handle messages
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
    }
  }, [error, message, dispatch]);

  // Reset form for COUPON creation
  const resetFormData = () => {
    setFormData({
      name: '',
      description: '',
      promotionType: 'COUPON',
      discountType: 'PERCENTAGE',
      discountValue: '',
      applyTo: 'ORDER',
      applicableProducts: [],
      applicableCategories: [],
      conditions: {
        minOrderValue: '',
        minQuantity: '',
        maxDiscount: '',
        firstOrderOnly: false,
        buyQuantity: '',
        getQuantity: ''
      },
      usageLimit: {
        total: '',
        perUser: ''
      },
      startDate: '',
      endDate: '',
      isActive: true,
      code: generateCouponCode()
    });
  };



  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle multi-select
  const handleMultiSelect = (name, value) => {
    const currentValues = formData[name] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    setFormData(prev => ({
      ...prev,
      [name]: newValues
    }));
  };

  // Open modal for create
  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setCurrentPromotionId(null);
    setSelectedPromotionType('COUPON');
    resetFormData();
    setShowModal(true);
  };

  // Open modal for edit
  const handleOpenEditModal = (promotion) => {
    console.log('📝 Edit promotion:', {
      originalStartDate: promotion.startDate,
      originalEndDate: promotion.endDate,
      convertedStartDate: convertUTCToLocal(promotion.startDate),
      convertedEndDate: convertUTCToLocal(promotion.endDate)
    });
    
    setIsEditMode(true);
    setCurrentPromotionId(promotion._id);
    setSelectedPromotionType(promotion.promotionType);
    setFormData({
      name: promotion.name,
      description: promotion.description || '',
      promotionType: promotion.promotionType,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      applyTo: promotion.applyTo,
      // Map backend field names to frontend field names
      applicableProducts: promotion.targetProducts?.map(p => p._id || p) || [],
      applicableCategories: promotion.targetCategories?.map(c => c._id || c) || [],
      conditions: {
        minOrderValue: promotion.conditions?.minOrderValue || '',
        minQuantity: promotion.conditions?.minQuantity || '',
        maxDiscount: promotion.conditions?.maxDiscount || '',
        firstOrderOnly: promotion.conditions?.firstOrderOnly || false,
        buyQuantity: promotion.conditions?.buyQuantity || '',
        getQuantity: promotion.conditions?.getQuantity || ''
      },
      usageLimit: {
        total: promotion.usageLimit?.total || '',
        perUser: promotion.usageLimit?.perUser || ''
      },
      startDate: convertUTCToLocal(promotion.startDate),
      endDate: convertUTCToLocal(promotion.endDate),
      isActive: promotion.isActive,
      code: promotion.code || ''
    });
    setShowModal(true);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name) {
      toast.error('Vui lòng nhập tên chương trình');
      return;
    }
    
    // Validate discountValue only if not FREE_SHIPPING
    if (formData.discountType !== 'FREE_SHIPPING' && !formData.discountValue) {
      toast.error('Vui lòng nhập giá trị giảm');
      return;
    }

    console.log('📅 Form dates:', {
      startDateInput: formData.startDate,
      endDateInput: formData.endDate,
      startDateUTC: convertLocalToUTC(formData.startDate),
      endDateUTC: convertLocalToUTC(formData.endDate)
    });

    // Clean data and map field names
    const submitData = {
      ...formData,
      // Map frontend field names to backend field names
      targetProducts: formData.applicableProducts,
      targetCategories: formData.applicableCategories,
      // Set discountValue to 0 for FREE_SHIPPING, otherwise convert to Number
      discountValue: formData.discountType === 'FREE_SHIPPING' ? 0 : Number(formData.discountValue),
      // Convert local datetime to UTC ISO string
      startDate: convertLocalToUTC(formData.startDate),
      endDate: convertLocalToUTC(formData.endDate),
      conditions: {
        minOrderValue: formData.conditions.minOrderValue ? Number(formData.conditions.minOrderValue) : undefined,
        minQuantity: formData.conditions.minQuantity ? Number(formData.conditions.minQuantity) : undefined,
        maxDiscount: formData.conditions.maxDiscount ? Number(formData.conditions.maxDiscount) : undefined,
        firstOrderOnly: formData.conditions.firstOrderOnly,
        // Remove buyQuantity and getQuantity since we removed BUY_X_GET_Y
        buyQuantity: undefined,
        getQuantity: undefined
      },
      usageLimit: {
        total: formData.usageLimit.total ? Number(formData.usageLimit.total) : undefined,
        perUser: formData.usageLimit.perUser ? Number(formData.usageLimit.perUser) : undefined
      }
    };
    
    // Remove frontend-only fields
    delete submitData.applicableProducts;
    delete submitData.applicableCategories;

    try {
      if (isEditMode) {
        await dispatch(updatePromotion({ 
          promotionId: currentPromotionId, 
          promotionData: submitData 
        })).unwrap();
      } else {
        await dispatch(createPromotion(submitData)).unwrap();
      }
      setShowModal(false);
      dispatch(getAllPromotions({ page: currentPage, limit: 10, filters }));
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa khuyến mãi này?')) {
      try {
        await dispatch(deletePromotion(id)).unwrap();
        dispatch(getAllPromotions({ page: currentPage, limit: 10, filters }));
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  // Toggle status
  const handleToggleStatus = async (id) => {
    try {
      await dispatch(togglePromotionStatus(id)).unwrap();
      dispatch(getAllPromotions({ page: currentPage, limit: 10, filters }));
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Get discount display
  const getDiscountDisplay = (promotion) => {
    if (promotion.discountType === 'PERCENTAGE') {
      return `${promotion.discountValue}%`;
    } else if (promotion.discountType === 'FIXED_AMOUNT') {
      return formatCurrency(promotion.discountValue);
    } else if (promotion.discountType === 'FREE_SHIPPING') {
      return 'Miễn phí vận chuyển';
    }
    return '-';
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-transparent p-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">
              Quản lý Mã giảm giá
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Tạo và quản lý các mã giảm giá (Coupon) cho khách hàng</p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-200 flex items-center gap-2 font-semibold"
          >
            <FaPlus /> Tạo mã giảm giá mới
          </button>
        </div>

        {/* Filters */}
        <div className="glass-panel p-6 rounded-3xl shadow-xl mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 border border-water/30 dark:border-white/10">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mã..."
            className="bg-water/5 border border-water/30 dark:bg-white/5 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <select
            className="bg-water/5 border border-water/30 dark:bg-white/5 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            value={filters.isActive}
            onChange={(e) => {
              setFilters({ ...filters, isActive: e.target.value });
              setCurrentPage(1); // Reset to page 1 when filter changes
            }}
          >
            <option value="" className="bg-card text-foreground">Tất cả trạng thái</option>
            <option value="true" className="bg-card text-foreground">Đang hoạt động</option>
            <option value="false" className="bg-card text-foreground">Đã tắt</option>
          </select>
        </div>

        {/* Promotions Table */}
        <div className="glass-panel rounded-3xl shadow-xl overflow-hidden border border-water/30 dark:border-white/10">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-12">
              <FaCreditCard className="mx-auto text-pink-400 dark:text-pink-500/80 text-6xl mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-lg">Chưa có mã giảm giá nào</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Tạo mã giảm giá đầu tiên để thu hút khách hàng</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1260px] w-full table-fixed">
                <colgroup>
                  <col className="w-[32%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[14%]" />
                  <col className="w-[10%]" />
                  <col className="w-[8%]" />
                </colgroup>
                <thead className="bg-water/10 dark:bg-white/5 border-b border-water/20 dark:border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-[12px] font-semibold text-slate-800 dark:text-slate-200 uppercase whitespace-nowrap">Tên chương trình</th>
                    <th className="px-6 py-4 text-left text-[12px] font-semibold text-slate-800 dark:text-slate-200 uppercase whitespace-nowrap">Loại khuyến mãi</th>
                    <th className="px-6 py-4 text-left text-[12px] font-semibold text-slate-800 dark:text-slate-200 uppercase whitespace-nowrap">Giảm giá</th>
                    <th className="px-6 py-4 text-left text-[12px] font-semibold text-slate-800 dark:text-slate-200 uppercase whitespace-nowrap">Mã</th>
                    <th className="px-6 py-4 text-left text-[12px] font-semibold text-slate-800 dark:text-slate-200 uppercase whitespace-nowrap">Thời gian</th>
                    <th className="px-6 py-4 text-left text-[12px] font-semibold text-slate-800 dark:text-slate-200 uppercase whitespace-nowrap">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-[12px] font-semibold text-slate-800 dark:text-slate-200 uppercase whitespace-nowrap">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-water/10 dark:divide-white/5">
                  {promotions.map((promotion) => (
                    <tr key={promotion._id} className="hover:bg-water/5 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 align-middle">
                        <div className="font-semibold text-slate-800 dark:text-slate-100 break-words">{promotion.name}</div>
                        {promotion.description && (
                          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{promotion.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold bg-pink-100/80 dark:bg-pink-950/45 text-pink-700 dark:text-pink-300 border border-pink-200/40 dark:border-pink-850/20">
                          🎫 Mã giảm giá
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 whitespace-normal">
                          {getDiscountDisplay(promotion)}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        {promotion.code ? (
                          <code className="inline-block max-w-full truncate bg-water/10 dark:bg-white/10 px-2 py-1 rounded text-sm font-mono text-slate-800 dark:text-slate-100 border border-water/20 dark:border-white/10">
                            {promotion.code}
                          </code>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 align-middle text-sm text-slate-700 dark:text-slate-300">
                        <div>{new Date(promotion.startDate).toLocaleString('vi-VN', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })}</div>
                        <div className="text-slate-400 dark:text-slate-500">đến {new Date(promotion.endDate).toLocaleString('vi-VN', {
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })}</div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <button
                          onClick={() => handleToggleStatus(promotion._id)}
                          className={`inline-flex items-center gap-2 whitespace-nowrap px-3 py-1 rounded-full text-sm font-semibold transition-colors border ${
                            promotion.isActive 
                              ? 'bg-green-100/80 dark:bg-green-950/50 text-green-700 dark:text-green-300 hover:bg-green-200/80 dark:hover:bg-green-900/50 border-green-200 dark:border-green-800/30' 
                              : 'bg-red-100/80 dark:bg-red-950/50 text-red-700 dark:text-red-300 hover:bg-red-200/80 dark:hover:bg-red-900/50 border-red-200 dark:border-red-800/30'
                          }`}
                        >
                          {promotion.isActive ? <FaToggleOn /> : <FaToggleOff />}
                          {promotion.isActive ? 'Hoạt động' : 'Đã tắt'}
                        </button>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(promotion)}
                            className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"
                            title="Sửa"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(promotion._id)}
                            className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages >= 1 && (
          <div className="glass-panel rounded-3xl p-6 mt-6 shadow-xl border border-water/30 dark:border-white/10">
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                Hiển thị <span className="font-semibold text-primary">{promotions.length}</span> trong tổng số{' '}
                <span className="font-semibold text-primary">{pagination.total || 0}</span> khuyến mãi
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 border rounded-lg text-sm font-semibold transition-all ${
                    currentPage === 1
                      ? 'text-slate-400 dark:text-slate-600 border-water/10 dark:border-white/5 cursor-not-allowed'
                      : 'text-slate-700 dark:text-slate-200 border-water/20 dark:border-white/10 hover:bg-water/10 dark:hover:bg-white/10'
                  }`}
                >
                  Trước
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage > pagination.totalPages - 3) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-water/10 dark:hover:bg-white/10'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className={`px-3 py-1 border rounded-lg text-sm font-semibold transition-all ${
                    currentPage === pagination.totalPages
                      ? 'text-slate-400 dark:text-slate-600 border-water/10 dark:border-white/5 cursor-not-allowed'
                      : 'text-slate-700 dark:text-slate-200 border-water/20 dark:border-white/10 hover:bg-water/10 dark:hover:bg-white/10'
                  }`}
                >
                  Tiếp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== MODAL WITH 4 RADIO BUTTONS ==================== */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="glass-panel solid-modal max-w-5xl w-full max-h-[95vh] overflow-y-auto rounded-3xl shadow-2xl border border-water/40 dark:border-white/15">
              <div className="sticky top-0 bg-water/20 dark:bg-card/90 backdrop-blur-md border-b border-water/30 dark:border-white/10 px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">
                  {isEditMode ? '✏️ Chỉnh sửa khuyến mãi' : '✨ Tạo khuyến mãi mới'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-3xl font-light"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* ==================== COUPON TYPE ONLY ==================== */}
                <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 dark:from-pink-950/20 dark:to-rose-950/20 p-6 rounded-2xl border border-pink-200/40 dark:border-pink-800/30">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-pink-500/20 rounded-xl text-pink-500">
                      <FaCreditCard className="text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Tạo Mã giảm giá (Coupon)</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Khách hàng phải nhập mã để nhận ưu đãi. Có thể giới hạn số lần sử dụng và người dùng.</p>
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Tên chương trình <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-water/5 dark:bg-white/5 border border-water/30 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="VD: Giảm giá mùa hè 2024"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Mã giảm giá <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        className="flex-1 bg-water/5 dark:bg-white/5 border border-water/30 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all font-mono"
                        placeholder="AQUA12345"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, code: generateCouponCode() })}
                        className="bg-pink-500/20 dark:bg-pink-500/30 hover:bg-pink-500/30 dark:hover:bg-pink-500/40 text-pink-700 dark:text-pink-300 px-4 py-2.5 rounded-xl font-bold border border-pink-300/30 transition-colors"
                      >
                        Tạo mã
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mô tả</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full bg-water/5 dark:bg-white/5 border border-water/30 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    rows="3"
                    placeholder="Mô tả chi tiết về chương trình..."
                  />
                </div>

                {/* Discount Type & Value */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Loại giảm giá <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className="w-full bg-water/5 dark:bg-white/5 border border-water/30 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="PERCENTAGE" className="bg-card text-foreground">Giảm theo phần trăm (%)</option>
                      <option value="FIXED_AMOUNT" className="bg-card text-foreground">Giảm số tiền cố định (VND)</option>
                      <option value="FREE_SHIPPING" className="bg-card text-foreground">Miễn phí vận chuyển</option>
                    </select>
                  </div>

                  {formData.discountType !== 'FREE_SHIPPING' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Giá trị giảm <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="discountValue"
                          value={formData.discountValue}
                          onChange={handleInputChange}
                          className="w-full bg-water/5 dark:bg-white/5 border border-water/30 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-2.5 pr-14 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                          placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '50000'}
                          min="0"
                          required
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-bold">
                          {formData.discountType === 'PERCENTAGE' ? '%' : 'VND'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {formData.discountType === 'FREE_SHIPPING' && (
                  <div className="bg-green-500/10 dark:bg-green-950/20 p-5 rounded-2xl border border-green-500/30 dark:border-green-800/30 text-green-700 dark:text-green-300">
                    <div className="flex items-center gap-2 font-bold text-green-800 dark:text-green-400">
                      <FaShippingFast className="text-lg" />
                      <span>Miễn phí vận chuyển</span>
                    </div>
                    <p className="text-sm mt-2 leading-relaxed">
                      Khách hàng sẽ được miễn phí vận chuyển khi sử dụng mã này. Bạn có thể đặt giới hạn giảm tối đa bên dưới.
                    </p>
                  </div>
                )}

                {/* Coupon applies to entire order by default */}
                <div className="bg-pink-500/10 dark:bg-pink-950/20 p-5 rounded-2xl border border-pink-500/30 dark:border-pink-850/30 text-pink-700 dark:text-pink-300">
                  <div className="flex items-center gap-2 font-bold text-pink-800 dark:text-pink-400">
                    <FaShoppingCart className="text-lg" />
                    <span>Phạm vi áp dụng</span>
                  </div>
                  <p className="text-sm mt-2 leading-relaxed">
                    Mã giảm giá này sẽ được áp dụng cho toàn bộ đơn hàng khi khách hàng nhập mã tại checkout.
                  </p>
                </div>

                {/* Conditions */}
                <div className="bg-yellow-500/5 dark:bg-yellow-950/10 p-5 rounded-2xl border border-yellow-500/20 dark:border-yellow-800/20 space-y-4">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">📋 Điều kiện áp dụng (Tùy chọn)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Giá trị đơn tối thiểu (VND)</label>
                      <input
                        type="number"
                        name="conditions.minOrderValue"
                        value={formData.conditions.minOrderValue}
                        onChange={handleInputChange}
                        className="w-full bg-water/5 dark:bg-white/5 border border-water/30 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Số lượng sản phẩm tối thiểu</label>
                      <input
                        type="number"
                        name="conditions.minQuantity"
                        value={formData.conditions.minQuantity}
                        onChange={handleInputChange}
                        className="w-full bg-water/5 dark:bg-white/5 border border-water/30 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    {(formData.discountType === 'PERCENTAGE' || formData.discountType === 'FREE_SHIPPING') && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Giảm tối đa (VND)
                          {formData.discountType === 'FREE_SHIPPING' && (
                            <span className="text-xs text-slate-500 ml-2">(Áp dụng cho phí ship)</span>
                          )}
                        </label>
                        <input
                          type="number"
                          name="conditions.maxDiscount"
                          value={formData.conditions.maxDiscount}
                          onChange={handleInputChange}
                          className="w-full bg-water/5 dark:bg-white/5 border border-water/30 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                          placeholder="Không giới hạn"
                          min="0"
                        />
                        {formData.discountType === 'FREE_SHIPPING' && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            VD: Nhập 50000 để chỉ miễn phí tối đa 50,000đ phí ship
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="conditions.firstOrderOnly"
                      checked={formData.conditions.firstOrderOnly}
                      onChange={handleInputChange}
                      className="h-5 w-5 rounded border-water/40 dark:border-white/20 text-pink-600 focus:ring-pink-500 bg-water/5 dark:bg-white/5 cursor-pointer"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Chỉ áp dụng cho đơn hàng đầu tiên của khách hàng</span>
                  </label>
                </div>

                {/* Usage Limit */}
                <div className="bg-blue-500/5 dark:bg-blue-950/10 p-5 rounded-2xl border border-blue-500/20 dark:border-blue-800/20 space-y-4">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">🎯 Giới hạn sử dụng</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tổng số lần sử dụng</label>
                      <input
                        type="number"
                        name="usageLimit.total"
                        value={formData.usageLimit.total}
                        onChange={handleInputChange}
                        className="w-full bg-water/5 dark:bg-white/5 border border-water/30 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Không giới hạn"
                        min="1"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Để trống nếu không muốn giới hạn</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Giới hạn mỗi khách hàng</label>
                      <input
                        type="number"
                        name="usageLimit.perUser"
                        value={formData.usageLimit.perUser}
                        onChange={handleInputChange}
                        className="w-full bg-water/5 dark:bg-white/5 border border-water/30 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Không giới hạn"
                        min="1"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Mỗi khách hàng có thể sử dụng bao nhiều lần</p>
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full bg-water/5 dark:bg-white/5 border border-water/30 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Ngày kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full bg-water/5 dark:bg-white/5 border border-water/30 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Active Status */}
                <label className="flex items-center gap-3 p-5 bg-water/5 dark:bg-white/5 border border-water/20 dark:border-white/10 rounded-2xl cursor-pointer hover:bg-water/10 dark:hover:bg-white/10 transition-colors select-none">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-5 w-5 rounded border-water/40 dark:border-white/20 text-green-600 focus:ring-green-500 bg-water/5 dark:bg-white/5 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Kích hoạt ngay</span>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Chương trình sẽ hoạt động ngay khi tạo</p>
                  </div>
                </label>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-water/20 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2.5 border border-water/30 dark:border-white/20 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-water/10 dark:hover:bg-white/10 font-bold transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:shadow-lg hover:shadow-pink-500/20 text-white rounded-xl font-bold disabled:opacity-50 transition-all"
                  >
                    {isLoading ? 'Đang xử lý...' : isEditMode ? 'Cập nhật mã giảm giá' : 'Tạo mã giảm giá'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPromotions;
