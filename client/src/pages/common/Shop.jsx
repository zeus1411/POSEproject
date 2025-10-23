import React from 'react';

const Shop = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Product cards will go here */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
          <h3 className="font-medium text-gray-900">Product Name</h3>
          <p className="text-gray-600">$99.99</p>
        </div>
      </div>
    </div>
  );
};

export default Shop;