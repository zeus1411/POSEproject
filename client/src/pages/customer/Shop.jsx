import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice';
import { Link } from 'react-router-dom';

const Shop = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.product);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');

  // Lấy danh sách sản phẩm khi vào trang
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Xử lý tìm kiếm + sắp xếp
  const handleSearch = () => {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (sort) query.append('sort', sort); // sort = "asc" hoặc "desc"
    dispatch(fetchProducts(query.toString()));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Cửa hàng Thủy Sinh
      </h1>

      {/* Thanh tìm kiếm và lọc */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Tìm sản phẩm (ví dụ: cây thủy sinh, đá, đèn, lọc...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-1/2 sm:w-1/3"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">-- Sắp xếp theo giá --</option>
          <option value="asc">Giá thấp đến cao</option>
          <option value="desc">Giá cao đến thấp</option>
        </select>
        <button
          onClick={handleSearch}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Tìm kiếm
        </button>
      </div>

      {/* Danh sách sản phẩm */}
      {loading ? (
        <div className="text-center text-gray-600 py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      ) : products.length === 0 ? (
        <p className="text-gray-500 italic">Không tìm thấy sản phẩm nào phù hợp.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <Link
              key={p._id}
              to={`/product/${p._id}`}
              className="border bg-white p-4 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="font-semibold text-lg mb-2 text-gray-800 line-clamp-2">
                {p.name}
              </h3>
              <p className="text-green-700 font-medium">{p.price.toLocaleString()}₫</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
