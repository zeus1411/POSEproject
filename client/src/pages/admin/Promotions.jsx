import { useState, useEffect, useMemo } from 'react';
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

const AdminPromotions = () => {
  const dispatch = useDispatch();
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

  // ==================== 4 RADIO BUTTON OPTIONS ====================
  const [selectedPromotionType, setSelectedPromotionType] = useState('PRODUCT_DISCOUNT');

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    promotionType: 'PRODUCT_DISCOUNT',
    discountType: 'PERCENTAGE',
    discountValue: '',
    applyTo: 'ALL_PRODUCTS',
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
    code: ''
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
      setFilters(prev => ({ ...prev, search: searchInput }));
      setCurrentPage(1); // Reset to page 1 when search changes
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load initial data (products & categories)
  useEffect(() => {
    dispatch(getProducts({ page: 1, limit: 1000 }));
    dispatch(getCategories());
  }, [dispatch]);

  // Load promotions when page changes
  useEffect(() => {
    dispatch(getAllPromotions({ page: currentPage, limit: 20, filters }));
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

  // Handle promotion type change (RADIO BUTTON)
  const handlePromotionTypeChange = (type) => {
    setSelectedPromotionType(type);
    
    // Reset form khi đổi type
    let resetData = {
      ...formData,
      promotionType: type,
      discountType: 'PERCENTAGE',
      applyTo: 'ALL_PRODUCTS',
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
      code: ''
    };

    // Set defaults theo type
    switch(type) {
      case 'PRODUCT_DISCOUNT':
        resetData.applyTo = 'ALL_PRODUCTS';
        break;
      case 'ORDER_DISCOUNT':
        resetData.applyTo = 'ORDER';
        break;
      case 'CONDITIONAL_DISCOUNT':
        resetData.applyTo = 'ORDER';
        break;
      case 'COUPON':
        resetData.applyTo = 'ORDER';
        resetData.code = generateCouponCode();
        break;
      default:
        break;
    }

    setFormData(resetData);
  };

  // Generate random coupon code
  const generateCouponCode = () => {
    return 'AQUA' + Math.random().toString(36).substring(2, 8).toUpperCase();
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
    setSelectedPromotionType('PRODUCT_DISCOUNT');
    setFormData({
      name: '',
      description: '',
      promotionType: 'PRODUCT_DISCOUNT',
      discountType: 'PERCENTAGE',
      discountValue: '',
      applyTo: 'ALL_PRODUCTS',
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
      code: ''
    });
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
    if (!formData.name || !formData.discountValue) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
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
      discountValue: Number(formData.discountValue),
      // Convert local datetime to UTC ISO string
      startDate: convertLocalToUTC(formData.startDate),
      endDate: convertLocalToUTC(formData.endDate),
      conditions: {
        minOrderValue: formData.conditions.minOrderValue ? Number(formData.conditions.minOrderValue) : undefined,
        minQuantity: formData.conditions.minQuantity ? Number(formData.conditions.minQuantity) : undefined,
        maxDiscount: formData.conditions.maxDiscount ? Number(formData.conditions.maxDiscount) : undefined,
        firstOrderOnly: formData.conditions.firstOrderOnly,
        buyQuantity: formData.conditions.buyQuantity ? Number(formData.conditions.buyQuantity) : undefined,
        getQuantity: formData.conditions.getQuantity ? Number(formData.conditions.getQuantity) : undefined
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
      dispatch(getAllPromotions({ page: currentPage, limit: 20, filters }));
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa khuyến mãi này?')) {
      try {
        await dispatch(deletePromotion(id)).unwrap();
        dispatch(getAllPromotions({ page: currentPage, limit: 20, filters }));
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  // Toggle status
  const handleToggleStatus = async (id) => {
    try {
      await dispatch(togglePromotionStatus(id)).unwrap();
      dispatch(getAllPromotions({ page: currentPage, limit: 20, filters }));
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
      return 'Miễn phí ship';
    } else {
      return `Mua ${promotion.conditions?.buyQuantity} tặng ${promotion.conditions?.getQuantity}`;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Khuyến mãi</h1>
          <p className="text-gray-600 mt-1">Tạo và quản lý các chương trình giảm giá</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-semibold"
        >
          <FaPlus /> Tạo khuyến mãi mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc mã..."
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filters.promotionType}
          onChange={(e) => {
            setFilters({ ...filters, promotionType: e.target.value });
            setCurrentPage(1); // Reset to page 1 when filter changes
          }}
        >
          <option value="">Tất cả loại</option>
          <option value="PRODUCT_DISCOUNT">Giảm giá sản phẩm</option>
          <option value="ORDER_DISCOUNT">Giảm giá đơn hàng</option>
          <option value="CONDITIONAL_DISCOUNT">Giảm giá có điều kiện</option>
          <option value="COUPON">Mã giảm giá</option>
        </select>
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filters.isActive}
          onChange={(e) => {
            setFilters({ ...filters, isActive: e.target.value });
            setCurrentPage(1); // Reset to page 1 when filter changes
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Đã tắt</option>
        </select>
      </div>

      {/* Promotions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-12">
            <FaTags className="mx-auto text-gray-400 text-6xl mb-4" />
            <p className="text-gray-500 text-lg">Chưa có chương trình khuyến mãi nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Tên chương trình</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Loại</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Giảm giá</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Mã</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Thời gian</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {promotions.map((promotion) => (
                  <tr key={promotion._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{promotion.name}</div>
                      {promotion.description && (
                        <div className="text-sm text-gray-500 mt-1">{promotion.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        promotion.promotionType === 'PRODUCT_DISCOUNT' ? 'bg-purple-100 text-purple-700' :
                        promotion.promotionType === 'ORDER_DISCOUNT' ? 'bg-blue-100 text-blue-700' :
                        promotion.promotionType === 'CONDITIONAL_DISCOUNT' ? 'bg-orange-100 text-orange-700' :
                        'bg-pink-100 text-pink-700'
                      }`}>
                        {promotion.promotionType === 'PRODUCT_DISCOUNT' ? '🏷️ Sản phẩm' :
                         promotion.promotionType === 'ORDER_DISCOUNT' ? '🛒 Đơn hàng' :
                         promotion.promotionType === 'CONDITIONAL_DISCOUNT' ? '📊 Có điều kiện' :
                         '🎫 Mã giảm giá'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600">
                        {getDiscountDisplay(promotion)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {promotion.code ? (
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {promotion.code}
                        </code>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>{new Date(promotion.startDate).toLocaleString('vi-VN', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}</div>
                      <div className="text-gray-500">đến {new Date(promotion.endDate).toLocaleString('vi-VN', {
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(promotion._id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          promotion.isActive 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {promotion.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        {promotion.isActive ? 'Hoạt động' : 'Đã tắt'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEditModal(promotion)}
                          className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                          title="Sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(promotion._id)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                          title="Xóa"
                        >
                          <FaTrash />
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
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {[...Array(pagination.totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === i + 1
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* ==================== MODAL WITH 4 RADIO BUTTONS ==================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditMode ? '✏️ Chỉnh sửa khuyến mãi' : '✨ Tạo khuyến mãi mới'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* ==================== 4 RADIO BUTTON OPTIONS ==================== */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                <label className="block text-lg font-bold text-gray-800 mb-4">
                  🎯 Chọn loại chương trình khuyến mãi <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option 1: Product Discount */}
                  <label className={`relative flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedPromotionType === 'PRODUCT_DISCOUNT' 
                      ? 'border-purple-500 bg-purple-50 shadow-lg scale-105' 
                      : 'border-gray-300 bg-white hover:border-purple-300 hover:shadow-md'
                  }`}>
                    <input
                      type="radio"
                      name="promotionType"
                      value="PRODUCT_DISCOUNT"
                      checked={selectedPromotionType === 'PRODUCT_DISCOUNT'}
                      onChange={(e) => handlePromotionTypeChange(e.target.value)}
                      className="mt-1 h-5 w-5 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex items-center gap-2">
                        <FaTags className="text-purple-600 text-xl" />
                        <span className="font-bold text-gray-800">Giảm giá sản phẩm</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Áp dụng giảm giá cho toàn bộ hoặc một số sản phẩm cụ thể. Khách hàng tự động nhận ưu đãi khi mua.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Order Discount */}
                  <label className={`relative flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedPromotionType === 'ORDER_DISCOUNT' 
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
                      : 'border-gray-300 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}>
                    <input
                      type="radio"
                      name="promotionType"
                      value="ORDER_DISCOUNT"
                      checked={selectedPromotionType === 'ORDER_DISCOUNT'}
                      onChange={(e) => handlePromotionTypeChange(e.target.value)}
                      className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex items-center gap-2">
                        <FaShoppingCart className="text-blue-600 text-xl" />
                        <span className="font-bold text-gray-800">Giảm giá đơn hàng</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Giảm giá cho toàn bộ đơn hàng. Tự động áp dụng cho mọi khách hàng khi thanh toán.
                      </p>
                    </div>
                  </label>

                  {/* Option 3: Conditional Discount */}
                  <label className={`relative flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedPromotionType === 'CONDITIONAL_DISCOUNT' 
                      ? 'border-orange-500 bg-orange-50 shadow-lg scale-105' 
                      : 'border-gray-300 bg-white hover:border-orange-300 hover:shadow-md'
                  }`}>
                    <input
                      type="radio"
                      name="promotionType"
                      value="CONDITIONAL_DISCOUNT"
                      checked={selectedPromotionType === 'CONDITIONAL_DISCOUNT'}
                      onChange={(e) => handlePromotionTypeChange(e.target.value)}
                      className="mt-1 h-5 w-5 text-orange-600 focus:ring-orange-500"
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex items-center gap-2">
                        <FaFilter className="text-orange-600 text-xl" />
                        <span className="font-bold text-gray-800">Giảm giá có điều kiện</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Giảm giá khi đáp ứng điều kiện (giá trị đơn tối thiểu, số lượng...). Tự động áp dụng.
                      </p>
                    </div>
                  </label>

                  {/* Option 4: Coupon */}
                  <label className={`relative flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedPromotionType === 'COUPON' 
                      ? 'border-pink-500 bg-pink-50 shadow-lg scale-105' 
                      : 'border-gray-300 bg-white hover:border-pink-300 hover:shadow-md'
                  }`}>
                    <input
                      type="radio"
                      name="promotionType"
                      value="COUPON"
                      checked={selectedPromotionType === 'COUPON'}
                      onChange={(e) => handlePromotionTypeChange(e.target.value)}
                      className="mt-1 h-5 w-5 text-pink-600 focus:ring-pink-500"
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex items-center gap-2">
                        <FaCreditCard className="text-pink-600 text-xl" />
                        <span className="font-bold text-gray-800">Mã giảm giá (Coupon)</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Khách hàng phải nhập mã để nhận ưu đãi. Có thể giới hạn số lần sử dụng và người dùng.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên chương trình <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: Giảm giá mùa hè 2024"
                    required
                  />
                </div>

                {selectedPromotionType === 'COUPON' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mã giảm giá <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                        placeholder="AQUA12345"
                        required={selectedPromotionType === 'COUPON'}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, code: generateCouponCode() })}
                        className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg font-medium"
                      >
                        Tạo mã
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Mô tả chi tiết về chương trình..."
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loại giảm giá <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="PERCENTAGE">Giảm theo phần trăm (%)</option>
                    <option value="FIXED_AMOUNT">Giảm số tiền cố định (VND)</option>
                    <option value="FREE_SHIPPING">Miễn phí vận chuyển</option>
                    <option value="BUY_X_GET_Y">Mua X tặng Y</option>
                  </select>
                </div>

                {formData.discountType !== 'BUY_X_GET_Y' && formData.discountType !== 'FREE_SHIPPING' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Giá trị giảm <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="discountValue"
                        value={formData.discountValue}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '50000'}
                        min="0"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        {formData.discountType === 'PERCENTAGE' ? '%' : 'VND'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Buy X Get Y */}
              {formData.discountType === 'BUY_X_GET_Y' && (
                <div className="grid grid-cols-2 gap-4 bg-green-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mua số lượng (X) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="conditions.buyQuantity"
                      value={formData.conditions.buyQuantity}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tặng số lượng (Y) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="conditions.getQuantity"
                      value={formData.conditions.getQuantity}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                      min="1"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Apply To (for PRODUCT_DISCOUNT) */}
              {selectedPromotionType === 'PRODUCT_DISCOUNT' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Áp dụng cho <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="applyTo"
                    value={formData.applyTo}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL_PRODUCTS">Tất cả sản phẩm</option>
                    <option value="SPECIFIC_PRODUCTS">Sản phẩm cụ thể</option>
                    <option value="CATEGORY">Theo danh mục</option>
                  </select>

                  {formData.applyTo === 'SPECIFIC_PRODUCTS' && (
                    <div className="mt-4 max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-2">Chọn sản phẩm áp dụng:</p>
                      {products?.map(product => (
                        <label key={product._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={formData.applicableProducts.includes(product._id)}
                            onChange={() => handleMultiSelect('applicableProducts', product._id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">{product.name}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {formData.applyTo === 'CATEGORY' && (
                    <div className="mt-4 border border-gray-300 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-2">Chọn danh mục:</p>
                      {categories?.map(category => (
                        <label key={category._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={formData.applicableCategories.includes(category._id)}
                            onChange={() => handleMultiSelect('applicableCategories', category._id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">{category.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Conditions */}
              <div className="bg-yellow-50 p-4 rounded-lg space-y-4">
                <h3 className="font-bold text-gray-800 mb-3">📋 Điều kiện áp dụng (Tùy chọn)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giá trị đơn tối thiểu</label>
                    <input
                      type="number"
                      name="conditions.minOrderValue"
                      value={formData.conditions.minOrderValue}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng tối thiểu</label>
                    <input
                      type="number"
                      name="conditions.minQuantity"
                      value={formData.conditions.minQuantity}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  {formData.discountType === 'PERCENTAGE' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Giảm tối đa (VND)</label>
                      <input
                        type="number"
                        name="conditions.maxDiscount"
                        value={formData.conditions.maxDiscount}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="conditions.firstOrderOnly"
                    checked={formData.conditions.firstOrderOnly}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-sm text-gray-700">Chỉ áp dụng cho đơn hàng đầu tiên</span>
                </label>
              </div>

              {/* Usage Limit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Giới hạn tổng số lần sử dụng</label>
                  <input
                    type="number"
                    name="usageLimit.total"
                    value={formData.usageLimit.total}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Không giới hạn"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Giới hạn mỗi người dùng</label>
                  <input
                    type="number"
                    name="usageLimit.perUser"
                    value={formData.usageLimit.perUser}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Không giới hạn"
                    min="1"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ngày kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Active Status */}
              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-green-600 focus:ring-green-500 rounded"
                />
                <div>
                  <span className="font-semibold text-gray-800">Kích hoạt ngay</span>
                  <p className="text-sm text-gray-600">Chương trình sẽ hoạt động ngay khi tạo</p>
                </div>
              </label>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50"
                >
                  {isLoading ? 'Đang xử lý...' : isEditMode ? 'Cập nhật' : 'Tạo mới'}
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
