# Quick Test Guide - Admin Role Integration

## 🚀 Quick Start Testing

### Step 1: Create Admin User (Database)

```javascript
// MongoDB command
db.users.insertOne({
  username: "admin",
  email: "admin@example.com",
  password: "$2a$10/...", // Use bcrypt hashed password
  role: "admin",
  fullName: "Admin User",
  createdAt: new Date()
})
```

Or use your app's register endpoint and manually update role in database.

### Step 2: Test Admin Login

```
1. Go to http://localhost:3000/login
2. Enter admin credentials
3. Click "Đăng nhập"
4. Verify redirected to /shop
5. ✅ Check: Sidebar shows admin menu (Dashboard, Quản lý sản phẩm, Báo cáo)
```

### Step 3: Access Admin Pages

```
1. Click "Quản lý sản phẩm" in sidebar
2. ✅ Verify: Page loads with AdminHeader and AdminSidebar
3. ✅ Verify: Header shows "AquaticPose Admin"
4. ✅ Verify: Header shows admin username
5. ✅ Verify: Sidebar shows admin navigation
```

### Step 4: Test Logout

```
1. Click user dropdown in AdminHeader (top right)
2. Click "Đăng xuất"
3. ✅ Verify: Confirmation dialog appears
4. Click "Đăng xuất" in dialog
5. ✅ Verify: Logged out and redirected to /shop
6. ✅ Verify: Sidebar shows customer menu
```

### Step 5: Test Regular User

```
1. Create regular user with role: "user"
2. Login as regular user
3. ✅ Verify: Sidebar shows customer menu (Cửa hàng, Đơn hàng của tôi)
4. ✅ Verify: NO admin menu items
5. Try to navigate to /admin/products manually
6. ✅ Verify: Redirected to /shop
```

### Step 6: Verify JWT Token

```
1. Login as admin
2. Open DevTools (F12)
3. Go to Application → Cookies
4. Find 'token' cookie
5. Copy the value
6. Go to https://jwt.io
7. Paste token in "Encoded" field
8. ✅ Verify: Payload shows "role": "admin"
9. ✅ Verify: Role is lowercase
```

---

## ✅ Checklist

### Frontend
- [ ] Sidebar shows admin menu for admin users
- [ ] Sidebar shows customer menu for regular users
- [ ] Admin pages have AdminHeader
- [ ] Admin pages have AdminSidebar
- [ ] Non-admin users redirected from /admin/* routes
- [ ] Logout confirmation dialog works
- [ ] User dropdown menu works

### Backend
- [ ] User model has role field
- [ ] Role enum is ['user', 'admin']
- [ ] JWT token includes role
- [ ] Auth middleware normalizes role to lowercase
- [ ] authorizeRoles('admin') middleware works

### Security
- [ ] Non-admin cannot access admin endpoints
- [ ] JWT token is verified
- [ ] Role is checked on every admin request
- [ ] Cookies are secure (httpOnly, signed)

---

## 🔧 Quick Fixes If Issues Occur

### Admin menu doesn't show
```javascript
// Check in browser console
const user = store.getState().auth.user;
console.log(user.role); // Should be "admin"
```

### Can't access admin pages
```javascript
// Check JWT token
// In browser DevTools → Application → Cookies
// Copy token and decode at jwt.io
// Verify role field exists and is "admin"
```

### Role comparison fails
```javascript
// Check for case sensitivity
// Role should always be lowercase
// Backend normalizes: role: (decoded.role || '').toLowerCase()
// Frontend checks: user?.role === 'admin'
```

### Logout doesn't work
```javascript
// Check Redux action
// Verify ConfirmDialog is imported
// Check browser console for errors
```

---

## 📊 Expected Behavior

### Admin User
```
Login → Sidebar shows admin menu → Click menu → Admin page with header/sidebar → Can logout
```

### Regular User
```
Login → Sidebar shows customer menu → Try /admin/* → Redirected to /shop
```

### Unauthenticated
```
Try /admin/* → Redirected to /shop
```

---

## 🎯 Success Criteria

- ✅ Admin users see admin interface immediately after login
- ✅ Admin pages have professional layout
- ✅ Regular users cannot access admin pages
- ✅ Role is correctly passed in JWT
- ✅ Logout works with confirmation
- ✅ No console errors
- ✅ All role checks use lowercase comparison

---

## 📱 Test URLs

```
Customer Pages:
- http://localhost:3000/shop
- http://localhost:3000/orders
- http://localhost:3000/profile

Admin Pages:
- http://localhost:3000/admin/dashboard
- http://localhost:3000/admin/products
- http://localhost:3000/admin/reports

Auth Pages:
- http://localhost:3000/login
- http://localhost:3000/register
```

---

## 🐛 Debug Commands

### Check Redux State
```javascript
// In browser console
store.getState().auth
// Should show user with role: "admin"
```

### Check JWT Token
```javascript
// In browser console
document.cookie
// Find token cookie and copy value
// Paste at jwt.io to decode
```

### Check API Calls
```javascript
// In browser DevTools → Network tab
// Look for /auth/me request
// Check response has user with role
```

### Check Backend Logs
```bash
# Terminal where server is running
# Should see auth middleware logs
# Check role is normalized to lowercase
```

---

## ✨ You're All Set!

All fixes are applied. Just follow the testing steps above to verify everything works correctly.

**Happy testing! 🚀**
