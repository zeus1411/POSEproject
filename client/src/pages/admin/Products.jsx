// e:/POSE project/client/src/pages/admin/Products.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/admin/AdminLayout';
import ProductTable from '../../components/admin/ProductTable';
import ProductForm from '../../components/admin/ProductForm';
import ProductFilters from '../../components/admin/ProductFilters';
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Plus } from 'lucide-react';
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
import { getCategories } from '../../redux/slices/categorySlice';

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
  const { categories } = useSelector((state) => state.categories);

  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // Load categories on mount
  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  // Load products when filters change
  useEffect(() => {
    dispatch(getAllProductsAdmin(filters));
  }, [dispatch, filters]);

  // Handle success/error messages
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

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
            <p className="text-gray-600 mt-1">Quản lý danh sách sản phẩm, thêm mới, chỉnh sửa hoặc xóa</p>
          </div>
          <button
            onClick={handleAddProduct}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus size={20} />
            Thêm sản phẩm
          </button>
        </div>

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
                  // Calculate page numbers to show (current page in the middle when possible)
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

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showConfirm}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirm(false)}
          isDangerous={true}
        />
      </div>
    </AdminLayout>
  );
};

export default Products;