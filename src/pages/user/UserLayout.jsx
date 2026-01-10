import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { auth, db } from '../../firebase'
import { doc, getDoc } from 'firebase/firestore'
import '../../styles/User.css'

export default function UserLayout() {
  const [points, setPoints] = useState(0)
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const u = auth.currentUser
    if (!u) return
    setEmail(u.email)
    getDoc(doc(db, 'users', u.email)).then(snap => {
      if (snap.exists()) setPoints(snap.data()?.points ?? 0)
    })
  }, [])

  return (
    <div className="user-shell">
      <header className="user-topbar">
        <div className="user-topbar-left">
          <NavLink to="/account/convert" className="user-nav-item">التحويل</NavLink>
          <NavLink to="/account/history" className="user-nav-item">سجل معاملاتي</NavLink>
          <NavLink to="/account/convert#earn" className="user-nav-item">اربح معنا</NavLink>
        </div>
        <div className="user-topbar-right">
          <div className="user-balance">
            نقاطي: <strong>{points}</strong>
          </div>
          <NavLink to="/account/profile" className="user-profile-btn" title={email}>
            <span className="user-avatar-circle">👤</span>
          </NavLink>
        </div>
      </header>

      <main className="user-content">
        <Outlet />
      </main>
    </div>
  )
}
