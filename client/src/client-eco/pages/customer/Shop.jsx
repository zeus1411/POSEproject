import React, { useEffect, useMemo, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { addToCart } from '../../redux/slices/cartSlice';
import { getRootCategories } from '../../redux/slices/categorySlice';
import { searchProducts, setFilters } from '../../redux/slices/productSlice';
import productService from '../../services/productService';
import AquascapeInspiration from '../../components/common/AquascapeInspiration';
import FilterSidebar from '../../components/common/FilterSidebar';
import Pagination from '../../components/common/Pagination';
import ProductGrid from '../../components/common/ProductGrid';
import RecommendationSection from '../../components/common/RecommendationSection';
import ShopDiscoveryBar from '../../components/common/ShopDiscoveryBar';
import ShopHeroBanner from '../../components/common/ShopHeroBanner';
import { useTheme } from '../../context/ThemeContext';

const RECENTLY_VIEWED_KEY = 'aquaticcaps-recently-viewed';

const Shop = () => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { products, pagination, filters, isLoading } = useSelector((state) => state.products);
  const { rootCategories: categories } = useSelector((state) => state.categories);
  const { user } = useSelector((state) => state.auth);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [recentProducts, setRecentProducts] = useState([]);
  const [personalized, setPersonalized] = useState({
    hasPurchaseHistory: false,
    recommended: [],
    similar: [],
  });
  const [personalizedLoading, setPersonalizedLoading] = useState(false);

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

  useEffect(() => {
    const readRecent = (event) => {
      if (event?.detail) {
        setRecentProducts(event.detail);
        return;
      }
      try {
        setRecentProducts(JSON.parse(window.localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]'));
      } catch (error) {
        setRecentProducts([]);
      }
    };
    readRecent();
    window.addEventListener('aquaticcaps:recent-viewed', readRecent);
    return () => window.removeEventListener('aquaticcaps:recent-viewed', readRecent);
  }, []);

  useEffect(() => {
    let active = true;

    if (!user) {
      setPersonalized({ hasPurchaseHistory: false, recommended: [], similar: [] });
      setPersonalizedLoading(false);
      return undefined;
    }

    setPersonalizedLoading(true);
    productService.getPersonalizedRecommendations(6)
      .then((response) => {
        if (active) {
          setPersonalized({
            hasPurchaseHistory: Boolean(response.hasPurchaseHistory),
            recommended: response.recommended || [],
            similar: response.similar || [],
          });
        }
      })
      .catch(() => {
        if (active) {
          setPersonalized({ hasPurchaseHistory: false, recommended: [], similar: [] });
        }
      })
      .finally(() => {
        if (active) setPersonalizedLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const discoveryProducts = useMemo(
    () => [...products].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || (b.rating?.average || 0) - (a.rating?.average || 0)).slice(0, 6),
    [products]
  );
  const bestSellerProducts = useMemo(
    () => [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 6),
    [products]
  );
  const trendingProducts = useMemo(
    () => [...products].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 6),
    [products]
  );
  const hasPersonalizedSuggestions = Boolean(user && personalized.hasPurchaseHistory);
  const recommendedProducts = hasPersonalizedSuggestions ? personalized.recommended : discoveryProducts;

  const handleFiltersChange = (nextFilters) => {
    dispatch(setFilters(nextFilters));
    dispatch(searchProducts({ ...nextFilters, page: 1 }));
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    const nextFilters = { ...filters, categoryId: categoryId || '' };
    dispatch(setFilters(nextFilters));
    dispatch(searchProducts({ ...nextFilters, page: 1 }));
  };

  const handlePageChange = (page) => {
    dispatch(searchProducts({ ...filters, page }));
    document.getElementById('shop-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Chưa đăng nhập',
        text: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.',
        showCancelButton: true,
        confirmButtonText: 'Đăng nhập',
        cancelButtonText: 'Hủy',
        confirmButtonColor: 'rgb(var(--primary))',
      });
      if (result.isConfirmed) window.location.href = '/login';
      return;
    }
    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Không thể thêm vào giỏ hàng',
        text: error || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
        confirmButtonColor: 'rgb(var(--primary))',
      });
    }
  };

  const recommendationProps = {
    isLoading,
    onAddToCart: handleAddToCart,
  };

  return (
    <div className={`shop-page relative min-h-screen overflow-hidden transition-colors duration-300 ${isDark ? 'bg-abyss text-white' : 'bg-background text-foreground'}`}>
      <div className="pointer-events-none fixed inset-0 z-0 hidden bg-[radial-gradient(circle_at_10%_0%,rgba(0,255,209,0.10),transparent_30%),radial-gradient(circle_at_88%_10%,rgba(0,229,204,0.08),transparent_28%),linear-gradient(180deg,#051C1C_0%,#061f20_45%,#051C1C_100%)] dark:block" />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-30 [background-image:radial-gradient(circle_at_center,rgba(0,255,209,.25)_1px,transparent_1px)] [background-size:44px_44px]" />

      <div className="relative z-10">
        <ShopHeroBanner products={recommendedProducts.length ? recommendedProducts : discoveryProducts} user={user} />

        <div className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6">
          <ShopDiscoveryBar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onOpenFilters={() => setFiltersOpen(true)}
            isLoading={isLoading}
            resultCount={pagination.total}
          />

          <RecommendationSection
            id="recommended"
            eyebrow={hasPersonalizedSuggestions ? 'Theo lịch sử mua hàng' : 'Aquatic discovery'}
            title={hasPersonalizedSuggestions ? 'Đề xuất cho bạn' : 'Sản phẩm nổi bật'}
            description={hasPersonalizedSuggestions
              ? 'Gợi ý dựa trên nhóm sản phẩm bạn đã mua, ưu tiên lựa chọn nổi bật cùng nhu cầu.'
              : 'Những lựa chọn nổi bật và được đánh giá cao để bắt đầu khám phá.'}
            products={recommendedProducts}
            {...recommendationProps}
            isLoading={isLoading || personalizedLoading}
          />

          <div className="flex items-start gap-6 lg:gap-7">
            <div className="sticky top-28 hidden w-[260px] shrink-0 lg:block">
              <FilterSidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>

            <main id="shop-products" className="min-w-0 flex-1 scroll-mt-40">
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <p className="mb-2 font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-ocean dark:text-neon-cyan">Catalogue</p>
                  <h2 className="font-headline text-2xl font-semibold">Tất cả sản phẩm</h2>
                </div>
                <p className="hidden font-body text-sm text-muted-foreground sm:block">
                  Trang {pagination.page} / {Math.max(pagination.pages, 1)}
                </p>
              </div>
              <ProductGrid
                products={products}
                isLoading={isLoading}
                onAddToCart={handleAddToCart}
                className="mb-8"
              />
              {pagination.pages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={handlePageChange}
                  className="mb-12 mt-7"
                />
              )}

              <RecommendationSection
                eyebrow="Community favorites"
                title="Best sellers"
                products={bestSellerProducts}
                {...recommendationProps}
              />
              <RecommendationSection
                eyebrow="Đang được chú ý"
                title="Trending now"
                products={trendingProducts}
                {...recommendationProps}
              />
              {user && recentProducts.length > 0 && (
                <RecommendationSection
                  eyebrow="Tiếp tục khám phá"
                  title="Đã xem gần đây"
                  products={recentProducts}
                  {...recommendationProps}
                />
              )}
              {hasPersonalizedSuggestions && personalized.similar.length > 0 && (
                <RecommendationSection
                  eyebrow="Tương tự sản phẩm đã mua"
                  title="Bạn cũng có thể thích"
                  description="Các sản phẩm cùng danh mục với lựa chọn trong đơn hàng gần đây của bạn."
                  products={personalized.similar}
                  {...recommendationProps}
                  isLoading={personalizedLoading}
                />
              )}
              <AquascapeInspiration />
            </main>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Lọc sản phẩm"
        onClick={() => setFiltersOpen(true)}
        className="fixed bottom-6 right-5 z-30 flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 font-body text-sm font-semibold text-primary-foreground shadow-glow-cyan lg:hidden"
      >
        <AdjustmentsHorizontalIcon className="h-5 w-5" />
        Bộ lọc
      </button>

      <Drawer
        anchor="bottom"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        PaperProps={{
          sx: {
            maxHeight: '88vh',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            background: isDark ? '#061d1d' : '#f5fbf8',
            color: isDark ? '#f8fafc' : '#1f2937',
          },
        }}
      >
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-muted-foreground/30" />
        <div className="overflow-y-auto p-4">
          <FilterSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onDone={() => setFiltersOpen(false)}
          />
        </div>
      </Drawer>
    </div>
  );
};

export default Shop;
