import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import productService from '../../services/productService';
import { useDispatch } from 'react-redux';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mr-3"></div>
        Đang tải chi tiết sản phẩm...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center mt-10 text-gray-500">
        Không tìm thấy sản phẩm này.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-8 flex flex-col md:flex-row gap-8">
        <img
          src={product.image}
          alt={product.name}
          className="w-full md:w-1/2 h-80 object-cover rounded-lg"
        />

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">{product.name}</h1>
          <p className="text-green-700 text-2xl font-semibold mb-4">
            {product.price.toLocaleString()}₫
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            {product.description || 'Sản phẩm này chưa có mô tả chi tiết.'}
          </p>

          <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
            Thêm vào giỏ hàng
          </button>

          <div className="mt-6">
            <Link
              to="/shop"
              className="text-blue-600 hover:underline"
            >
              ← Quay lại cửa hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
