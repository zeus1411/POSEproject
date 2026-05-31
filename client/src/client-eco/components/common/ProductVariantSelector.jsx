import React from 'react';

const ProductVariantSelector = ({ product, selectedVariant, onVariantChange }) => {
  const [selectedOptions, setSelectedOptions] = React.useState({});
  const hasValidVariantConfig = Boolean(
    product?.hasVariants
    && product?.options?.length > 0
    && product?.variants?.some((variant) => variant.isActive)
  );

  React.useEffect(() => {
    if (!hasValidVariantConfig) {
      setSelectedOptions({});
      onVariantChange(null);
      return;
    }

    if (selectedVariant?.isActive && Number(selectedVariant.stock) > 0 && selectedVariant.optionValues) {
      setSelectedOptions(selectedVariant.optionValues);
      return;
    }

    const firstAvailable = product.variants.find((variant) => variant.isActive && Number(variant.stock) > 0);
    if (firstAvailable?.optionValues) {
      setSelectedOptions(firstAvailable.optionValues);
      onVariantChange(firstAvailable);
    } else {
      setSelectedOptions({});
      onVariantChange(null);
    }
  }, [product, hasValidVariantConfig]);

  if (!hasValidVariantConfig) {
    return null;
  }

  const isOptionExists = (optionName, optionValue) => {
    if (Object.keys(selectedOptions).length === 0 || !selectedOptions[optionName]) {
      return product.variants.some((variant) => (
        variant.isActive && (variant.optionValues || {})[optionName] === optionValue
      ));
    }

    const tempSelection = { ...selectedOptions, [optionName]: optionValue };
    return product.variants.some((variant) => {
      if (!variant.isActive) return false;
      const variantOptions = variant.optionValues || {};

      return Object.keys(tempSelection).every(
        (key) => variantOptions[key] === tempSelection[key]
      );
    });
  };

  const isOptionInStock = (optionName, optionValue) => {
    if (Object.keys(selectedOptions).length === 0 || !selectedOptions[optionName]) {
      return product.variants.some((variant) => (
        variant.isActive
        && Number(variant.stock) > 0
        && (variant.optionValues || {})[optionName] === optionValue
      ));
    }

    const tempSelection = { ...selectedOptions, [optionName]: optionValue };
    return product.variants.some((variant) => {
      if (!variant.isActive || Number(variant.stock) <= 0) return false;
      const variantOptions = variant.optionValues || {};

      return Object.keys(tempSelection).every(
        (key) => variantOptions[key] === tempSelection[key]
      );
    });
  };

  const handleOptionSelect = (optionName, optionValue) => {
    if (!isOptionExists(optionName, optionValue) || !isOptionInStock(optionName, optionValue)) return;

    const newSelectedOptions = {
      ...selectedOptions,
      [optionName]: optionValue
    };
    setSelectedOptions(newSelectedOptions);

    const matchingVariant = product.variants.find((variant) => {
      if (!variant.isActive || Number(variant.stock) <= 0) return false;
      const variantOptions = variant.optionValues || {};

      return Object.keys(newSelectedOptions).every(
        (key) => variantOptions[key] === newSelectedOptions[key]
      );
    });

    onVariantChange(matchingVariant || null);
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

              if (!exists) return null;

              return (
                <button
                  key={valueIndex}
                  type="button"
                  disabled={!inStock}
                  onClick={() => handleOptionSelect(option.name, value)}
                  className={`relative px-4 py-2 border rounded-lg font-medium transition-all ${
                    isSelected
                      ? 'border-ocean bg-aqua/25 text-ocean ring-2 ring-aqua/55 dark:border-cyan-300 dark:bg-cyan-900/10 dark:text-cyan-100 dark:ring-cyan-300'
                      : inStock
                      ? 'border-water/70 text-foreground hover:bg-aqua/18 hover:border-ocean/70 dark:border-cyan-700 dark:text-cyan-100 dark:hover:bg-cyan-900/6'
                      : 'border-border bg-gray-100 text-muted-foreground opacity-60 cursor-not-allowed dark:border-gray-600 dark:bg-white/5 dark:text-cyan-200/45'
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
            <span className="font-medium text-nature dark:text-emerald-300">
              Còn {selectedVariant.stock} sản phẩm
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariantSelector;
