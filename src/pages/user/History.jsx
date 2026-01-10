import React, { useEffect, useState } from 'react'
import { auth, db } from '../../firebase'
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore'
import '../../styles/User.css'

export default function History() {
  const [items, setItems] = useState([])
  const u = auth.currentUser

  useEffect(() => {
    if (!u) return
    const q = query(
      collection(db, 'transfers'),
      where('userEmail', '==', u.email),
      orderBy('createdAt', 'desc'),
      limit(100)
    )
    getDocs(q).then(snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [])

  const statusBadge = (s) => {
    const map = {
      pending: { text: 'قيد المراجعة', class: 'badge-pending' },
      approved: { text: 'تم بنجاح', class: 'badge-success' },
      rejected: { text: 'مرفوضة', class: 'badge-error' }
    }
    const b = map[s] || map.pending
    return <span className={`badge ${b.class}`}>{b.text}</span>
  }

  return (
    <div className="user-card">
      <h2>سجل معاملاتي</h2>
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
              <div className="history-meta">بتاريخ: {new Date(it.createdAt?.seconds * 1000).toLocaleString()}</div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="user-info">لا توجد معاملات بعد.</div>}
      </div>
    </div>
  )
}
