// utils/jwt.js
// ============================================
// DEPRECATED: File này đã được merge vào middlewares/auth.js
// Giữ lại file này để tránh breaking changes với code cũ
// TODO: Có thể xóa file này sau khi confirm không còn dependencies
// ============================================

// Re-export from auth middleware for backward compatibility
export { 
    generateToken,
    verifyToken,
    createTokenUser,
    attachCookiesToResponse,
    authenticateUser,
    authorizeRoles as authorizePermissions
} from '../middlewares/auth.js';