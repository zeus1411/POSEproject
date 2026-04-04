import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAdminOrders,
    updateAdminOrderStatus,
    setFilters,
} from "../../redux/slices/adminOrderSlice";
import AdminLayout from "../../components/admin/AdminLayout";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import Pagination from "../../components/common/Pagination";

// Status definitions with Vietnamese labels
const ORDER_STATUSES = [
    { key: "ALL", label: "Tất cả", color: "gray" },
    { key: "PENDING", label: "Chờ xử lý", color: "yellow" },
    { key: "CONFIRMED", label: "Đã xác nhận", color: "blue" },
    { key: "SHIPPING", label: "Đang giao", color: "indigo" },
    { key: "COMPLETED", label: "Hoàn thành", color: "green" },
    { key: "CANCELLED", label: "Đã hủy", color: "red" },
];

// Status transition rules - ✅ Fixed logic
const validTransitions = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["SHIPPING", "CANCELLED"], // ✅ Từ Đã xác nhận → Đang giao (bỏ PROCESSING)
    SHIPPING: ["COMPLETED", "CANCELLED"],
    COMPLETED: [], // ✅ Hoàn thành là trạng thái cuối (bỏ REFUNDED)
    CANCELLED: [],
};

// Vietnamese labels for status options in dropdown
const STATUS_LABELS = {
    PENDING: "Chờ xử lý",
    CONFIRMED: "Đã xác nhận",
    SHIPPING: "Đang giao",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
};

// Status badge colors
const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-purple-100 text-purple-800",
    SHIPPING: "bg-indigo-100 text-indigo-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
};

const AdminOrdersPage = () => {
    const dispatch = useDispatch();
    const { list, loading, error, filters, pagination } = useSelector((state) => state.adminOrders);
    const [confirmingOrder, setConfirmingOrder] = useState(null);
    const [confirmingStatus, setConfirmingStatus] = useState(null);

    useEffect(() => {
        dispatch(fetchAdminOrders(filters));
    }, [dispatch, filters]);

    // Handle status filter change
    const handleStatusChange = (status) => {
        dispatch(setFilters({ status, page: 1 }));
    };

    // Handle page change
    const handlePageChange = (page) => {
        dispatch(setFilters({ page }));
    };

    // Handle order status change with confirmation
    const handleOrderStatusChange = (orderId, currentStatus, newStatus) => {
        setConfirmingOrder(orderId);
        setConfirmingStatus(newStatus);
    };

    // Confirm status change
    const confirmStatusChange = () => {
        if (confirmingOrder && confirmingStatus) {
            dispatch(
                updateAdminOrderStatus({
                    orderId: confirmingOrder,
                    status: confirmingStatus,
                })
            );
            setConfirmingOrder(null);
            setConfirmingStatus(null);
        }
    };

    // Cancel status change
    const cancelStatusChange = () => {
        setConfirmingOrder(null);
        setConfirmingStatus(null);
    };

    // Get next status options
    const getNextStatuses = (currentStatus) => {
        return validTransitions[currentStatus] || [];
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Đơn hàng</h1>
                    <p className="text-gray-600 mt-1">
                        Quản lý và cập nhật trạng thái các đơn hàng
                    </p>
                </div>

                {/* Status Filter Tabs */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {ORDER_STATUSES.map((status) => (
                        <button
                            key={status.key}
                            onClick={() => handleStatusChange(status.key)}
                            className={`px-4 py-2 rounded-full font-medium transition-all ${filters.status === status.key
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-white text-gray-700 border border-gray-300 hover:border-blue-500"
                                }`}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>

                {/* Orders Table */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-gray-600">Đang tải đơn hàng...</div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        Lỗi: {error}
                    </div>
                ) : list.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-600">
                        Không có đơn hàng nào
                    </div>
                ) : (
                    <>
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                            Mã Đơn
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                            Khách hàng
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                            Tổng tiền
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                            Hành động
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {list.map((order) => {
                                    const nextStatuses = getNextStatuses(order.status);
                                    // Kiểm tra xem có phải trạng thái cuối cùng không
                                    const isFinalStatus = nextStatuses.length === 0;

                                    return (
                                        <tr
                                            key={order._id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {order.orderNumber}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {order.userId?.username || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                {order.totalPrice?.toLocaleString("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] ||
                                                        "bg-gray-100 text-gray-800"
                                                        }`}
                                                >
                                                    {STATUS_LABELS[order.status] || order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm space-y-2">
                                                <div className="flex gap-2">
                                                    {/* Status Change Dropdown 
                              - Luôn hiển thị kể cả khi hết trạng thái tiếp theo 
                              - Disabled nếu isFinalStatus = true
                          */}
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) =>
                                                            handleOrderStatusChange(
                                                                order._id,
                                                                order.status,
                                                                e.target.value
                                                            )
                                                        }
                                                        disabled={isFinalStatus}
                                                        className={`w-40 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isFinalStatus
                                                                ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-70"
                                                                : "bg-white hover:border-blue-500"
                                                            }`}
                                                    >
                                                        <option value={order.status}>
                                                            {STATUS_LABELS[order.status] || order.status}
                                                        </option>
                                                        {nextStatuses.map((status) => (
                                                            <option key={status} value={status}>
                                                                {STATUS_LABELS[status] || status}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    {/* View Details Button */}
                                                    <button
                                                        onClick={() =>
                                                            (window.location.href = `/admin/orders/${order._id}`)
                                                        }
                                                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors whitespace-nowrap"
                                                    >
                                                        Xem chi tiết
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="mt-6">
                                <Pagination
                                    currentPage={pagination.page}
                                    totalPages={pagination.pages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                )}

                {/* Confirmation Dialog */}
                {confirmingOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4">
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircleIcon className="w-6 h-6 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Xác nhận cập nhật trạng thái
                                </h3>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Bạn có chắc muốn cập nhật trạng thái đơn hàng sang{" "}
                                <span className="font-semibold text-gray-900">
                                    {STATUS_LABELS[confirmingStatus] || confirmingStatus}
                                </span>{" "}
                                không?
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={cancelStatusChange}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmStatusChange}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminOrdersPage;