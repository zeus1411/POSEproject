import React from "react";
import { Star } from "lucide-react";

const ReviewCard = ({ review }) => {
  return (
    <div className="border-b py-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800">{review.user?.name || "Người dùng ẩn danh"}</h4>
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-gray-700 mt-2">{review.comment}</p>
      <p className="text-gray-400 text-sm mt-1">
        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
      </p>
    </div>
  );
};

export default ReviewCard;