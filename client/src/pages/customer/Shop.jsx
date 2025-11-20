import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { searchProducts, setFilters, clearFilters } from '../../redux/slices/productSlice';
import { getRootCategories } from '../../redux/slices/categorySlice';
import { addToCart } from '../../redux/slices/cartSlice';
import ProductGrid from '../../components/common/ProductGrid';
import SearchFilter from '../../components/common/SearchFilter';
import CategorySidebar from '../../components/common/CategorySidebar';
import Pagination from '../../components/common/Pagination';
import ShopCarousel from '../../components/common/ShopCarousel';

const Shop = () => {
  const dispatch = useDispatch();
  const { products, pagination, filters, isLoading } = useSelector((state) => state.products);
  const { rootCategories: categories } = useSelector((state) => state.categories);
  const { user } = useSelector((state) => state.auth);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    // Load categories
    dispatch(getRootCategories());
    
    // Load products with current filters
    dispatch(searchProducts({ ...filters, page: 1 }));
  }, [dispatch]);

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
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }

    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
    } catch (error) {
      alert(error || 'Không thể thêm sản phẩm vào giỏ hàng');
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ShopCarousel />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <CategorySidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              isLoading={isLoading}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Search and Filter */}
            <SearchFilter
              filters={filters}
              onFiltersChange={handleFiltersChange}
              categories={categories}
              isLoading={isLoading}
            />

            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                {isLoading ? (
                  <span>Đang tải...</span>
                ) : (
                  <span>
                    Hiển thị {products.length} sản phẩm trong tổng số {pagination.total} sản phẩm
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-500">
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
              className="mb-8"
            />

            {/* Pagination */}
            {pagination.pages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
                className="mt-8"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
