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

const Shop = () => {
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgb(var(--aqua-blue)/0.36),transparent_28%),radial-gradient(circle_at_90%_8%,rgb(var(--natural-green)/0.12),transparent_30%),linear-gradient(180deg,rgb(var(--background))_0%,rgb(236_249_247)_48%,rgb(var(--background))_100%)] text-foreground dark:bg-gradient-to-b dark:from-[#051C1C] dark:via-[#0a2828] dark:to-[#061e2e]">
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
  );
};

export default Shop;
