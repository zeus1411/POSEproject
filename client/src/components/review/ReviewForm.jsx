import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createReview, fetchReviews } from "../../redux/slices/reviewSlice";
import { StarIcon } from "@heroicons/react/24/solid";

const ReviewForm = ({ productId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🧠 Nếu chưa đăng nhập → hiển thị lời nhắc
  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-6">
        <p className="text-yellow-700 text-sm">
          Vui lòng <a href="/login" className="font-medium underline">đăng nhập</a> để gửi đánh giá.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (rating === 0) {
      setError("Vui lòng chọn số sao đánh giá.");
      return;
    }

    if (comment.trim().length < 10) {
      setError("Nội dung đánh giá phải có ít nhất 10 ký tự.");
      return;
    }

    setSubmitting(true);

    try {
      await dispatch(createReview({ productId, rating, title, comment })).unwrap();
      setSuccess("Gửi đánh giá thành công!");
      setRating(0);
      setTitle("");
      setComment("");
      // Reload danh sách đánh giá
      dispatch(fetchReviews(productId));
    } catch (err) {
      setError(err || "Không thể gửi đánh giá, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Gửi đánh giá của bạn</h3>

      {/* Rating stars */}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none"
          >
            <StarIcon
              className={`w-6 h-6 ${
                star <= (hover || rating)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Title */}
      <input
        type="text"
        placeholder="Tiêu đề đánh giá (tuỳ chọn)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-2 mb-3 text-sm focus:ring-primary-500 focus:border-primary-500"
      />

      {/* Comment */}
      <textarea
        rows="4"
        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
      ></textarea>

      {/* Message */}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {success && <p className="text-green-600 text-sm mt-2">{success}</p>}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
      >
        {submitting ? "Đang gửi..." : "Gửi đánh giá"}
      </button>
    </form>
  );
};

export default ReviewForm;