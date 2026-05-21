import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { searchProducts, setFilters, clearFilters } from '../../redux/slices/productSlice';
import { getRootCategories } from '../../redux/slices/categorySlice';
import { addToCart } from '../../redux/slices/cartSlice';
import ProductGrid from '../../components/common/ProductGrid';
import SearchFilter from '../../components/common/SearchFilter';
import CategorySidebar from '../../components/common/CategorySidebar';
import ShopCarousel from '../../components/common/ShopCarousel';
import Pagination from '../../components/common/Pagination';
import Swal from 'sweetalert2';
import { useTheme } from '../../context/ThemeContext';

const Shop = () => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { products, pagination, filters, isLoading } = useSelector((state) => state.products);
  const { rootCategories: categories } = useSelector((state) => state.categories);
  const { user } = useSelector((state) => state.auth);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || filters.sort || 'createdAt:desc';

  useEffect(() => {
    dispatch(getRootCategories());
    const initialFilters = { ...filters, categoryId: category, search, sort };
    dispatch(setFilters(initialFilters));
    dispatch(searchProducts({ ...initialFilters, page: 1 }));
  }, [dispatch, category, search, sort]);

  useEffect(() => {
    setSelectedCategory(category || null);
  }, [category]);

  const handleFiltersChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(searchProducts({ ...newFilters, page: 1 }));
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    const newFilters = { ...filters, categoryId: categoryId || '' };
    dispatch(setFilters(newFilters));
    dispatch(searchProducts({ ...newFilters, page: 1 }));
  };

  const handlePageChange = (page) => {
    dispatch(searchProducts({ ...filters, page }));
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa đăng nhập',
        text: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng',
        showCancelButton: true,
        confirmButtonText: 'Đăng nhập',
        cancelButtonText: 'Hủy',
        confirmButtonColor: 'rgb(var(--primary))'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login';
        }
      });
      return;
    }
    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Không thể thêm vào giỏ hàng',
        text: error || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
        confirmButtonColor: 'rgb(var(--primary))'
      });
    }
  };

  const handleToggleWishlist = (productId) => {
    setWishlistItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className={`shop-page relative min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#051C1C] text-white' : 'bg-background text-foreground'}`}>
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

      {/* Nội dung chính */}
      <div className="relative z-10">
        {/* Premium Carousel Banner */}
        <ShopCarousel />

      {/* Main Content */}
      <div className="max-w-[95%] 2xl:max-w-[90%] mx-auto px-2 sm:px-4 py-6">
        <div className="flex gap-4 lg:gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 xl:w-72 2xl:w-80 flex-shrink-0">
            <CategorySidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isLoading={isLoading}
            />
          </div>

          {/* Main Content Area */}
          <div id="shop-products" className="flex-1 min-w-0 scroll-mt-24 overflow-hidden">
            {/* Search and Sort Bar */}
            <SearchFilter
              filters={filters}
              onFiltersChange={handleFiltersChange}
              categories={categories}
              isLoading={isLoading}
            />

            {/* Results Summary */}
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 mb-4 px-1">
              <div className="text-sm text-muted-foreground font-body">
                {isLoading ? (
                  <span>Đang tải...</span>
                ) : (
                  <span>
                    Hiển thị <span className="text-nature font-semibold dark:text-primary">{products.length}</span> / {pagination.total} sản phẩm
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground font-body whitespace-nowrap">
                Trang {pagination.page} / {pagination.pages}
              </div>
            </div>

            {/* Products Grid */}
            <ProductGrid
              products={products}
              isLoading={isLoading}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              wishlistItems={wishlistItems}
              className="mb-6"
            />

            {/* Pagination */}
            {pagination.pages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
                className="mt-6"
              />
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Shop;
