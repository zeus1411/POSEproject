import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { searchProducts, setFilters, clearFilters } from '../../redux/slices/productSlice';
import { getRootCategories } from '../../redux/slices/categorySlice';
import { addToCart } from '../../redux/slices/cartSlice';
import ProductGrid from '../../components/common/ProductGrid';
import SearchFilter from '../../components/common/SearchFilter';
import Pagination from '../../components/common/Pagination';
import CategorySidebar from '../../components/common/CategorySidebar';
import HeroCarousel from '../../components/common/HeroCarousel';

const Shop = () => {
  const dispatch = useDispatch();
  const { products, pagination, filters, isLoading } = useSelector((state) => state.products);
  const { rootCategories: categories, isLoading: categoriesLoading } = useSelector((state) => state.categories);
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
    const newFilters = {
      ...filters,
      categoryId: categoryId || undefined
    };
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Hero Carousel Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <HeroCarousel />
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Left Sidebar - Categories */}
          <aside className="lg:block hidden">
            <CategorySidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              isLoading={categoriesLoading}
            />
          </aside>

          {/* Right Content - Products */}
          <main className="min-w-0">
            {/* Mobile Category Dropdown */}
            <div className="lg:hidden mb-6">
              <CategorySidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                isLoading={categoriesLoading}
              />
            </div>

            {/* Search and Filter */}
            <SearchFilter
              filters={filters}
              onFiltersChange={handleFiltersChange}
              categories={categories}
              isLoading={isLoading}
            />

            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6 px-1">
              <div className="text-sm text-gray-600">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    Đang tải...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-blue-600">{products.length}</span>
                    sản phẩm / 
                    <span className="font-semibold text-gray-900">{pagination.total}</span>
                    tổng số
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                Trang {pagination.page} / {pagination.pages || 1}
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
          </main>
        </div>
      </div>
    </div>
  );
};

export default Shop;
