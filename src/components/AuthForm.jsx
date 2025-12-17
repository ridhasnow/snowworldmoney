import React, { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../firebase'
import { setDoc, doc, getDoc } from 'firebase/firestore'
import '../styles/AuthForm.css'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const userDocRef = doc(db, 'users', email)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        setMessage('⚠️ هذا الحساب موجود بالفعل!')
        setLoading(false)
        return
      }

      await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(userDocRef, {
        email,
        createdAt: new Date(),
        role: 'user'
      })
      
      setMessage('✅ تم إنشاء الحساب بنجاح!')
      setEmail('')
      setPassword('')
    } catch (error) {
      setMessage(`❌ خطأ: ${error.message}`)
    }
    setLoading(false)
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setMessage('✅ تم تسجيل الدخول بنجاح!')
      setEmail('')
      setPassword('')
    } catch (error) {
      setMessage(`❌ خطأ في البيانات: ${error.message}`)
    }
    setLoading(false)
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
      
      <button 
        className="toggle-button"
        onClick={() => setIsSignUp(!isSignUp)}
      >
        {isSignUp ? 'لديك حساب؟ سجل دخول' : 'ليس لديك حساب؟ أنشئ واحداً'}
      </button>
    </div>
  )
}
