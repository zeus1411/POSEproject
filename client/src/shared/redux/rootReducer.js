import { combineReducers } from '@reduxjs/toolkit';

// E-commerce
import authReducer from '../../client-eco/redux/slices/authSlice';
import productReducer from '../../client-eco/redux/slices/productSlice';
import categoryReducer from '../../client-eco/redux/slices/categorySlice';
import cartReducer from '../../client-eco/redux/slices/cartSlice';
import orderReducer from '../../client-eco/redux/slices/orderSlice';
import customerReducer from '../../client-eco/redux/slices/customerSlice';
import reviewReducer from "../../client-eco/redux/slices/reviewSlice";
import adminProductReducer from '../../client-eco/redux/slices/adminProductSlice';
import adminOrdersReducer from '../../client-eco/redux/slices/adminOrderSlice';
import adminUserReducer from '../../client-eco/redux/slices/adminUserSlice';
import notificationReducer from '../../client-eco/redux/slices/notificationSlice';
import chatReducer from '../../client-eco/redux/slices/chatSlice';
import promotionReducer from '../../client-eco/redux/slices/promotionSlice';

// Blog
import blogCategoryReducer from '../../client-blog/redux/slices/blogCategorySlice';
import blogTagReducer from '../../client-blog/redux/slices/blogTagSlice';
import blogReducer from '../../client-blog/redux/slices/blogSlice';
import commentReducer from '../../client-blog/redux/slices/commentSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  products: productReducer,
  categories: categoryReducer,
  cart: cartReducer,
  orders: orderReducer,
  customer: customerReducer,
  reviews: reviewReducer,
  adminProducts: adminProductReducer,
  adminOrders: adminOrdersReducer,
  adminUsers: adminUserReducer,
  notifications: notificationReducer,
  chat: chatReducer,
  promotions: promotionReducer,

  blogCategories: blogCategoryReducer,
  blogTags: blogTagReducer,
  blog: blogReducer,
  comments: commentReducer
});

export default rootReducer;