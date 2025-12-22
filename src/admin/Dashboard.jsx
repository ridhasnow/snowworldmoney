import React, { useState } from 'react'
import { auth, db } from '../../firebase'
import { updatePassword, updateEmail } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

export default function Dashboard() {
  const user = auth.currentUser
  const [username, setUsername] = useState('admin') // اسم العرض فقط
  const [email, setEmail] = useState(user?.email || '')
  const [newPassword, setNewPassword] = useState('')
  const [msg, setMsg] = useState('')

  const saveAdmin = async (e) => {
    e.preventDefault()
    try {
      // تحديث البريد (قد يحتاج إعادة مصادقة حسب سياسات Firebase)
      if (email && email !== user.email) {
        await updateEmail(user, email)
      }
      // تحديث كلمة السر
      if (newPassword) {
        await updatePassword(user, newPassword)
      }
      // خزّن اسم العرض في settings إن أردت
      await setDoc(doc(db, 'settings', 'admin'), {
        username,
        email,
        updatedAt: new Date()
      }, { merge: true })

      setMsg('تم الحفظ بنجاح. قد يُطلب تسجيل دخول مجدداً.')
    } catch (err) {
      setMsg('تعذّر الحفظ، تأكد من الصلاحيات أو أعد تسجيل الدخول')
    }
  }

  return (
    <div>
      <h2>إعدادات الأدمن</h2>
      {msg && <div className="admin-info">{msg}</div>}
      <form onSubmit={saveAdmin} className="admin-form-grid">
        <label>اسم المستخدم (عرض فقط)</label>
        <input value={username} onChange={e => setUsername(e.target.value)} />

        <label>البريد الإلكتروني</label>
        <input value={email} onChange={e => setEmail(e.target.value)} />

        <label>كلمة مرور جديدة</label>
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />

        <button className="admin-button" type="submit">حفظ</button>
      </form>
      <p className="admin-hint">
        ملاحظة: قد تتطلب Google إعادة مصادقة قبل تغيير البريد/السر. إن ظهر خطأ،
        قم بتسجيل الخروج ثم الدخول مجدداً وحاول التغيير.
      </p>
    </div>
  )
}
