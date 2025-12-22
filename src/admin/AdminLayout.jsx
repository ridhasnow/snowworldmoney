import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../firebase'
import '../../styles/Admin.css'

export default function AdminLayout() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/admin', { replace: true })
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">لوحة التحكم</div>
        <nav className="admin-nav">
          <NavLink to="/admin/dashboard" className="admin-link">إعدادات الأدمن</NavLink>
          <NavLink to="/admin/transfers" className="admin-link">طلبات التحويلات</NavLink>
          <NavLink to="/admin/users" className="admin-link">المستخدمون</NavLink>
          <NavLink to="/admin/products" className="admin-link">المنتجات</NavLink>
        </nav>
        <button className="admin-logout" onClick={handleLogout}>تسجيل الخروج</button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
