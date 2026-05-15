import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createReview, fetchReviews } from "../../redux/slices/reviewSlice";
import { StarIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";

const ReviewForm = ({ productId, orderId, onReviewSubmitted }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // 🧠 Nếu chưa đăng nhập → hiển thị lời nhắc
  if (!user) {
    return (
      <div className="p-4 bg-amber-900/10 border border-amber-700/20 rounded-md mb-6">
        <p className="text-amber-200 text-sm">
          Vui lòng <a href="/login" className="font-medium underline">đăng nhập</a> để gửi đánh giá.
        </p>
      </div>
    );
  }

  // 🎉 Nếu đã gửi đánh giá thành công → hiển thị thông báo cảm ơn
  if (submitted) {
    return (
      <div className="p-4 bg-emerald-900/10 border border-emerald-700/20 rounded-md mb-6">
        <p className="text-emerald-200 text-sm font-medium">
          ✓ Gửi đánh giá thành công! Cảm ơn bạn đã chia sẻ.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
      const reviewData = { productId, rating, comment };
      
      // Add orderId if provided (from order detail page)
      if (orderId) {
        reviewData.orderId = orderId;
      }
      
      await dispatch(createReview(reviewData)).unwrap();
      
      // Show success toast
      toast.success('Gửi đánh giá thành công! Cảm ơn bạn đã chia sẻ.');
      
      // Reload danh sách đánh giá
      dispatch(fetchReviews(productId));
      
      // Call callback if provided
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      
      // If from order detail, redirect back with refresh flag
      if (orderId) {
        setTimeout(() => {
          navigate(`/orders/${orderId}?refresh=${Date.now()}`);
        }, 1000);
      } else {
        // Mark as submitted to hide the form
        setSubmitted(true);
      }
    } catch (err) {
      setError(err || "Không thể gửi đánh giá, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-lg">
      <h3 className="text-base font-semibold text-white mb-3">Gửi đánh giá của bạn</h3>

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
                  : "text-white/20"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Comment */}
      <textarea
        rows="4"
        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
       className="
  w-full
  bg-black/12
  border-2 border-white/40
  text-black
  placeholder-black/60
  rounded-lg
  p-3
  text-sm
  focus:outline-none
  focus:border-white/60
  focus:ring-2
  focus:ring-white/20
"
      ></textarea>

      {/* Message */}
      {error && <p className="text-red-400 text-sm mt-2 font-medium">{error}</p>}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="mt-4 bg-gradient-to-r from-emerald-400 to-cyan-300 text-abyss-800 px-4 py-2 rounded-md font-semibold disabled:opacity-50 hover:shadow-lg transition-all"
      >
        {submitting ? "Đang gửi..." : "Gửi đánh giá"}
      </button>
    </form>
  );
};

export default ReviewForm;