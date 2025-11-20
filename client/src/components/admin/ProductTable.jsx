import React from 'react';
import { Edit2, Trash2, Eye, Check, X } from 'lucide-react';

const ProductTable = ({ products, onEdit, onDelete, onToggleStatus, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Không có sản phẩm nào</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tên sản phẩm</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">SKU</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Giá</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tồn kho</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {products.map((product) => (
            <tr key={product._id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {product.images && product.images.length > 0 && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    {product.categoryId?.name && (
                      <p className="text-sm text-gray-500">{product.categoryId.name}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{product.sku}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {(() => {
                  if (product.hasVariants && product.variants && product.variants.length > 0) {
                    const activePrices = product.variants
                      .filter(v => v.isActive)
                      .map(v => v.price);
                    
                    if (activePrices.length === 0) {
                      return '0 ₫';
                    }
                    
                    const minPrice = Math.min(...activePrices);
                    const maxPrice = Math.max(...activePrices);
                    
                    if (minPrice === maxPrice) {
                      return `${minPrice.toLocaleString('vi-VN')} ₫`;
                    }
                    
                    return `${minPrice.toLocaleString('vi-VN')} - ${maxPrice.toLocaleString('vi-VN')} ₫`;
                  }
                  
                  return `${product.price?.toLocaleString('vi-VN')} ₫`;
                })()}
              </td>
              <td className="px-6 py-4">
                {(() => {
                  let totalStock = product.stock || 0;
                  
                  // Nếu sản phẩm có variants, tính tổng stock từ các variants active
                  if (product.hasVariants && product.variants && product.variants.length > 0) {
                    totalStock = product.variants
                      .filter(v => v.isActive)
                      .reduce((sum, variant) => sum + (variant.stock || 0), 0);
                  }
                  
                  return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      totalStock > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {totalStock}
                    </span>
                  );
                })()}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product.status === 'ACTIVE'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleStatus && onToggleStatus(product._id, product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                    className={`p-2 rounded-full transition ${
                      product.status === 'ACTIVE' 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                    title={product.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                  >
                    {product.status === 'ACTIVE' ? 
                      <Check size={18} className="text-green-600" /> : 
                      <X size={18} className="text-gray-400" />
                    }
                  </button>
                  <button
                    onClick={() => onEdit(product._id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(product._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    title="Xóa"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
