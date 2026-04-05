import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReviews } from "../../redux/slices/reviewSlice";
import ReviewCard from "./ReviewCard";

const ReviewList = ({ productId }) => {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.reviews);

  useEffect(() => {
    if (productId) {
      dispatch(fetchReviews(productId));
    }
  }, [dispatch, productId]);

  if (loading) {
    return <p className="text-gray-500">Đang tải đánh giá...</p>;
  }

  if (error) {
    return <p className="text-red-500">Lỗi khi tải đánh giá: {error}</p>;
  }

  if (!list || list.length === 0) {
    return <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>;
  }

  return (
    <div className="space-y-3">
      {list.map((review) => (
        <ReviewCard key={review._id} review={review} />
      ))}
    </div>
  );
};

export default ReviewList