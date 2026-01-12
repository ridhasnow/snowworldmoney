import React, { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../firebase'
import { setDoc, doc, getDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import '../styles/AuthForm.css'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // أنشئ الحساب أولاً (سيفشل تلقائياً إن كان الإيميل مستخدماً)
      await createUserWithEmailAndPassword(auth, email, password)

      // ثم اكتب وثيقة المستخدم مباشرة
      await setDoc(doc(db, 'users', email), {
        email,
        createdAt: new Date(),
        role: 'user',
        points: 0,
        avatar: '',
        username: '',
        firstName: '',
        lastName: '',
        address: '',
        phone: '',
        birthdate: '',
        whatsapp: '',
        telegram: ''
      }, { merge: true })

      setMessage('✅ تم إنشاء الحساب بنجاح! جارٍ فتح حسابك...')
      setEmail('')
      setPassword('')
      navigate('/account/convert', { replace: true })
    } catch (error) {
      if (error?.code === 'auth/email-already-in-use') {
        setMessage('⚠️ هذا البريد مستخدم بالفعل. سجّل دخولك.')
      } else if (!navigator.onLine) {
        setMessage('❌ لا يوجد اتصال بالإنترنت. تفقّد الشبكة وحاول مجدداً.')
      } else {
        setMessage(`❌ خطأ: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await signInWithEmailAndPassword(auth, email, password)

      // بعد تسجيل الدخول افحص الدور من Firestore
      let role = 'user'
      try {
        const snap = await getDoc(doc(db, 'users', email))
        if (snap.exists()) role = snap.data()?.role || 'user'
      } catch {
        // تجاهل أي أخطاء قراءة هنا، واستمر كمستخدم عادي
      }

      if (role === 'admin') {
        setMessage('✅ تم تسجيل الدخول كأدمن، جارٍ فتح اللوحة...')
        navigate('/admin/dashboard', { replace: true })
      } else {
        setMessage('✅ تم تسجيل الدخول بنجاح! جارٍ فتح حسابك...')
        navigate('/account/convert', { replace: true })
      }

      setEmail('')
      setPassword('')
    } catch (error) {
      if (!navigator.onLine) {
        setMessage('❌ لا يوجد اتصال بالإنترنت. تفقّد الشبكة.')
      } else {
        setMessage(`❌ خطأ في البيانات: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      {message && <div className="toast-notification">{message}</div>}
      <form className="auth-form" onSubmit={isSignUp ? handleSignUp : handleSignIn}>
        <h2>{isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</h2>
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="auth-input"
        />
        <input
          type="password"
          placeholder="كلمة السر"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="auth-input"
        />
        <button type="submit" disabled={loading} className="auth-button">
          {loading ? 'جاري المعالجة...' : (isSignUp ? 'إنشاء حساب' : 'تسجيل دخول')}
        </button>
      </form>

      <button className="toggle-button" onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'لديك حساب؟ سجل دخول' : 'ليس لديك حساب؟ أنشئ واحداً'}
      </button>
    </div>
  )
}
