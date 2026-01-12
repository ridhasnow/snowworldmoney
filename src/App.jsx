import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminGuard from './pages/admin/AdminGuard'
import Dashboard from './pages/admin/Dashboard'
import Transfers from './pages/admin/Transfers'
import Users from './pages/admin/Users'
import Products from './pages/admin/Products'

import UserGuard from './pages/user/UserGuard.jsx'
import UserLayout from './pages/user/UserLayout.jsx'
import Convert from './pages/user/Convert.jsx'
import Profile from './pages/user/Profile.jsx'
import History from './pages/user/History.jsx'

import './styles/App.css'

function App() {
  return (
    <div className="app">
      <Routes>
        {/* الموقع العام */}
        <Route path="/" element={<HomePage />} />

        {/* صفحة دخول الأدمن */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* صفحات الأدمن المحمية - مسارات صريحة */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<Dashboard />} />
        </Route>

        <Route
          path="/admin/transfers"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<Transfers />} />
        </Route>

        <Route
          path="/admin/users"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<Users />} />
        </Route>

        <Route
          path="/admin/products"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<Products />} />
        </Route>

        {/* قسم حساب المستخدم */}
        <Route
          path="/account"
          element={
            <UserGuard>
              <UserLayout />
            </UserGuard>
          }
        >
          <Route index element={<Convert />} />
          <Route path="convert" element={<Convert />} />
          <Route path="profile" element={<Profile />} />
          <Route path="history" element={<History />} />
        </Route>

        {/* أي مسار غير معروف يعود للصفحة الرئيسية */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
