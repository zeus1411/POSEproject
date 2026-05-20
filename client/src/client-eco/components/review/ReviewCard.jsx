import React from "react";
import { Star } from "lucide-react";

const ReviewCard = ({ review }) => {
  return (
    <div className="border-b border-white/10 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {review.userId?.avatar && (
            <img
              src={review.userId.avatar}
              alt={review.userId.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <h4 className="font-semibold text-white">
            {review.userId?.username || "Người dùng ẩn danh"}
          </h4>
        </div>

        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-white/25"
              }`}
            />
          ))}
        </div>
      </div>

      <p className="text-white mt-2">{review.comment}</p>
      <p className="text-white/60 text-sm mt-1">
        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
      </p>
    </div>
  );
};

export default ReviewCard;