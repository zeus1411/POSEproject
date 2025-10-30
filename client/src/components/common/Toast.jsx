import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { clearCartSuccess, clearCartError } from '../../redux/slices/cartSlice';

const Toast = () => {
  const dispatch = useDispatch();
  const { successMessage, error } = useSelector((state) => state.cart);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearCartSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearCartError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  if (!successMessage && !error) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      {successMessage && (
        <div className="bg-white rounded-lg shadow-lg border border-green-200 p-4 flex items-start gap-3 animate-slide-in">
          <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Thành công</p>
            <p className="text-sm text-gray-600 mt-1">{successMessage}</p>
          </div>
          <button
            onClick={() => dispatch(clearCartSuccess())}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-white rounded-lg shadow-lg border border-red-200 p-4 flex items-start gap-3 animate-slide-in">
          <XCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Lỗi</p>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
          </div>
          <button
            onClick={() => dispatch(clearCartError())}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Toast;
