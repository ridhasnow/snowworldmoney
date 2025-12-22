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
import './styles/App.css'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* صفحة دخول الأدمن */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* مسارات الأدمن المحمية */}
        <Route
          path="/admin/*"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transfers" element={<Transfers />} />
          <Route path="users" element={<Users />} />
          <Route path="products" element={<Products />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
