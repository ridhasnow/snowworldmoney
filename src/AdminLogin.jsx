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

  const toEmail = (u) => {
    if (!u) return ''
    // لو كتب admin نستعمل ايميل ثابت
    if (u.toLowerCase() === 'admin') return 'admin@snowworldmoney.tn'
    // أو لو أدخل بريد بالفعل
    if (u.includes('@')) return u
    // fallback: نمط بريد من اليوزر
    return `${u}@snowworldmoney.tn`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const email = toEmail(username.trim())
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

        <form onSubmit={handleSubmit} className="admin-form">
          <input
            dir="auto"
            className="admin-input"
            placeholder="اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="admin-input"
            type="password"
            placeholder="كلمة السر"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="admin-button" type="submit" disabled={loading}>
            {loading ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  )
}
