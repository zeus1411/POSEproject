// e:/POSE project/client/src/pages/admin/Products.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/admin/AdminLayout';
import ProductTable from '../../components/admin/ProductTable';
import ProductForm from '../../components/admin/ProductForm';
import ProductFilters from '../../components/admin/ProductFilters';
import CategoryTable from '../../components/admin/CategoryTable';
import CategoryForm from '../../components/admin/CategoryForm';
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Plus, Package, FolderTree } from 'lucide-react';
import {
  getAllProductsAdmin,
  getProductByIdAdmin,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  updateProductStatusAdmin,
  reset,
  setFilters,
  clearFilters,
  clearCurrentProduct
} from '../../redux/slices/adminProductSlice';
import { 
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
  reset as resetCategory,
  clearCurrentCategory
} from '../../redux/slices/categorySlice';

const Products = () => {
  const dispatch = useDispatch();
  const { 
    products, 
    currentProduct, 
    isLoading, 
    isSuccess, 
    isError, 
    message, 
    filters, 
    pagination 
  } = useSelector((state) => state.adminProducts);
  const { 
    categories, 
    currentCategory,
    isLoading: categoryLoading,
    isSuccess: categorySuccess,
    isError: categoryError,
    message: categoryMessage
  } = useSelector((state) => state.categories);

  // Tab state
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'categories'

  // Product states
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // Category states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showCategoryConfirm, setShowCategoryConfirm] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // Load categories on mount (include inactive for admin)
  useEffect(() => {
    dispatch(getCategories(true)); // true = includeInactive
  }, [dispatch]);

  // Load products when filters change
  useEffect(() => {
    dispatch(getAllProductsAdmin(filters));
  }, [dispatch, filters]);

  // Handle product success/error messages
  useEffect(() => {
    if (isSuccess && message) {
      toast.success(message);
      dispatch(reset());
      if (showForm) {
        setShowForm(false);
        setEditingProduct(null);
        dispatch(getAllProductsAdmin(filters));
      }
    }
  }, [isSuccess, message, dispatch, showForm, filters]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isError, message, dispatch]);

  // Handle category success/error messages
  useEffect(() => {
    if (categorySuccess && categoryMessage) {
      toast.success(categoryMessage);
      dispatch(resetCategory());
      if (showCategoryForm) {
        setShowCategoryForm(false);
        setEditingCategory(null);
        dispatch(getCategories(true)); // Reload with inactive categories
      }
    } else if (categoryError && categoryMessage) {
      toast.error(categoryMessage);
      dispatch(resetCategory());
    }
  }, [categorySuccess, categoryError, categoryMessage, dispatch, showCategoryForm]);

  // Handle filter changes
  const handleFilterChange = (updates) => {
    const newFilters = { ...filters, ...updates, page: 1 };
    dispatch(setFilters(newFilters));
    dispatch(getAllProductsAdmin(newFilters));
  };

  const handleSearch = (searchTerm) => {
    handleFilterChange({ search: searchTerm });
  };

  const handlePageChange = (page) => {
    // Ensure page is a number and at least 1
    const newPage = Math.max(1, parseInt(page) || 1);
    // Update filters with the new page number
    const newFilters = { ...filters, page: newPage };
    dispatch(setFilters(newFilters));
    // The useEffect that watches filters will trigger the API call
  };

  const handleResetFilters = () => {
    dispatch(clearFilters());
    dispatch(getAllProductsAdmin({}));
  };

  // Toggle product status
  const handleToggleStatus = async (productId, newStatus) => {
    try {
      await dispatch(updateProductStatusAdmin({ productId, status: newStatus })).unwrap();
      toast.success(`Đã cập nhật trạng thái sản phẩm thành ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa'}`);
      dispatch(getAllProductsAdmin(filters));
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái sản phẩm');
      console.error('Error toggling product status:', error);
    }
  };

  // Handle product actions
  const handleAddProduct = () => {
    setEditingProduct(null);
    dispatch(clearCurrentProduct());
    setShowForm(true);
  };

  const handleEditProduct = (productId) => {
    dispatch(getProductByIdAdmin(productId));
    setEditingProduct(productId);
    setShowForm(true);
  };

  const handleViewProduct = (productId) => {
    dispatch(getProductByIdAdmin(productId));
    setEditingProduct(productId);
    setShowForm(true);
  };

  const handleDeleteProduct = (productId) => {
    setDeleteProductId(productId);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (deleteProductId) {
      dispatch(deleteProductAdmin(deleteProductId));
      setShowConfirm(false);
      setDeleteProductId(null);
    }
  };

  const handleFormSubmit = (formData) => {
    if (editingProduct) {
      dispatch(updateProductAdmin({ productId: editingProduct, formData }));
    } else {
      dispatch(createProductAdmin(formData));
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    dispatch(clearCurrentProduct());
  };

  // Category handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    dispatch(clearCurrentCategory());
    setShowCategoryForm(true);
  };

  const handleEditCategory = (categoryId) => {
    dispatch(getCategoryById(categoryId));
    setEditingCategory(categoryId);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = (categoryId) => {
    setDeleteCategoryId(categoryId);
    setShowCategoryConfirm(true);
  };

  const handleConfirmDeleteCategory = () => {
    if (deleteCategoryId) {
      dispatch(deleteCategory(deleteCategoryId));
      setShowCategoryConfirm(false);
      setDeleteCategoryId(null);
    }
  };

  const handleCategoryFormSubmit = (formData) => {
    if (editingCategory) {
      dispatch(updateCategory({ categoryId: editingCategory, categoryData: formData }));
    } else {
      dispatch(createCategory(formData));
    }
  };

  const handleCategoryFormCancel = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    dispatch(clearCurrentCategory());
  };

  const handleToggleCategoryStatus = async (categoryId, newStatus) => {
    try {
      await dispatch(updateCategoryStatus({ categoryId, isActive: newStatus })).unwrap();
      dispatch(getCategories(true)); // Reload categories
    } catch (error) {
      console.error('Error toggling category status:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm & danh mục</h1>
            <p className="text-gray-600 mt-1">Quản lý sản phẩm và danh mục sản phẩm</p>
          </div>
          <button
            onClick={activeTab === 'products' ? handleAddProduct : handleAddCategory}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus size={20} />
            {activeTab === 'products' ? 'Thêm sản phẩm' : 'Thêm danh mục'}
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package size={20} />
              Sản phẩm
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FolderTree size={20} />
              Danh mục
            </button>
          </nav>
        </div>

        {/* Products Tab Content */}
        {activeTab === 'products' && (
          <>
            {/* Filters */}
            <ProductFilters
              filters={filters}
              categories={categories}
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              onReset={handleResetFilters}
            />

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <ProductTable
                products={products}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onToggleStatus={handleToggleStatus}
                isLoading={isLoading}
              />
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-between items-center px-2 py-3 bg-white border-t border-gray-200 rounded-b-lg">
                <div className="text-sm text-gray-600">
                  Hiển thị <span className="font-medium">{products.length}</span> trong tổng số{' '}
                  <span className="font-medium">{pagination.total}</span> sản phẩm
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`px-3 py-1 border rounded-md text-sm ${
                      pagination.page === 1
                        ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Trước
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page > pagination.pages - 3) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded-md text-sm ${
                            pagination.page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {pagination.pages > 5 && pagination.page < pagination.pages - 2 && (
                      <span className="px-2">...</span>
                    )}
                    {pagination.pages > 5 && pagination.page < pagination.pages - 2 && (
                      <button
                        onClick={() => handlePageChange(pagination.pages)}
                        className={`w-8 h-8 rounded-md text-sm ${
                          pagination.page === pagination.pages
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pagination.pages}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className={`px-3 py-1 border rounded-md text-sm ${
                      pagination.page === pagination.pages
                        ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Tiếp
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Categories Tab Content */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <CategoryTable
              categories={categories}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
              onToggleStatus={handleToggleCategoryStatus}
              isLoading={categoryLoading}
            />
          </div>
        )}

        {/* Product Form Modal */}
        {showForm && (
          <ProductForm
            product={currentProduct}
            categories={categories}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isLoading}
          />
        )}

        {/* Category Form Modal */}
        {showCategoryForm && (
          <CategoryForm
            category={currentCategory}
            onSubmit={handleCategoryFormSubmit}
            onCancel={handleCategoryFormCancel}
            isLoading={categoryLoading}
          />
        )}

        {/* Delete Product Confirmation */}
        <ConfirmDialog
          isOpen={showConfirm}
          title="Xác nhận xóa sản phẩm"
          message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirm(false)}
          isDangerous={true}
        />

        {/* Delete Category Confirmation */}
        <ConfirmDialog
          isOpen={showCategoryConfirm}
          title="Xác nhận xóa danh mục"
          message="Bạn có chắc chắn muốn xóa danh mục này? Tất cả sản phẩm trong danh mục sẽ không có danh mục."
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={handleConfirmDeleteCategory}
          onCancel={() => setShowCategoryConfirm(false)}
          isDangerous={true}
        />
      </div>
    </AdminLayout>
  );
};

export default Products;