import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addReview } from "../../redux/slices/reviewSlice";
import { Star } from "lucide-react";

const ReviewForm = ({ productId }) => {
  const dispatch = useDispatch();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) return alert("Vui lòng nhập đầy đủ thông tin!");
    dispatch(addReview({ productId, reviewData: { rating, comment } }));
    setRating(0);
    setComment("");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-xl shadow-sm mt-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Đánh giá sản phẩm</h3>
      <div className="flex gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-6 h-6 cursor-pointer ${
              i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
            onClick={() => setRating(i + 1)}
          />
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Viết đánh giá của bạn..."
        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none"
      />
      <button
        type="submit"
        className="mt-3 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
      >
        Gửi đánh giá
      </button>
    </form>
  );
};

export default ReviewForm;