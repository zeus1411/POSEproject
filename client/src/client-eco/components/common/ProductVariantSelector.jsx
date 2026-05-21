import React from 'react';

const ProductVariantSelector = ({ product, selectedVariant, onVariantChange }) => {
  if (!product?.hasVariants || !product?.options || product.options.length === 0) {
    return null;
  }

  const [selectedOptions, setSelectedOptions] = React.useState({});

  // Initialize selectedOptions from selectedVariant or first available variant
  // React.useEffect(() => {
  //   if (selectedVariant && selectedVariant.optionValues) {
  //     // ✅ optionValues is plain object, not Map
  //     setSelectedOptions(selectedVariant.optionValues);
  //   } else if (product.variants && product.variants.length > 0) {
  //     // Select first active variant by default
  //     const firstActive = product.variants.find(v => v.isActive);
  //     if (firstActive && firstActive.optionValues) {
  //       setSelectedOptions(firstActive.optionValues);
  //       onVariantChange(firstActive);
  //     }
  //   }
  // }, [product, selectedVariant]);
  
  React.useEffect(() => {
  if (selectedVariant && selectedVariant.optionValues) {
    setSelectedOptions(selectedVariant.optionValues);
  } else if (product.variants && product.variants.length > 0) {
    // Select first ACTIVE variant that has stock > 0
    const firstAvailable = product.variants.find(v => v.isActive && Number(v.stock) > 0);
    if (firstAvailable && firstAvailable.optionValues) {
      setSelectedOptions(firstAvailable.optionValues);
      onVariantChange(firstAvailable);
    } else {
      // No available variant, clear selection
      setSelectedOptions({});
      onVariantChange(null);
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
    <div className="space-y-4 py-4 border-t border-b border-water/45 dark:border-cyan-800/20">
      {product.options.map((option, index) => (
        <div key={index}>
          <label className="block text-sm font-medium text-ocean mb-2 dark:text-cyan-200">
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
                        ? 'border-ocean bg-aqua/25 text-ocean ring-2 ring-aqua/55 dark:border-cyan-300 dark:bg-cyan-900/10 dark:text-cyan-100 dark:ring-cyan-300'
                        : 'border-red-400 bg-red-900/10 text-red-200 ring-2 ring-red-400'
                      : inStock
                      ? 'border-water/70 text-foreground hover:bg-aqua/18 hover:border-ocean/70 dark:border-cyan-700 dark:text-cyan-100 dark:hover:bg-cyan-900/6'
                      : 'border-border bg-transparent text-muted-foreground opacity-70 dark:border-gray-600 dark:text-cyan-200/60'
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
        <div className="mt-4 p-3 bg-aqua/15 backdrop-blur-md border border-water/45 rounded-lg text-foreground dark:bg-white/5 dark:border-cyan-300/20 dark:text-cyan-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {Object.entries(selectedVariant.optionValues || {}).map(([key, value]) => (
                <span key={key} className="px-2 py-1 bg-aqua/25 text-ocean rounded-full text-xs font-medium dark:bg-cyan-900/10 dark:text-cyan-100">
                  {key}: {value}
                </span>
              ))}
            </div>
            <span className={`font-medium ${
              selectedVariant.stock > 0 ? 'text-nature dark:text-emerald-300' : 'text-red-600 dark:text-red-400'
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
