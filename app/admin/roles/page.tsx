'use client';

import React from 'react';
import AdminLayout from '../AdminLayout';
import RoleAccessManagement from './RoleAccessManagement';

export default function AdminRolesPage() {
  return (
    <AdminLayout>
      <RoleAccessManagement />
    </AdminLayout>
  );
} 