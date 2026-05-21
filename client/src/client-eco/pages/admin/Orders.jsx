import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAdminOrders,
    updateAdminOrderStatus,
    setFilters,
} from "../../redux/slices/adminOrderSlice";
import AdminLayout from "../../components/admin/AdminLayout";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Pagination from "../../components/common/Pagination";
import { useTheme } from "../../context/ThemeContext";

// Status definitions with Vietnamese labels
const ORDER_STATUSES = [
    { key: "ALL", label: "Tất cả", color: "gray" },
    { key: "PENDING", label: "Chờ xử lý", color: "yellow" },
    { key: "CONFIRMED", label: "Đã xác nhận", color: "blue" },
    { key: "SHIPPING", label: "Đang giao", color: "indigo" },
    { key: "COMPLETED", label: "Hoàn thành", color: "green" },
    { key: "CANCELLED", label: "Đã hủy", color: "red" },
];

// Status transition rules
const validTransitions = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["SHIPPING", "CANCELLED"],
    SHIPPING: ["COMPLETED", "CANCELLED"],
    COMPLETED: [],
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
    PENDING: "bg-yellow-100/80 text-yellow-800 border border-yellow-200/50 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-900/30",
    CONFIRMED: "bg-blue-100/80 text-blue-800 border border-blue-200/50 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/30",
    PROCESSING: "bg-purple-100/80 text-purple-800 border border-purple-200/50 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/30",
    SHIPPING: "bg-indigo-100/80 text-indigo-800 border border-indigo-200/50 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/30",
    COMPLETED: "bg-green-100/80 text-green-800 border border-green-200/50 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/30",
    CANCELLED: "bg-red-100/80 text-red-800 border border-red-200/50 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/30",
};

const AdminOrdersPage = () => {
    const dispatch = useDispatch();
    const { isDark } = useTheme();
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
            <div className="admin-orders-page min-h-screen bg-transparent p-4 sm:p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">
                        Quản lý đơn hàng
                    </h1>
                </div>

                {/* Status Filter Tabs */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {ORDER_STATUSES.map((status) => {
                        const isActive = (filters.status || "ALL") === status.key;
                        return (
                            <button
                                key={status.key}
                                onClick={() => handleStatusChange(status.key)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                    isActive
                                        ? "bg-gradient-to-r from-primary to-water text-white shadow-md shadow-primary/20 scale-105"
                                        : "glass-card text-slate-700 dark:text-slate-200 border border-water/30 dark:border-white/10 hover:bg-water/10 dark:hover:bg-white/5"
                                }`}
                            >
                                {status.label}
                            </button>
                        );
                    })}
                </div>

                {/* Orders Table */}
                {loading ? (
                    <div className="flex justify-center items-center py-24">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50/80 dark:bg-red-950/20 border-l-4 border-red-500 p-4 rounded-r-xl max-w-7xl mx-auto my-8 font-semibold text-red-700 dark:text-red-400">
                        Lỗi: {error}
                    </div>
                ) : list.length === 0 ? (
                    <div className="glass-panel border border-water/30 dark:border-white/10 rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400 font-bold shadow-xl">
                        Không có đơn hàng nào
                    </div>
                ) : (
                    <>
                        <div className="glass-panel rounded-3xl shadow-xl overflow-hidden border border-water/30 dark:border-white/10">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-water/10 dark:bg-white/5 border-b border-water/20 dark:border-white/10">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Mã Đơn
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Khách hàng
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Tổng tiền
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Trạng thái
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Hành động
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-water/10 dark:divide-white/5">
                                        {list.map((order) => {
                                            const nextStatuses = getNextStatuses(order.status);
                                            // Kiểm tra xem có phải trạng thái cuối cùng không
                                            const isFinalStatus = nextStatuses.length === 0;

                                            return (
                                                <tr
                                                    key={order._id}
                                                    className="hover:bg-water/5 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">
                                                        {order.orderNumber}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                                        {order.userId?.username || "N/A"}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-black text-slate-800 dark:text-white">
                                                        {order.totalPrice?.toLocaleString("vi-VN", {
                                                            style: "currency",
                                                            currency: "VND",
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <span
                                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm border ${
                                                                statusColors[order.status] || "bg-gray-100/80 text-gray-800 border-gray-200/50"
                                                            }`}
                                                        >
                                                            {STATUS_LABELS[order.status] || order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-right">
                                                        <div className="flex items-center justify-end gap-3">
                                                            {/* Status Change Dropdown */}
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
                                                                className={`px-3 py-2 bg-aqua/5 border border-water/30 dark:bg-white/5 dark:border-white/10 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-xs font-bold transition-all cursor-pointer ${
                                                                    isFinalStatus
                                                                        ? "opacity-50 cursor-not-allowed"
                                                                        : "hover:scale-[1.02]"
                                                                }`}
                                                            >
                                                                <option value={order.status} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                                                    {STATUS_LABELS[order.status] || order.status}
                                                                </option>
                                                                {nextStatuses.map((status) => (
                                                                    <option key={status} value={status} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                                                        {STATUS_LABELS[status] || status}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            {/* View Details Button */}
                                                            <button
                                                                onClick={() =>
                                                                    (window.location.href = `/admin/orders/${order._id}`)
                                                                }
                                                                className="px-4 py-2 bg-gradient-to-r from-primary to-water text-white rounded-xl hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all text-xs font-bold whitespace-nowrap"
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
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="mt-6 flex justify-end">
                                <Pagination
                                    currentPage={pagination.page}
                                    totalPages={pagination.pages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                )}

                {/* Elevated Confirmation Dialog */}
                {confirmingOrder && (
                    <ConfirmDialog
                        isOpen={!!confirmingOrder}
                        title="Xác nhận cập nhật trạng thái"
                        message={`Bạn có chắc muốn cập nhật trạng thái đơn hàng sang ${STATUS_LABELS[confirmingStatus] || confirmingStatus} không?`}
                        confirmText="Xác nhận"
                        cancelText="Hủy"
                        onConfirm={confirmStatusChange}
                        onCancel={cancelStatusChange}
                    />
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminOrdersPage;
