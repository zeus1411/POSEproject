import React from 'react';
import AdminShell from '../../components/admin/AdminShell';

const Reports = () => {
  return (
    <AdminShell>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Báo cáo bán hàng</h1>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Phân tích dữ liệu
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Xem và phân tích dữ liệu bán hàng
            </p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
};

export default Reports;