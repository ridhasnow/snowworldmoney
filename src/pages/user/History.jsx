import React, { useEffect, useState } from 'react'
import { auth, db } from '../../firebase'
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore'
import '../../styles/User.css'

export default function History() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const u = auth.currentUser

  useEffect(() => {
    if (!u) return
    const load = async () => {
      setError('')
      try {
        const q = query(
          collection(db, 'transfers'),
          where('userEmail', '==', u.email),
          orderBy('createdAt', 'desc'),
          limit(100)
        )
        const snap = await getDocs(q)
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (e) {
        console.error(e)
        setError('تعذّر تحميل السجل')
      }
    }
    load()
  }, [u])

  const statusBadge = (s) => {
    const map = {
      pending: { text: 'قيد المراجعة', class: 'badge-pending' },
      approved: { text: 'تم بنجاح', class: 'badge-success' },
      rejected: { text: 'مرفوضة', class: 'badge-error' }
    }
    const b = map[s] || map.pending
    return <span className={`badge ${b.class}`}>{b.text}</span>
  }

  const formatDate = (ts) => ts?.seconds ? new Date(ts.seconds * 1000).toLocaleString() : '—'

  return (
    <div className="user-card">
      <h2>سجل معاملاتي</h2>
      {error && <div className="user-info">{error}</div>}
      <div className="history-list">
        {items.map(it => (
          <div key={it.id} className="history-item">
            <div className="history-header">
              <strong>{it.fromName} → {it.toName}</strong>
              {statusBadge(it.status)}
            </div>
            <div className="history-body">
              <div>الكمية: {it.amountFrom} {it.fromCurrency} → {it.amountTo} {it.toCurrency}</div>
              <div>التعريفة: 1 {it.fromCurrency} = {it.rateTo} {it.toCurrency}</div>
              {it.txId && <div>Transaction ID: {it.txId}</div>}
              {it.receiveAddress && <div>عنوان الاستقبال: {it.receiveAddress}</div>}
              {it.proofUrl && <a href={it.proofUrl} target="_blank" rel="noreferrer">صورة الإثبات</a>}
              <div className="history-meta">بتاريخ: {formatDate(it.createdAt)}</div>
            </div>
          </div>
        ))}
        {items.length === 0 && !error && <div className="user-info">لا توجد معاملات بعد.</div>}
      </div>
    </div>
  )
}
