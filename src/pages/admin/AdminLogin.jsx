import React, { useState } from 'react'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase'
import { useNavigate } from 'react-router-dom'
import '../../styles/Admin.css'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // نحول اسم المستخدم إلى بريد، لو كتب "admin" نستخدم البريد الثابت
  const toEmail = (u) => {
    if (!u) return ''
    const s = u.trim().toLowerCase()
    if (s === 'admin') return 'admin@snowworldmoney.tn'
    if (s.includes('@')) return u.trim()
    return `${s}@snowworldmoney.tn`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const email = toEmail(username)
      await signInWithEmailAndPassword(auth, email, password)

      const snap = await getDoc(doc(db, 'users', email))
      if (!snap.exists() || snap.data()?.role !== 'admin') {
        await signOut(auth)
        setError('ليس لديك صلاحيات الأدمن')
        setLoading(false)
        return
      }

      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setError('بيانات غير صحيحة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-auth-wrapper">
      <div className="admin-auth-card">
        <h2>تسجيل دخول الأدمن</h2>
        {error && <div className="admin-error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-form" noValidate>
          <input
            dir="auto"
            className="admin-input"
            type="text"                 // مهم: اسم مستخدم وليس بريد
            placeholder="اسم المستخدم أو البريد"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
          <input
            className="admin-input"
            type="password"
            placeholder="كلمة السر"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button className="admin-button" type="submit" disabled={loading}>
            {loading ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>

        <p className="admin-hint" style={{textAlign:'center',marginTop:8}}>
          يمكنك كتابة admin فقط، وسنحوّلها تلقائياً إلى admin@snowworldmoney.tn
        </p>
      </div>
    </div>
  )
}
