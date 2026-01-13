import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { auth, db } from '../../firebase'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import '../../styles/User.css'

export default function UserLayout() {
  const [points, setPoints] = useState(0)
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState('') // اسم ملف الأفاتار المحفوظ

  // دالة ترجمة اسم الأفاتار إلى رابط الصورة
  const avatarUrl = (val) => {
    switch (val) {
      case 'avatar1.png': return new URL('../../assets/avatars/avatar1.png', import.meta.url).href
      case 'avatar2.png': return new URL('../../assets/avatars/avatar2.png', import.meta.url).href
      case 'avatar3.png': return new URL('../../assets/avatars/avatar3.png', import.meta.url).href
      default: return ''
    }
  }

  useEffect(() => {
    const u = auth.currentUser
    if (!u) return
    setEmail(u.email)

    const ref = doc(db, 'users', u.email)

    // قراءة أولية
    getDoc(ref).then(snap => {
      if (snap.exists()) {
        const d = snap.data()
        setPoints(d?.points ?? 0)
        setAvatar(d?.avatar ?? '')
      }
    })

    // متابعة لحظية لأي تغيّر (بعد ضغط "حفظ" مباشرة)
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        const d = snap.data()
        setPoints(d?.points ?? 0)
        setAvatar(d?.avatar ?? '')
      }
    })
    return () => unsub()
  }, [])

  const imgSrc = avatarUrl(avatar)

  return (
    <div className="user-shell">
      <header className="user-topbar">
        <div className="user-topbar-left">
          <NavLink to="/account/convert" className="user-nav-item">التحويل</NavLink>
          <NavLink to="/account/history" className="user-nav-item">سجل معاملاتي</NavLink>
          <NavLink to="/account/convert#earn" className="user-nav-item">اربح معنا</NavLink>
        </div>
        <div className="user-topbar-right">
          <div className="user-balance">نقاطي: <strong>{points}</strong></div>
          <NavLink to="/account/profile" className="user-profile-btn" title={email}>
            <span className="user-avatar-circle">
              {imgSrc ? <img src={imgSrc} alt="avatar" /> : '👤'}
            </span>
          </NavLink>
        </div>
      </header>
      <main className="user-content">
        {/* تعرض children عبر Routes في App.jsx */}
      </main>
    </div>
  )
}
