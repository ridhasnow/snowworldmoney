import React, { useEffect, useState } from 'react'
import { db } from '../../firebase'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'

export default function Transfers() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('')
      try {
        const q = query(collection(db, 'transfers'), orderBy('createdAt', 'desc'), limit(50))
        const snap = await getDocs(q)
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (e) {
        console.error(e)
        setError('تعذّر تحميل التحويلات')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="admin-loading">...جار التحميل</div>
  if (error) return <div className="admin-card">{error}</div>

  return (
    <div>
      <h2>طلبات التحويلات</h2>
      {items.length === 0 && <div className="admin-card">لا توجد طلبات حالياً.</div>}
      {items.map(it => (
        <div key={it.id} className="admin-card" style={{ marginBottom: 12 }}>
          <div><strong>{it.fromName}</strong> → <strong>{it.toName}</strong></div>
          <div>الم��تخدم: {it.userEmail}</div>
          <div>الكمية: {it.amountFrom} {it.fromCurrency} → {it.amountTo} {it.toCurrency}</div>
          <div>الحالة: {it.status || 'pending'}</div>
          <div>عنوان الإرسال: {it.sendAddress || '—'}</div>
          <div>عنوان الاستقبال: {it.receiveAddress || '—'}</div>
          {it.txId && <div>Transaction ID: {it.txId}</div>}
          {it.proofUrl && <div><a href={it.proofUrl} target="_blank" rel="noreferrer">صورة الإثبات</a></div>}
          <div>التاريخ: {it.createdAt?.seconds ? new Date(it.createdAt.seconds * 1000).toLocaleString() : '—'}</div>
        </div>
      ))}
    </div>
  )
}
