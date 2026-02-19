import React, { useEffect, useState } from 'react'
import { auth, db } from '../../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import '../../styles/User.css'

export default function Profile() {
  const u = auth.currentUser
  const [form, setForm] = useState({
    avatar: '',
    username: '',
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
    birthdate: '',
    whatsapp: '',
    telegram: '',
    email: u?.email || ''
  })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!u) return
    getDoc(doc(db, 'users', u.email)).then(snap => {
      if (snap.exists()) {
        const d = snap.data()
        setForm(f => ({
          ...f,
          avatar: d.avatar || '',
          username: d.username || '',
          firstName: d.firstName || '',
          lastName: d.lastName || '',
          address: d.address || '',
          phone: d.phone || '',
          birthdate: d.birthdate || '',
          whatsapp: d.whatsapp || '',
          telegram: d.telegram || '',
          email: u.email
        }))
      }
    })
  }, [u])

  const save = async (e) => {
    e.preventDefault()
    if (!u) { setMsg('❌ يجب تسجيل الدخول'); return }
    try {
      await setDoc(doc(db, 'users', u.email), {
        avatar: form.avatar,
        username: form.username,
        firstName: form.firstName,
        lastName: form.lastName,
        address: form.address,
        phone: form.phone,
        birthdate: form.birthdate,
        whatsapp: form.whatsapp,
        telegram: form.telegram,
        email: u.email,
        updatedAt: new Date()
      }, { merge: true })
      setMsg('✅ تم حفظ البروفايل بنجاح')
    } catch (e) {
      console.error(e)
      setMsg('❌ تعذّر الحفظ، حاول لاحقاً')
    }
  }

  const avatars = [
    { src: new URL('../../assets/avatars/avatar1.png', import.meta.url).href, value: 'avatar1.png' },
    { src: new URL('../../assets/avatars/avatar2.png', import.meta.url).href, value: 'avatar2.png' },
    { src: new URL('../../assets/avatars/avatar3.png', import.meta.url).href, value: 'avatar3.png' }
  ]

  return (
    <div className="user-card">
      <h2 className="section-title">بروفايل المستخدم</h2>
      {msg && <div className="user-info">{msg}</div>}

      <form className="user-form-grid" onSubmit={save}>
        <label>اختيار أفاتار</label>
        <div className="avatar-grid">
          {avatars.map(a => (
            <label key={a.value} className={"avatar-option" + (form.avatar === a.value ? " selected" : "")}>
              <input
                type="radio"
                name="avatar"
                value={a.value}
                checked={form.avatar === a.value}
                onChange={() => setForm({ ...form, avatar: a.value })}
              />
              <img src={a.src} alt={a.value} />
            </label>
          ))}
        </div>

        <label>اسم المستخدم (Username)</label>
        <input className="input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />

        <label>الاسم الأول</label>
        <input className="input" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />

        <label>الاسم الأخير</label>
        <input className="input" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />

        <label>العنوان</label>
        <input className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />

        <label>رقم الهاتف</label>
        <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />

        <label>تاريخ الميلاد</label>
        <input type="date" className="input" value={form.birthdate} onChange={e => setForm({ ...form, birthdate: e.target.value })} />

        <label>WhatsApp</label>
        <input className="input" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} />

        <label>Telegram</label>
        <input className="input" value={form.telegram} onChange={e => setForm({ ...form, telegram: e.target.value })} />

        <button type="submit" className="user-button">حفظ</button>
      </form>
    </div>
  )
}
