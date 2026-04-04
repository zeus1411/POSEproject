import React, { useState } from 'react';
import { FiAlertCircle, FiX, FiPhone } from 'react-icons/fi';
import { toast } from 'react-toastify';

const CANCEL_REASONS = [
  { value: 'NO_NEED', label: 'Tôi không còn nhu cầu nữa' },
  { value: 'LOW_QUALITY', label: 'Chất lượng sản phẩm chưa đáp ứng kỳ vọng của tôi' },
  { value: 'WRONG_DESCRIPTION', label: 'Sản phẩm nhận được chưa đúng với thông tin mô tả' },
  { value: 'DEFECTIVE', label: 'Sản phẩm gặp sự cố kỹ thuật / không hoạt động như mong đợi' },
  { value: 'FOUND_BETTER_PRICE', label: 'Tôi đã tìm được sản phẩm tương tự với mức giá phù hợp hơn' },
  { value: 'ORDER_MISTAKE', label: 'Tôi đã chọn nhầm sản phẩm khi đặt hàng' },
  { value: 'OTHER', label: 'Lý do khác' }
];

// TODO: Cập nhật số Zalo thực tế của shop
const SHOP_ZALO = '0969258024'; // ← Thay bằng số Zalo thật của shop

const CancelOrderDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading, 
  error,
  paymentMethod, // 'COD' or 'VNPAY'
  orderNumber 
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [step, setStep] = useState(1); // 1: Chọn lý do, 2: (VNPay only) Thông báo liên hệ

  const isVNPay = paymentMethod === 'VNPAY';
  const isOther = selectedReason === 'OTHER';

  const handleReasonChange = (value) => {
    setSelectedReason(value);
    if (value !== 'OTHER') {
      setOtherReason('');
    }
  };

  const handleNext = () => {
    if (!selectedReason) {
      toast.warning('Vui lòng chọn lý do hủy đơn hàng');
      return;
    }

    if (isOther && !otherReason.trim()) {
      toast.warning('Vui lòng nhập lý do cụ thể');
      return;
    }

    if (isVNPay) {
      // VNPay: Chuyển sang bước 2 để hiển thị thông tin liên hệ
      setStep(2);
    } else {
      // COD: Hủy trực tiếp
      handleConfirm();
    }
  };

  const handleConfirm = () => {
    const reason = isOther 
      ? otherReason.trim() 
      : CANCEL_REASONS.find(r => r.value === selectedReason)?.label || selectedReason;

    onConfirm(reason);
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedReason('');
      setOtherReason('');
      setStep(1);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <FiAlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {step === 1 ? 'Lý do hủy đơn hàng' : 'Liên hệ để được hỗ trợ'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            // Step 1: Chọn lý do hủy
            <>
              <p className="text-sm text-gray-600 mb-4">
                Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng <span className="font-semibold">{orderNumber}</span>
              </p>

              {/* Danh sách lý do */}
              <div className="space-y-2 mb-4">
                {CANCEL_REASONS.map((reason) => (
                  <label
                    key={reason.value}
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedReason === reason.value
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(e) => handleReasonChange(e.target.value)}
                      disabled={isLoading}
                      className="mt-0.5 mr-3 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{reason.label}</span>
                  </label>
                ))}
              </div>

              {/* Ô nhập lý do khác */}
              {isOther && (
                <div className="mb-4">
                  <textarea
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    disabled={isLoading}
                    placeholder="Vui lòng nhập lý do cụ thể..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-sm"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {otherReason.length}/200 ký tự
                  </p>
                </div>
              )}

              {/* Thông báo cho VNPay */}
              {isVNPay && selectedReason && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Lưu ý:</strong> Đơn hàng của bạn đã được thanh toán qua VNPay. 
                    Sau khi chọn lý do, bạn sẽ cần liên hệ với shop để được hỗ trợ hoàn tiền.
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </>
          ) : (
            // Step 2: Thông báo liên hệ Zalo (chỉ cho VNPay)
            <>
              <div className="mb-6">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full">
                  <FiPhone className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-center text-gray-700 mb-2">
                  <strong>Đơn hàng của bạn đã được thanh toán qua VNPay</strong>
                </p>
                <p className="text-sm text-gray-600 text-center mb-4">
                  Để được hỗ trợ hủy đơn hàng và hoàn tiền, vui lòng liên hệ với shop qua Zalo:
                </p>

                {/* Số Zalo */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-center text-2xl font-bold text-blue-600 mb-2">
                    {SHOP_ZALO}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(SHOP_ZALO);
                      toast.success('Đã sao chép số Zalo!');
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                  >
                    Sao chép số Zalo
                  </button>
                </div>

                {/* Thông tin cần cung cấp */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-yellow-800 mb-2">
                    Thông tin cần cung cấp khi liên hệ:
                  </p>
                  <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                    <li>Mã đơn hàng: <strong>{orderNumber}</strong></li>
                    <li>Lý do hủy: <strong>{isOther ? otherReason : CANCEL_REASONS.find(r => r.value === selectedReason)?.label}</strong></li>
                    <li>Thông tin tài khoản để hoàn tiền</li>
                  </ul>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Thời gian xử lý hoàn tiền: 3-7 ngày làm việc sau khi xác nhận
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex gap-3">
          {step === 1 ? (
            <>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={handleNext}
                disabled={isLoading || !selectedReason}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Đang xử lý...' : isVNPay ? 'Tiếp tục' : 'Xác nhận hủy'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Đã hiểu
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CancelOrderDialog;
