import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { searchProducts, setFilters, clearFilters } from '../../redux/slices/productSlice';
import { getRootCategories } from '../../redux/slices/categorySlice';
import { addToCart } from '../../redux/slices/cartSlice';
import ProductGrid from '../../components/common/ProductGrid';
import SearchFilter from '../../components/common/SearchFilter';
import CategorySidebar from '../../components/common/CategorySidebar';
import Pagination from '../../components/common/Pagination';
import ShopCarousel from '../../components/common/ShopCarousel';
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

  useEffect(() => {
    // Load categories
    dispatch(getRootCategories());
    
    // Load products with category from URL
    const initialFilters = { ...filters, categoryId: category };
    dispatch(setFilters(initialFilters));
    dispatch(searchProducts({ ...initialFilters, page: 1 }));
  }, [dispatch, category]);

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
        confirmButtonColor: '#3b82f6'
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
        confirmButtonColor: '#3b82f6'
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
    <div className="min-h-screen bg-gray-50">
      {/* Banner Carousel */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[95%] 2xl:max-w-[90%] mx-auto px-2 sm:px-4 py-4">
          <ShopCarousel />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[95%] 2xl:max-w-[90%] mx-auto px-2 sm:px-4 py-6">
        <div className="flex gap-4 lg:gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 xl:w-72 2xl:w-80 flex-shrink-0">
            <CategorySidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              isLoading={isLoading}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {/* Search and Filter */}
            <SearchFilter
              filters={filters}
              onFiltersChange={handleFiltersChange}
              categories={categories}
              isLoading={isLoading}
            />

            {/* Results Summary */}
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 mb-4 pl-4 lg:pl-6">
              <div className="text-sm text-gray-600">
                {isLoading ? (
                  <span>Đang tải...</span>
                ) : (
                  <span>
                    Hiển thị {products.length} sản phẩm trong tổng số {pagination.total} sản phẩm
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-500 whitespace-nowrap">
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
