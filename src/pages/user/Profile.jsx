import React, { useEffect, useState } from 'react'
import { auth, db } from '../../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import avatar1 from '../../assets/avatars/avatar1.png'
import avatar2 from '../../assets/avatars/avatar2.png'
import avatar3 from '../../assets/avatars/avatar3.png'
import whatsappIcon from '../../assets/whatsapp.png'
import telegramIcon from '../../assets/telegram.png'
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
  }, [])

  const save = async (e) => {
    e.preventDefault()
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
        telegram: form.telegram
      }, { merge: true })
      setMsg('تم حفظ البروفايل بنجاح')
    } catch {
      setMsg('تعذّر الحفظ، حاول لاحقاً')
    }
  }

  const avatars = [
    { src: avatar1, value: 'avatar1.png' },
    { src: avatar2, value: 'avatar2.png' },
    { src: avatar3, value: 'avatar3.png' }
  ]

  return (
    <div className="user-card">
      <h2>بروفايل المستخدم</h2>
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

        <label>اسم المستخدم</label>
        <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />

        <label>الاسم</label>
        <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />

        <label>اللقب</label>
        <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />

        <label>العنوان</label>
        <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />

        <label>رقم الهاتف</label>
        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />

        <label>تاريخ الولادة</label>
        <input type="date" value={form.birthdate} onChange={e => setForm({ ...form, birthdate: e.target.value })} />

        <label>واتساب</label>
        <div className="social-row">
          <img src={whatsappIcon} alt="whatsapp" />
          <input
            value={form.whatsapp}
            onChange={e => setForm({ ...form, whatsapp: e.target.value })}
            placeholder="رقم واتساب أو رابط"
          />
        </div>

        <label>تيليجرام</label>
        <div className="social-row">
          <img src={telegramIcon} alt="telegram" />
          <input
            value={form.telegram}
            onChange={e => setForm({ ...form, telegram: e.target.value })}
            placeholder="@username"
          />
        </div>

        <label>البريد الإلكتروني (غير قابل للتعديل)</label>
        <input value={form.email} readOnly />

        <div style={{ display:'flex', gap:8, marginTop:10 }}>
          <button className="user-button" type="submit">حفظ</button>
        </div>
      </form>
    </div>
  )
}
