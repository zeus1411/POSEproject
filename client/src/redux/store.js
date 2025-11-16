import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import customerReducer from './slices/customerSlice';
import addressReducer from "./slices/addressSlice";
import reviewReducer from "./slices/reviewSlice";
import adminProductReducer from './slices/adminProductSlice';
import adminOrdersReducer from './slices/adminOrderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    categories: categoryReducer,
    cart: cartReducer,
    orders: orderReducer,
    customer: customerReducer,
    address: addressReducer,
    reviews: reviewReducer,
    adminProducts: adminProductReducer,
    adminOrders: adminOrdersReducer,
  },
});

export default store;
