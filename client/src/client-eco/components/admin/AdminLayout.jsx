import React from 'react';
import AdminShell from './AdminShell';

const AdminLayout = ({ children }) => {
  return <AdminShell>{children}</AdminShell>;
};

export default AdminLayout;
