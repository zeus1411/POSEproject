import React from 'react';

const ProductVariantSelector = ({ product, selectedVariant, onVariantChange }) => {
  if (!product?.hasVariants || !product?.options || product.options.length === 0) {
    return null;
  }

  const [selectedOptions, setSelectedOptions] = React.useState({});

  // Initialize selectedOptions from selectedVariant or first available variant
  React.useEffect(() => {
    if (selectedVariant && selectedVariant.optionValues) {
      // ✅ optionValues is plain object, not Map
      setSelectedOptions(selectedVariant.optionValues);
    } else if (product.variants && product.variants.length > 0) {
      // Select first active variant by default
      const firstActive = product.variants.find(v => v.isActive);
      if (firstActive && firstActive.optionValues) {
        setSelectedOptions(firstActive.optionValues);
        onVariantChange(firstActive);
      }
    }
  }, [product, selectedVariant]);

  // Handle option selection
  const handleOptionSelect = (optionName, optionValue) => {
    const newSelectedOptions = {
      ...selectedOptions,
      [optionName]: optionValue
    };
    setSelectedOptions(newSelectedOptions);

    // Find matching variant - must match ALL selected options
    const matchingVariant = product.variants.find(variant => {
      if (!variant.isActive) return false;
      
      const variantOptions = variant.optionValues || {};

      // Check if ALL selected options match this variant
      return Object.keys(newSelectedOptions).every(
        key => variantOptions[key] === newSelectedOptions[key]
      );
    });

    if (matchingVariant) {
      onVariantChange(matchingVariant);
    } else {
      // No exact match, clear selection if needed
      onVariantChange(null);
    }
  };

  // Check if option value exists (has at least one variant with this value)
  const isOptionExists = (optionName, optionValue) => {
    // If this is the first option being selected, just check if any variant has it
    if (Object.keys(selectedOptions).length === 0 || !selectedOptions[optionName]) {
      const variantsWithOption = product.variants.filter(variant => {
        if (!variant.isActive) return false;
        const variantOptions = variant.optionValues || {};
        return variantOptions[optionName] === optionValue;
      });
      
      return variantsWithOption.length > 0;
    }

    // Otherwise, check if there's a variant matching the new selection
    const tempSelection = { ...selectedOptions, [optionName]: optionValue };
    
    const matchingVariants = product.variants.filter(variant => {
      if (!variant.isActive) return false;
      const variantOptions = variant.optionValues || {};

      // Must match all selected options
      return Object.keys(tempSelection).every(
        key => variantOptions[key] === tempSelection[key]
      );
    });
    
    return matchingVariants.length > 0;
  };

  // Check if option value has stock available
  const isOptionInStock = (optionName, optionValue) => {
    // If this is the first option being selected
    if (Object.keys(selectedOptions).length === 0 || !selectedOptions[optionName]) {
      const variantsWithOption = product.variants.filter(variant => {
        if (!variant.isActive) return false;
        const variantOptions = variant.optionValues || {};
        return variantOptions[optionName] === optionValue;
      });
      
      return variantsWithOption.some(v => Number(v.stock) > 0);
    }

    // Otherwise, check if there's a variant with stock matching the new selection
    const tempSelection = { ...selectedOptions, [optionName]: optionValue };
    
    const matchingVariants = product.variants.filter(variant => {
      if (!variant.isActive) return false;
      const variantOptions = variant.optionValues || {};

      return Object.keys(tempSelection).every(
        key => variantOptions[key] === tempSelection[key]
      );
    });
    
    return matchingVariants.some(v => Number(v.stock) > 0);
  };

  return (
    <div className="space-y-4 py-4 border-t border-b border-gray-200">
      {product.options.map((option, index) => (
        <div key={index}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {option.name}
          </label>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value, valueIndex) => {
              const isSelected = selectedOptions[option.name] === value;
              const exists = isOptionExists(option.name, value);
              const inStock = isOptionInStock(option.name, value);
              
              // Don't render if variant doesn't exist at all
              if (!exists) return null;
              
              return (
                <button
                  key={valueIndex}
                  onClick={() => handleOptionSelect(option.name, value)}
                  className={`relative px-4 py-2 border rounded-lg font-medium transition-all ${
                    isSelected
                      ? inStock
                        ? 'border-primary-600 bg-primary-50 text-primary-700 ring-2 ring-primary-600'
                        : 'border-red-400 bg-red-50 text-red-700 ring-2 ring-red-400'
                      : inStock
                      ? 'border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50'
                      : 'border-gray-300 bg-gray-50 text-gray-500 opacity-60 hover:opacity-80'
                  }`}
                >
                  {value}
                  {!inStock && (
                    <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      Hết
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selected Variant Info */}
      {selectedVariant && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {Object.entries(selectedVariant.optionValues || {}).map(([key, value]) => (
                <span key={key} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {key}: {value}
                </span>
              ))}
            </div>
            <span className={`font-medium ${
              selectedVariant.stock > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {selectedVariant.stock > 0 
                ? `Còn ${selectedVariant.stock} sản phẩm` 
                : 'Hết hàng'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariantSelector;
