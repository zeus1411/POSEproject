import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminOrders,
  updateAdminOrderStatus,
} from "../../redux/slices/adminOrderSlice";

// ✅ BƯỚC 1: Import AdminLayout
import AdminLayout from "../../components/admin/AdminLayout";

// Logic transitions từ backend (giữ nguyên)
const validTransitions = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
  FAILED: [],
};

// Đổi tên component, ví dụ: AdminOrdersPage
const AdminOrdersPage = () => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.adminOrders);

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  // Hàm xử lý popup (giữ nguyên)
  const handleStatusChange = (e, orderId, currentStatus) => {
    const newStatus = e.target.value;
    const confirmed = window.confirm(
      `Bạn có chắc muốn đổi trạng thái từ "${currentStatus}" sang "${newStatus}" không?`
    );

    if (confirmed) {
      dispatch(updateAdminOrderStatus({ orderId, status: newStatus }));
    } else {
      e.target.value = currentStatus;
    }
  };

  // ✅ BƯỚC 2: Bọc toàn bộ return bằng <AdminLayout>
  return (
    <AdminLayout>
      {/* ✅ BƯỚC 3: Thêm cấu trúc div và header
           giống như Products.jsx 
      */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header (Giống Products.jsx) */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi, cập nhật trạng thái và xem chi tiết các đơn hàng
          </p>
        </div>

        {/* Nội dung trang (code cũ của bạn) */}
        {loading ? (
          <p>Đang tải đơn hàng...</p>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="table-auto w-full">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2">Mã đơn</th>
                  <th className="px-4 py-2">Khách hàng</th>
                  <th className="px-4 py-2">Tổng tiền</th>
                  <th className="px-4 py-2">Trạng thái</th>
                  <th className="px-4 py-2">Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {list.map((order) => {
                  const currentStatus = order.status;
                  const nextOptions = validTransitions[currentStatus] || [];
                  const isDisabled = nextOptions.length === 0;

                  return (
                    <tr key={order._id} className="border-b">
                      <td className="px-4 py-2">{order.orderNumber}</td>
                      <td className="px-4 py-2">{order.userId?.username}</td>
                      <td className="px-4 py-2">
                        {order.totalPrice.toLocaleString()} đ
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={currentStatus}
                          onChange={(e) =>
                            handleStatusChange(e, order._id, currentStatus)
                          }
                          className={`border px-2 py-1 rounded ${
                            isDisabled ? "bg-gray-100 opacity-70" : ""
                          }`}
                          disabled={isDisabled}
                        >
                          <option value={currentStatus} key={currentStatus}>
                            {currentStatus}
                          </option>
                          {nextOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          className="text-indigo-600 underline"
                          onClick={() =>
                            (window.location.href = `/admin/orders/${order._id}`)
                          }
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersPage;