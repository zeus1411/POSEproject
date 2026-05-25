import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext'; // Import hook quản lý theme

const ProductVariantsManager = ({ product, onUpdate }) => {
  const { isDark } = useTheme(); // Khai báo sử dụng state theme
  const [hasVariants, setHasVariants] = useState(product?.hasVariants || false);
  const [options, setOptions] = useState(product?.options || []);
  const [variants, setVariants] = useState(product?.variants || []);

  useEffect(() => {
    if (product) {
      setHasVariants(product.hasVariants || false);
      
      // ✅ Clean options - remove _id, id fields from MongoDB
      const cleanOptions = (product.options || []).map(option => ({
        name: option.name || '',
        values: Array.isArray(option.values) ? [...option.values] : []
      }));
      setOptions(cleanOptions);
      
      // ✅ Convert Map sang Object ngay khi load để có thể edit
      const normalizedVariants = (product.variants || []).map(variant => ({
        ...variant,
        optionValues: variant.optionValues instanceof Map
          ? Object.fromEntries(variant.optionValues)
          : variant.optionValues || {}
      }));
      
      setVariants(normalizedVariants);
    }
  }, [product]);

  // Sync changes immediately with parent
  useEffect(() => {
    const processedVariants = variants.map(variant => {
      const processed = {
        ...variant,
        optionValues: variant.optionValues instanceof Map 
          ? Object.fromEntries(variant.optionValues) 
          : variant.optionValues
      };
      
      // Giữ _id nếu có (để backend update thay vì tạo mới)
      if (variant._id) {
        processed._id = variant._id;
      }
      
      return processed;
    });

    onUpdate({
      hasVariants,
      options: hasVariants ? options : [],
      variants: hasVariants ? processedVariants : []
    });
  }, [hasVariants, options, variants]);

  // Add new option type (e.g., "Kích thước", "Màu sắc")
  const addOption = () => {
    setOptions([...options, { name: '', values: [''] }]);
  };

  // Remove an option type
  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  // Update option name
  const updateOptionName = (index, name) => {
    const newOptions = options.map((opt, idx) => {
      if (idx === index) {
        return { ...opt, name };
      }
      return opt;
    });
    setOptions(newOptions);
  };

  // Add value to an option
  const addOptionValue = (optionIndex) => {
    const newOptions = options.map((opt, idx) => {
      if (idx === optionIndex) {
        return { ...opt, values: [...opt.values, ''] };
      }
      return opt;
    });
    setOptions(newOptions);
  };

  // Remove value from an option
  const removeOptionValue = (optionIndex, valueIndex) => {
    const newOptions = options.map((opt, idx) => {
      if (idx === optionIndex) {
        return {
          ...opt,
          values: opt.values.filter((_, i) => i !== valueIndex)
        };
      }
      return opt;
    });
    setOptions(newOptions);
  };

  // Update option value
  const updateOptionValue = (optionIndex, valueIndex, value) => {
    const newOptions = options.map((opt, idx) => {
      if (idx === optionIndex) {
        const newValues = opt.values.map((val, valIdx) => {
          if (valIdx === valueIndex) {
            return value;
          }
          return val;
        });
        return { ...opt, values: newValues };
      }
      return opt;
    });
    setOptions(newOptions);
  };

  // Add new variant manually
  const addVariant = () => {
    const newVariant = {
      optionValues: {},
      price: product?.price || 0,
      stock: 0,
      isActive: true
    };
    setVariants([...variants, newVariant]);
  };

  // Check if variant with same optionValues exists
  const isVariantDuplicate = (variantIndex) => {
    const currentVariant = variants[variantIndex];
    if (!currentVariant?.optionValues) return false;

  // Sắp xếp các entry để so sánh chuỗi chính xác
    const currentValues = JSON.stringify(
      Object.entries(currentVariant.optionValues).sort()
    );

    return variants.some((v, idx) => {
      if (idx === variantIndex) return false; // Skip self
      if (!v?.optionValues) return false;
      
      const compareValues = JSON.stringify(
        Object.entries(v.optionValues).sort()
      );
      
      return currentValues === compareValues;
    });
  };

  // Update variant option value
  const updateVariantOption = (variantIndex, optionName, value) => {
    const newVariants = [...variants];
    // Deep clone variant để đảm bảo React detect change
    newVariants[variantIndex] = {
      ...newVariants[variantIndex],
      optionValues: {
        ...(newVariants[variantIndex].optionValues || {}),
        [optionName]: value
      }
    };
    setVariants(newVariants);
  };

  // Update variant field
  const updateVariant = (index, field, value) => {
    const newVariants = [...variants];
    // Deep clone để React detect change
    newVariants[index] = {
      ...newVariants[index],
      [field]: value
    };
    setVariants(newVariants);
  };

  // Remove variant
  const removeVariant = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const handleToggleVariants = (enabled) => {
    setHasVariants(enabled);
    if (!enabled) {
      setOptions([]);
      setVariants([]);
    }
  };

  return (
    // Khối bọc ngoài: Chuyển đổi linh hoạt màu nền theo theme
    <div className={`rounded-xl p-2 transition-all duration-300 ${isDark ? 'text-white' : 'text-slate-800'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className={`text-md font-black uppercase tracking-wide ${isDark ? 'text-emerald-400' : 'text-primary'}`}>
            Quản lý Biến thể sản phẩm (Variants)
          </h3>
          <p className={`text-[11px] mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            💡 Thay đổi tự động được lưu khi bạn nhập. Nhớ click "Tạo"/"Cập nhật" ở cuối form để lưu vào database.
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>Kích hoạt variants</span>
          <input
            type="checkbox"
            checked={hasVariants}
            onChange={(e) => handleToggleVariants(e.target.checked)}
            className={`w-5 h-5 rounded focus:ring-2 transition-all ${
              isDark 
                ? 'accent-emerald-500 focus:ring-emerald-500 bg-white/10 border-white/20' 
                : 'accent-primary focus:ring-primary border-water/40'
            }`}
          />
        </label>
      </div>

      {!hasVariants && (
        <p className={`text-sm italic ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
          Bật "Kích hoạt variants" để tạo các biến thể cho sản phẩm (kích thước, màu sắc, khối lượng...)
        </p>
      )}

      {hasVariants && (
        <>
          {/* Options Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>
                1. Định nghĩa các tùy chọn
                {options.length > 0 && (
                  <span className={`ml-2 text-xs font-normal ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>({options.length} loại)</span>
                )}
              </h4>
              <button
                type="button"
                onClick={addOption}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white rounded-xl transition shadow-md active:scale-95 ${
                  isDark ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/20' : 'bg-primary hover:opacity-90 shadow-primary/10'
                }`}
              >
                <Plus size={14} />
                Thêm tùy chọn
              </button>
            </div>

            {options.length === 0 && (
              <div className={`p-4 rounded-xl text-center border ${isDark ? 'bg-white/5 border-white/5 text-gray-400' : 'bg-water/5 border-water/10 text-slate-500'}`}>
                <p className="text-sm">
                  Chưa có tùy chọn nào. Click "Thêm tùy chọn" để bắt đầu.
                </p>
              </div>
            )}

            {options.map((option, optIdx) => (
              <div key={optIdx} className={`mb-4 p-4 rounded-xl border transition-colors duration-200 ${
                isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-water/10'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="text"
                    value={option.name}
                    onChange={(e) => updateOptionName(optIdx, e.target.value)}
                    placeholder="Tên tùy chọn (vd: Kích thước, Màu sắc)"
                    className={`flex-1 px-4 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                      isDark ? 'bg-white/5 border-white/10 text-white focus:bg-white/10' : 'bg-white border-water/30 text-slate-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(optIdx)}
                    className={`p-2 rounded-xl transition ${isDark ? 'text-red-400 hover:bg-white/5' : 'text-red-600 hover:bg-red-50'}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                    Giá trị:
                  </label>
                  {option.values.map((value, valIdx) => (
                    <div key={valIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateOptionValue(optIdx, valIdx, e.target.value)}
                        placeholder="Giá trị (vd: YBG-300, Đỏ)"
                        className={`flex-1 px-4 py-1.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                          isDark ? 'bg-white/5 border-white/10 text-white focus:bg-white/10' : 'bg-white border-water/20 text-slate-800'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => removeOptionValue(optIdx, valIdx)}
                        className={`p-2 rounded-xl transition ${isDark ? 'text-gray-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOptionValue(optIdx)}
                    className={`text-xs font-bold mt-1 transition-colors ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-primary hover:opacity-80'}`}
                  >
                    + Thêm giá trị tùy chọn
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Variants List */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>
                2. Danh sách biến thể (Variants)
                {variants.length > 0 && (
                  <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    ✓ {variants.length} cấu hình mẫu
                  </span>
                )}
              </h4>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 transition shadow-md active:scale-95"
              >
                <Plus size={14} />
                Thêm variant
              </button>
            </div>

            {variants.length === 0 && (
              <div className={`p-4 rounded-xl text-center border ${isDark ? 'bg-white/5 border-white/5 text-gray-400' : 'bg-water/5 border-water/10 text-slate-500'}`}>
                <p className="text-sm">
                  Chưa có dòng variant nào. Click "Thêm variant" để tạo mới cấu hình.
                </p>
              </div>
            )}
              
            {variants.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                {variants.map((variant, idx) => {
                  const isDuplicate = isVariantDuplicate(idx);
                  
                  return (
                    <div 
                      key={idx} 
                      className={`p-4 border rounded-xl transition-all ${
                        isDuplicate 
                          ? 'border-red-400 bg-red-500/5' 
                          : (isDark ? 'border-white/10 bg-white/[0.02]' : 'border-water/20 bg-white shadow-sm')
                      }`}
                    >
                      {isDuplicate && (
                        <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex items-center gap-2 font-medium">
                          <span className="font-bold">⚠️ Trùng cấu hình:</span>
                          <span>Biến thể này đang bị trùng lặp thuộc tính. Vui lòng chọn lại.</span>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                            Thuộc tính kết hợp
                          </label>
                          <div className="space-y-2">
                            {options.map((option, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-2">
                                <label className={`w-28 text-xs font-semibold truncate ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{option.name}:</label>
                                <select
                                  value={variant.optionValues?.[option.name] || ''}
                                  onChange={(e) => updateVariantOption(idx, option.name, e.target.value)}
                                  className={`flex-1 px-3 py-1.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                                    isDark ? 'bg-white/5 border-white/10 text-white focus:bg-white/10' : 'bg-white border-water/30 text-slate-800'
                                  }`}
                                >
                                  <option value="" className={isDark ? 'bg-card text-white' : 'bg-white text-slate-800'}>-- Chọn {option.name} --</option>
                                  {option.values.map((val, valIdx) => (
                                    <option key={valIdx} value={val} className={isDark ? 'bg-card text-white' : 'bg-white text-slate-800'}>{val}</option>
                                  ))}
                                </select>
                              </div>
                            ))}
                            {options.length === 0 && (
                              <p className="text-xs text-gray-500 italic">Chưa định nghĩa tùy chọn ở bước 1</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                            Giá riêng (₫)
                          </label>
                          <input
                            type="number"
                            value={variant.price}
                            onChange={(e) => updateVariant(idx, 'price', parseFloat(e.target.value))}
                            className={`w-full px-3 py-1.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                              isDark ? 'bg-white/5 border-white/10 text-white focus:bg-white/10' : 'bg-white border-water/30 text-slate-800'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                            Tồn kho riêng
                          </label>
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => updateVariant(idx, 'stock', parseInt(e.target.value))}
                            className={`w-full px-3 py-1.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                              isDark ? 'bg-white/5 border-white/10 text-white focus:bg-white/10' : 'bg-white border-water/30 text-slate-800'
                            }`}
                          />
                        </div>

                        <div className="col-span-2 flex items-center justify-between mt-1 pt-2 border-t border-dashed border-water/10 dark:border-white/5">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={variant.isActive}
                              onChange={(e) => updateVariant(idx, 'isActive', e.target.checked)}
                              className={`w-4 h-4 rounded transition-all ${
                                isDark ? 'accent-emerald-500 bg-white/10 border-white/20' : 'accent-primary border-water/40'
                              }`}
                            />
                            <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>Kích hoạt biến thể này</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => removeVariant(idx)}
                            className={`text-xs font-bold flex items-center gap-1 transition-colors ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:opacity-80'}`}
                          >
                            <Trash2 size={14} />
                            Xóa cấu hình
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductVariantsManager;