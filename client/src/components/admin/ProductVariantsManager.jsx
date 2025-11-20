import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';

const ProductVariantsManager = ({ product, onUpdate }) => {
  const [hasVariants, setHasVariants] = useState(product?.hasVariants || false);
  const [options, setOptions] = useState(product?.options || []);
  const [variants, setVariants] = useState(product?.variants || []);

  useEffect(() => {
    if (product) {
      setHasVariants(product.hasVariants || false);
      setOptions(product.options || []);
      setVariants(product.variants || []);
    }
  }, [product]);

  // Sync changes immediately with parent
  useEffect(() => {
    const processedVariants = variants.map(variant => ({
      ...variant,
      optionValues: variant.optionValues instanceof Map 
        ? Object.fromEntries(variant.optionValues) 
        : variant.optionValues
    }));

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
    const newOptions = [...options];
    newOptions[index].name = name;
    setOptions(newOptions);
  };

  // Add value to an option
  const addOptionValue = (optionIndex) => {
    const newOptions = [...options];
    newOptions[optionIndex].values.push('');
    setOptions(newOptions);
  };

  // Remove value from an option
  const removeOptionValue = (optionIndex, valueIndex) => {
    const newOptions = [...options];
    newOptions[optionIndex].values = newOptions[optionIndex].values.filter(
      (_, i) => i !== valueIndex
    );
    setOptions(newOptions);
  };

  // Update option value
  const updateOptionValue = (optionIndex, valueIndex, value) => {
    const newOptions = [...options];
    newOptions[optionIndex].values[valueIndex] = value;
    setOptions(newOptions);
  };

  // Add new variant manually
  const addVariant = () => {
    const newVariant = {
      optionValues: {},
      price: product.price || 0,
      stock: 0,
      isActive: true
    };
    setVariants([...variants, newVariant]);
  };

  // Update variant option value
  const updateVariantOption = (variantIndex, optionName, value) => {
    const newVariants = [...variants];
    if (!newVariants[variantIndex].optionValues) {
      newVariants[variantIndex].optionValues = {};
    }
    newVariants[variantIndex].optionValues[optionName] = value;
    setVariants(newVariants);
  };

  // Update variant field
  const updateVariant = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Quản lý Biến thể sản phẩm (Variants)
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            💡 Thay đổi tự động được lưu khi bạn nhập. Nhớ click "Tạo"/"Cập nhật" ở cuối form để lưu vào database.
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm text-gray-600">Kích hoạt variants</span>
          <input
            type="checkbox"
            checked={hasVariants}
            onChange={(e) => handleToggleVariants(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
        </label>
      </div>

      {!hasVariants && (
        <p className="text-sm text-gray-500 italic">
          Bật "Kích hoạt variants" để tạo các biến thể cho sản phẩm (kích thước, màu sắc, loại...)
        </p>
      )}

      {hasVariants && (
        <>
          {/* Options Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-800">
                1. Định nghĩa các tùy chọn
                {options.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500">({options.length} loại)</span>
                )}
              </h4>
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={16} />
                Thêm tùy chọn
              </button>
            </div>

            {options.length === 0 && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-sm text-gray-600">
                  Chưa có tùy chọn nào. Click "Thêm tùy chọn" để bắt đầu.
                </p>
              </div>
            )}

            {options.map((option, optIdx) => (
              <div key={optIdx} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="text"
                    value={option.name}
                    onChange={(e) => updateOptionName(optIdx, e.target.value)}
                    placeholder="Tên tùy chọn (vd: Kích thước, Màu sắc)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(optIdx)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Giá trị:
                  </label>
                  {option.values.map((value, valIdx) => (
                    <div key={valIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateOptionValue(optIdx, valIdx, e.target.value)}
                        placeholder="Giá trị (vd: YBG-300, Đỏ)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeOptionValue(optIdx, valIdx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOptionValue(optIdx)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Thêm giá trị
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Variants List */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-800">
                2. Danh sách Variants
                {variants.length > 0 && (
                  <span className="ml-2 text-sm text-green-600 font-semibold">
                    ✓ {variants.length} variant(s)
                  </span>
                )}
              </h4>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Plus size={16} />
                Thêm variant
              </button>
            </div>

            {variants.length === 0 && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-sm text-gray-600">
                  Chưa có variant nào. Click "Thêm variant" để tạo mới.
                </p>
              </div>
            )}
              
            {variants.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {variants.map((variant, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-white">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tùy chọn
                        </label>
                        <div className="space-y-2">
                          {options.map((option, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <label className="w-32 text-sm text-gray-600">{option.name}:</label>
                              <select
                                value={variant.optionValues?.[option.name] || ''}
                                onChange={(e) => updateVariantOption(idx, option.name, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">-- Chọn {option.name} --</option>
                                {option.values.map((val, valIdx) => (
                                  <option key={valIdx} value={val}>{val}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                          {options.length === 0 && (
                            <p className="text-xs text-gray-500">Chưa định nghĩa tùy chọn</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Giá (VNĐ)
                        </label>
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) => updateVariant(idx, 'price', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tồn kho
                        </label>
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(idx, 'stock', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="col-span-2 flex items-center justify-between">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={variant.isActive}
                            onChange={(e) => updateVariant(idx, 'isActive', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Kích hoạt</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          <Trash2 size={16} className="inline mr-1" />
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductVariantsManager;
