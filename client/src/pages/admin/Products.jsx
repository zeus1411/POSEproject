// e:/POSE project/client/src/pages/admin/Products.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/admin/AdminLayout';
import ProductTable from '../../components/admin/ProductTable';
import ProductForm from '../../components/admin/ProductForm';
import ProductFilters from '../../components/admin/ProductFilters';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { Plus } from 'lucide-react';
import {
  getAllProductsAdmin,
  getProductByIdAdmin,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  reset,
  setFilters,
  clearFilters,
  clearCurrentProduct
} from '../../redux/slices/adminProductSlice';
import { getCategories } from '../../redux/slices/categorySlice';

const Products = () => {
  const dispatch = useDispatch();
  const { products, currentProduct, isLoading, isSuccess, isError, message, filters } = useSelector(
    (state) => state.adminProducts
  );
  const { categories } = useSelector((state) => state.categories);

  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // Load products and categories on mount
  useEffect(() => {
    dispatch(getAllProductsAdmin(filters));
    dispatch(getCategories());
  }, [dispatch]);

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
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    dispatch(setFilters(newFilters));
    dispatch(getAllProductsAdmin(newFilters));
  };

  const handleSearch = (searchTerm) => {
    const newFilters = { ...filters, search: searchTerm, page: 1 };
    dispatch(setFilters(newFilters));
    dispatch(getAllProductsAdmin(newFilters));
  };

  const handleResetFilters = () => {
    dispatch(clearFilters());
    dispatch(getAllProductsAdmin({}));
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ProductTable
            products={products}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onView={handleViewProduct}
            isLoading={isLoading}
          />
        </div>

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