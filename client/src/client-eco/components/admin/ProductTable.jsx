import React from 'react';
import { Edit2, Trash2, Eye, Check, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ProductTable = ({ products, onEdit, onDelete, onToggleStatus, isLoading }) => {
  const { isDark } = useTheme();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400 text-lg">Không có sản phẩm nào</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-water/10 dark:bg-white/5 border-b border-water/20 dark:border-white/10">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800 dark:text-slate-200">Tên sản phẩm</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800 dark:text-slate-200">SKU</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800 dark:text-slate-200">Giá</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800 dark:text-slate-200">Tồn kho</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800 dark:text-slate-200">Trạng thái</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800 dark:text-slate-200">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-water/10 dark:divide-white/5">
          {products.map((product) => (
            <tr key={product._id} className="hover:bg-water/5 dark:hover:bg-white/5 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {product.images && product.images.length > 0 && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover border border-water/20 dark:border-white/10"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{product.name}</p>
                    {product.categoryId?.name && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">{product.categoryId.name}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-mono">{product.sku}</td>
              <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      totalStock > 0
                        ? 'bg-green-100/80 dark:bg-green-950/50 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/30'
                        : 'bg-red-100/80 dark:bg-red-950/50 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/30'
                    }`}>
                      {totalStock}
                    </span>
                  );
                })()}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  product.status === 'ACTIVE'
                    ? 'bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/30'
                    : 'bg-slate-100/80 dark:bg-slate-800/50 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700/30'
                }`}>
                  {product.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleStatus && onToggleStatus(product._id, product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                    className={`p-2 rounded-full transition-colors ${
                      product.status === 'ACTIVE' 
                        ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40' 
                        : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                    title={product.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                  >
                    {product.status === 'ACTIVE' ? 
                      <Check size={18} /> : 
                      <X size={18} />
                    }
                  </button>
                  <button
                    onClick={() => onEdit(product._id)}
                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(product._id)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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

