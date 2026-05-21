import React, { useState, useEffect } from 'react';
import AdminShell from '../../components/admin/AdminShell';
import { getOrderStatistics } from '../../services/orderService';
import { useTheme } from '../../context/ThemeContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  CalendarIcon,
  ArrowTrendingUpIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const Statistics = () => {
  const { isDark } = useTheme();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchStatistics();
  }, []); // ✅ Chỉ fetch lần đầu khi component mount

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrderStatistics(startDate, endDate);
      setStatistics(data);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải thống kê');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const KPICard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="glass-panel rounded-3xl p-6 border border-water/30 dark:border-white/10 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      <div className="flex items-center justify-between">
        <div className="z-10">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-2 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-semibold">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-2xl z-10 transition-colors" style={{ backgroundColor: `${color}15` }}>
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
      </div>
      {/* Dynamic background glowing accent */}
      <div className="absolute right-0 bottom-0 w-24 h-24 rounded-full filter blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-300" style={{ backgroundColor: color }} />
    </div>
  );

  if (loading) {
    return (
      <AdminShell>
        <div className="min-h-screen bg-transparent p-4 sm:p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-300 font-semibold">Đang tải thống kê...</p>
            </div>
          </div>
        </div>
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell>
        <div className="min-h-screen bg-transparent p-4 sm:p-8 flex items-center justify-center">
          <div className="glass-panel border border-rose-500/20 dark:border-rose-500/30 rounded-3xl p-6 max-w-lg mx-auto text-center shadow-2xl">
            <p className="text-rose-800 dark:text-rose-400 font-bold text-lg mb-4">Lỗi: {error}</p>
            <button
              onClick={fetchStatistics}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:shadow-lg hover:shadow-rose-500/20 text-white font-bold rounded-xl active:scale-95 transition-all text-sm"
            >
              Thử lại
            </button>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="min-h-screen bg-transparent p-4 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">
            Xem thống kê
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2 font-medium">Phân tích dữ liệu bán hàng và hiệu suất kinh doanh</p>
        </div>

        {/* Date Range Filter */}
        <div className="glass-panel rounded-3xl shadow-xl p-6 mb-8 border border-water/30 dark:border-white/10">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                <CalendarIcon className="h-4 w-4 inline mr-2 text-slate-400 dark:text-slate-500" />
                Từ ngày
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-aqua/5 border border-water/30 dark:bg-white/5 dark:border-white/10 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-slate-400 dark:placeholder-slate-500 text-sm font-semibold transition-all cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                <CalendarIcon className="h-4 w-4 inline mr-2 text-slate-400 dark:text-slate-500" />
                Đến ngày
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-aqua/5 border border-water/30 dark:bg-white/5 dark:border-white/10 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-slate-400 dark:placeholder-slate-500 text-sm font-semibold transition-all cursor-pointer"
              />
            </div>
            <button
              onClick={fetchStatistics}
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-water text-white rounded-xl hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all font-bold text-sm h-11"
            >
              Cập nhật
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <KPICard
            icon={ShoppingBagIcon}
            title="Tổng Đơn Hàng"
            value={formatNumber(statistics?.overall?.totalOrders || 0)}
            color="#3b82f6"
          />
          <KPICard
            icon={CurrencyDollarIcon}
            title="Tổng Doanh Thu"
            value={formatCurrency(statistics?.overall?.totalRevenue || 0)}
            color="#10b981"
          />
          <KPICard
            icon={ArrowTrendingUpIcon}
            title="Giá Trị Trung Bình"
            value={formatCurrency(statistics?.overall?.averageOrderValue || 0)}
            color="#f59e0b"
          />
          <KPICard
            icon={UserGroupIcon}
            title="Tổng Khách Hàng"
            value={formatNumber(statistics?.totalCustomers || 0)}
            color="#8b5cf6"
          />
          <KPICard
            icon={ShoppingBagIcon}
            title="Đơn Hàng Đã Giao"
            value={formatNumber(
              statistics?.byStatus?.find((s) => s._id === 'COMPLETED')?.count || 0
            )}
            color="#ec4899"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Revenue Chart */}
          {statistics?.dailyRevenue && statistics.dailyRevenue.length > 0 && (
            <div className="glass-panel rounded-3xl shadow-xl p-6 border border-water/30 dark:border-white/10">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Doanh Thu Theo Ngày</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={statistics.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                  <XAxis dataKey="_id" stroke={isDark ? "#94a3b8" : "#64748b"} tick={{ fontSize: 11, fontWeight: 500 }} />
                  <YAxis stroke={isDark ? "#94a3b8" : "#64748b"} tick={{ fontSize: 11, fontWeight: 500 }} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: isDark ? '#022329' : '#faf6f0', 
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', 
                      borderRadius: '16px', 
                      color: isDark ? '#ffffff' : '#1e293b',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontWeight: 600
                    }} 
                  />
                  <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12, fontWeight: 600 }} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    name="Doanh Thu"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#10b981"
                    name="Số Đơn"
                    yAxisId="right"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Order Status Distribution */}
          {statistics?.byStatus && statistics.byStatus.length > 0 && (
            <div className="glass-panel rounded-3xl shadow-xl p-6 border border-water/30 dark:border-white/10">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Phân Bố Trạng Thái Đơn Hàng</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statistics.byStatus}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={{ fill: isDark ? '#e2e8f0' : '#475569', fontSize: 11, fontWeight: 'bold' }}
                  >
                    {statistics.byStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#022329' : '#faf6f0', 
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', 
                      borderRadius: '16px', 
                      color: isDark ? '#ffffff' : '#1e293b',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontWeight: 600
                    }} 
                  />
                  <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12, fontWeight: 600 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Products */}
        {statistics?.topProducts && statistics.topProducts.length > 0 && (
          <div className="glass-panel rounded-3xl shadow-xl p-6 mb-8 border border-water/30 dark:border-white/10">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Sản Phẩm Bán Chạy Nhất</h2>
            <div className="overflow-x-auto mb-6">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={statistics.topProducts} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                  <XAxis dataKey="productName" angle={-45} textAnchor="end" height={80} stroke={isDark ? "#94a3b8" : "#64748b"} tick={{ fontSize: 10, fontWeight: 500 }} />
                  <YAxis stroke={isDark ? "#94a3b8" : "#64748b"} tick={{ fontSize: 10, fontWeight: 500 }} />
                  <Tooltip 
                    formatter={(value) => formatNumber(value)}
                    contentStyle={{ 
                      backgroundColor: isDark ? '#022329' : '#faf6f0', 
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', 
                      borderRadius: '16px', 
                      color: isDark ? '#ffffff' : '#1e293b',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontWeight: 600
                    }} 
                  />
                  <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12, fontWeight: 600 }} />
                  <Bar dataKey="totalQuantity" fill="#3b82f6" name="Số Lượng Bán" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="totalRevenue" fill="#10b981" name="Doanh Thu" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-water/20 dark:border-white/10">
              <table className="min-w-full divide-y divide-water/10 dark:divide-white/5">
                <thead className="bg-water/10 dark:bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Sản Phẩm
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Số Lượng
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Doanh Thu
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Số Đơn
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-water/10 dark:divide-white/5 bg-transparent">
                  {statistics.topProducts.map((product, index) => (
                    <tr key={index} className="hover:bg-water/5 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 dark:text-slate-200">
                        {product.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {formatNumber(product.totalQuantity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {formatCurrency(product.totalRevenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {formatNumber(product.orderCount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Order Status Details Table */}
        {statistics?.byStatus && statistics.byStatus.length > 0 && (
          <div className="glass-panel rounded-3xl shadow-xl p-6 border border-water/30 dark:border-white/10">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Chi Tiết Trạng Thái Đơn Hàng</h2>
            <div className="overflow-x-auto rounded-2xl border border-water/20 dark:border-white/10">
              <table className="min-w-full divide-y divide-water/10 dark:divide-white/5">
                <thead className="bg-water/10 dark:bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Trạng Thái
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Số Lượng
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Doanh Thu
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Tỷ Lệ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-water/10 dark:divide-white/5 bg-transparent">
                  {statistics.byStatus.map((status, index) => {
                    const total = statistics.byStatus.reduce((sum, s) => sum + s.count, 0);
                    const percentage = ((status.count / total) * 100).toFixed(1);
                    return (
                      <tr key={index} className="hover:bg-water/5 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 dark:text-slate-200">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-bold border"
                            style={{
                              backgroundColor: `${COLORS[index % COLORS.length]}15`,
                              color: COLORS[index % COLORS.length],
                              borderColor: `${COLORS[index % COLORS.length]}30`
                            }}
                          >
                            {status._id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-600 dark:text-slate-300">
                          {formatNumber(status.count)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-600 dark:text-slate-300">
                          {formatCurrency(status.totalRevenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-600 dark:text-slate-300">
                          <div className="flex items-center">
                            <div className="w-32 bg-water/20 dark:bg-white/5 rounded-full h-2 mr-3 border border-water/10">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: COLORS[index % COLORS.length],
                                }}
                              ></div>
                            </div>
                            <span className="text-xs font-bold">{percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
};

export default Statistics;
