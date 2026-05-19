import { StatusCodes } from 'http-status-codes';
import blogInteractionService from '../services/blogInteractionService.js';

/**
 * Blog Interaction Controller
 * Handlers for Like and Bookmark toggles
 */

// @desc    Toggle Like on a blog post
// @route   POST /api/v1/blog-interactions/like/:blogId
// @access  Private
export const toggleLike = async (req, res, next) => {
    try {
        const { blogId } = req.params;
        const userId = req.user.userId;

        const result = await blogInteractionService.toggleInteraction(userId, blogId, 'LIKE');
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle Bookmark on a blog post
// @route   POST /api/v1/blog-interactions/bookmark/:blogId
// @access  Private
export const toggleBookmark = async (req, res, next) => {
    try {
        const { blogId } = req.params;
        const userId = req.user.userId;

        const result = await blogInteractionService.toggleInteraction(userId, blogId, 'BOOKMARK');
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's interaction status for specific blogs
// @route   POST /api/v1/blog-interactions/status
// @access  Private
export const getMyInteractions = async (req, res, next) => {
    try {
        const { blogIds } = req.body;

        // 1. Kiểm tra định dạng mảng như cũ
        if (!Array.isArray(blogIds)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'blogIds must be an array' });
        }

        // 2. 🔥 SỬA DÒNG NÀY: Dùng toán tử ?. để không bị văng lỗi crash khi req.user bị undefined
        const userId = req.user?.userId;

        // 3. 🔥 XỬ LÝ CHO KHÁCH VÃNG LAI: Nếu không có userId (chưa đăng nhập)
        if (!userId) {
            const statuses = {};
            // Duyệt qua mảng ID bài viết và gán toàn bộ trạng thái mặc định bằng false
            blogIds.forEach(id => {
                statuses[id] = { isLiked: false, isBookmarked: false };
            });

            // Trả về kết quả 200 OK ngay lập tức, không cho chạy xuống tầng service gây lỗi
            return res.status(StatusCodes.OK).json({ success: true, statuses });
        }

        // 4. XỬ LÝ CHO USER ĐÃ ĐĂNG NHẬP: Gọi tầng Service quét database như cũ
        const statuses = await blogInteractionService.getUserInteractions(userId, blogIds);
        res.status(StatusCodes.OK).json({ success: true, statuses });

    } catch (error) {
        next(error);
    }
};

export const getMyBookmarks = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const result = await blogInteractionService.getMyBookmarks(userId, req.query);
        res.status(StatusCodes.OK).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};