# Shopping Cart Feature - Implementation Guide

## Overview
Complete shopping cart functionality has been implemented with mini cart in footer, full Redux state management, and seamless integration with the existing POSE project.

## ✅ What's Been Implemented

### Backend (Already Complete)
- ✅ Cart Model (`server/models/Cart.js`) - Full cart schema with methods
- ✅ Cart Controller (`server/controllers/cartController.js`) - All CRUD operations
- ✅ Cart Routes (`server/routes/cartRoutes.js`) - RESTful API endpoints
- ✅ Authentication middleware for protected routes

### Frontend (Newly Added)

#### 1. **Cart Service** (`client/src/services/cartService.js`)
API integration layer for all cart operations:
- `getCart()` - Fetch user's cart
- `addToCart(productId, quantity)` - Add product to cart
- `updateCartItem(productId, quantity)` - Update item quantity
- `removeFromCart(productId)` - Remove item from cart
- `clearCart()` - Clear entire cart
- `validateCart()` - Validate cart before checkout

#### 2. **Cart Redux Slice** (`client/src/redux/slices/cartSlice.js`)
State management with async thunks:
- State: `cart`, `summary`, `loading`, `error`, `successMessage`
- Actions: `fetchCart`, `addToCart`, `updateCartItem`, `removeFromCart`, `clearCart`
- Auto-calculates totals, shipping fees, and item counts

#### 3. **MiniCart Component** (`client/src/components/common/MiniCart.jsx`)
Sliding sidebar cart with:
- Product list with images and prices
- Quantity controls (+/- buttons)
- Remove item functionality
- Real-time subtotal, shipping, and total calculation
- Free shipping indicator (orders ≥ 500,000 VND)
- Checkout button
- Empty cart state with call-to-action

#### 4. **Toast Notifications** (`client/src/components/common/Toast.jsx`)
User feedback system:
- Success messages (green)
- Error messages (red)
- Auto-dismiss after 3-5 seconds
- Slide-in animation

#### 5. **Updated Components**
- **Footer** - Cart icon with badge showing item count, opens mini cart
- **Layout** - Includes Toast component for notifications
- **Shop Page** - Connected add-to-cart functionality
- **ProductDetail Page** - Full add-to-cart with quantity selection
- **Redux Store** - Added cart reducer

## 🚀 Setup Instructions

### 1. Create Environment File
Create `client/.env` file with:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 2. Install Dependencies (if needed)
All dependencies should already be installed. If not:
```bash
cd client
npm install
```

### 3. Start the Application

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run dev
```

## 📋 API Endpoints

All endpoints require authentication (JWT cookie):

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cart` | Get user's cart |
| POST | `/api/v1/cart/items` | Add product to cart |
| PATCH | `/api/v1/cart/items/:productId` | Update item quantity |
| DELETE | `/api/v1/cart/items/:productId` | Remove item from cart |
| DELETE | `/api/v1/cart` | Clear entire cart |
| POST | `/api/v1/cart/validate` | Validate cart before checkout |

## 🎯 Features

### User Flow
1. **Browse Products** - User views products in Shop page
2. **Add to Cart** - Click "Thêm vào giỏ" button on product card or detail page
3. **View Cart** - Click cart icon in footer to open mini cart
4. **Manage Cart** - Adjust quantities, remove items
5. **Checkout** - Click "Thanh toán" button (ready for checkout implementation)

### Key Functionalities
- ✅ Real-time cart updates
- ✅ Stock validation (prevents adding more than available)
- ✅ Price calculation with discounts
- ✅ Shipping fee calculation (free for orders ≥ 500k VND)
- ✅ Persistent cart (saved to database per user)
- ✅ Authentication required
- ✅ Toast notifications for user feedback
- ✅ Responsive design

### Business Logic
- Minimum quantity: 1
- Maximum quantity: Product stock
- Duplicate products: Quantities are combined
- Out of stock products: Filtered from cart display
- Inactive products: Filtered from cart display

## 🎨 UI/UX Features

### Mini Cart
- Slides in from right side
- Click outside to close
- Shows product images, names, prices
- Quantity controls with stock limits
- Real-time total calculation
- Empty state with "Continue Shopping" CTA

### Cart Icon Badge
- Shows total item count
- Red badge with white text
- Displays "99+" for counts over 99
- Only visible when user is logged in

### Toast Notifications
- Success: Green with checkmark icon
- Error: Red with X icon
- Auto-dismiss with manual close option
- Smooth slide-in animation

## 🔧 Technical Details

### State Management
```javascript
// Cart state structure
{
  cart: {
    _id: "cart_id",
    userId: "user_id",
    items: [
      {
        _id: "item_id",
        productId: { /* populated product data */ },
        quantity: 2,
        addedAt: "2024-01-01T00:00:00.000Z"
      }
    ],
    totalItems: 2,
    subtotal: 0
  },
  summary: {
    totalItems: 2,
    subtotal: 500000,
    shippingFee: 0,
    total: 500000
  },
  loading: false,
  error: null,
  successMessage: "Đã thêm sản phẩm vào giỏ hàng"
}
```

### Database Schema
```javascript
// Cart Model
{
  userId: ObjectId (ref: User, unique),
  items: [{
    productId: ObjectId (ref: Product),
    quantity: Number (min: 1),
    addedAt: Date
  }],
  totalItems: Number,
  subtotal: Number,
  timestamps: true
}
```

## 🐛 Error Handling

### Frontend
- User not logged in → Alert + redirect to login
- Product out of stock → Error toast
- Network errors → Error toast
- Invalid quantity → Prevented by UI controls

### Backend
- Product not found → 404 error
- Insufficient stock → 400 error
- Invalid quantity → 400 error
- Unauthorized access → 401 error

## 🔄 Integration Points

### Existing Features
- ✅ Authentication system (JWT cookies)
- ✅ Product management
- ✅ Category system
- ✅ Redux store

### Ready for Integration
- 🔜 Checkout process
- 🔜 Order creation
- 🔜 Payment processing
- 🔜 Wishlist feature

## 📝 Usage Examples

### Add to Cart from Shop Page
```javascript
// Automatically handled by ProductCard component
// User clicks "Thêm vào giỏ" button
// Redux action dispatched: addToCart({ productId, quantity: 1 })
```

### Add to Cart from Product Detail
```javascript
// User selects quantity
// Clicks "Thêm vào giỏ hàng" button
// Redux action: addToCart({ productId, quantity })
// Quantity resets to 1 after successful add
```

### Update Cart Item
```javascript
// User clicks +/- buttons in mini cart
// Redux action: updateCartItem({ productId, quantity })
```

### Remove from Cart
```javascript
// User clicks trash icon in mini cart
// Redux action: removeFromCart(productId)
```

## 🎯 Testing Checklist

- [ ] Login as a user
- [ ] Add product from Shop page
- [ ] Add product from Product Detail page
- [ ] Open mini cart from footer icon
- [ ] Increase/decrease quantity in mini cart
- [ ] Remove item from cart
- [ ] Verify cart persists after page refresh
- [ ] Test with multiple products
- [ ] Test stock limit validation
- [ ] Test free shipping threshold (500k VND)
- [ ] Verify toast notifications appear
- [ ] Test on mobile/tablet devices

## 🚨 Important Notes

1. **Environment Variables**: Make sure to create `client/.env` with the correct API URL
2. **Authentication**: Cart features only work for logged-in users
3. **Stock Validation**: Backend validates stock availability on every operation
4. **Price Calculation**: Uses `salePrice` if available, otherwise `price`
5. **Shipping**: Free for orders ≥ 500,000 VND, otherwise 30,000 VND

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Verify backend is running on port 3000
3. Verify frontend is running on port 5173
4. Check MongoDB connection
5. Ensure user is logged in
6. Verify `.env` file exists in client folder

## 🎉 Success Criteria

✅ Cart icon appears in footer with item count badge
✅ Mini cart opens when clicking cart icon
✅ "Add to Cart" button works on product cards
✅ "Add to Cart" button works on product detail page
✅ Cart data persists across page refreshes
✅ Quantity controls work correctly
✅ Remove item functionality works
✅ Toast notifications appear for success/error
✅ Cart totals calculate correctly
✅ Free shipping indicator shows at 500k VND

---

**Implementation Date**: October 30, 2024
**Status**: ✅ Complete and Ready for Testing
