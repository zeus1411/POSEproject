// import axios from 'axios';

// const API_URL = 'http://localhost:5000/api/products';

// const getProducts = async (query = '') => {
//   const res = await axios.get(`${API_URL}?${query}`);
//   return res.data;
// };

// const getProductById = async (id) => {
//   const res = await axios.get(`${API_URL}/${id}`);
//   return res.data;
// };


// export default { getProducts, getProductById };
import axios from 'axios';

// Đọc URL từ file .env
const API_URL = import.meta.env.VITE_API_URL + '/products';

// Mock data tạm thời (dùng khi backend chưa sẵn sàng)
const mockProducts = [
  {
    _id: '1',
    name: 'Áo Thun POSE',
    price: 199000,
    category: 'Thời trang',
    description: 'Áo thun cotton 100% cao cấp, thiết kế đơn giản, dễ phối đồ.',
    image: 'https://via.placeholder.com/200x200.png?text=POSE+T-Shirt'
  },
  {
    _id: '2',
    name: 'Giày Sneaker POSE',
    price: 899000,
    category: 'Giày dép',
    description: 'Sneaker phong cách trẻ trung, đế cao su chống trượt.',
    image: 'https://via.placeholder.com/200x200.png?text=POSE+Sneaker'
  },
  {
    _id: '3',
    name: 'Túi xách POSE',
    price: 499000,
    category: 'Phụ kiện',
    description: 'Túi xách da PU bền đẹp, nhiều ngăn tiện lợi.',
    image: 'https://via.placeholder.com/200x200.png?text=POSE+Bag'
  }
];

// Hàm gọi API thật (nếu backend sẵn sàng)
const getProducts = async (query = '') => {
  try {
    const res = await axios.get(`${API_URL}?${query}`);
    return res.data;
  } catch (error) {
    console.warn('⚠️ Backend chưa sẵn sàng, đang dùng mock data...');
    return mockProducts;
  }
};

const getProductById = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    console.warn('⚠️ Backend chưa sẵn sàng, đang dùng mock data...');
    return mockProducts.find((p) => p._id === id);
  }
};

export default { getProducts, getProductById };
