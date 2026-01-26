import React, { useEffect, useState } from 'react'
import { db } from '../../firebase'
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore'
import '../../styles/User.css'

const PAGE_SIZE = 50

export default function Transfers() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [cursors, setCursors] = useState([])

  const loadPage = async (pageIndex) => {
    setLoading(true); setError('')
    try {
      let q = query(collection(db, 'transfers'), orderBy('createdAt', 'desc'), limit(PAGE_SIZE))
      if (pageIndex > 0 && cursors[pageIndex - 1]) {
        q = query(
          collection(db, 'transfers'),
          orderBy('createdAt', 'desc'),
          startAfter(cursors[pageIndex - 1]),
          limit(PAGE_SIZE)
        )
      }
      const snap = await getDocs(q)
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data(), _doc: d }))
      setItems(docs)
      if (docs.length > 0) {
        const lastDoc = docs[docs.length - 1]._doc
        setCursors(prev => {
          const next = [...prev]
          next[pageIndex] = lastDoc
          return next
        })
      }
      setPage(pageIndex)
    } catch (e) {
      console.error(e)
      setError('تعذّر تحميل التحويلات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPage(0) }, [])

  const hasPrev = page > 0
  const hasNext = items.length === PAGE_SIZE

  const pageButtons = () => {
    const windowSize = 5
    const start = Math.max(0, page - 2)
    const btns = []
    for (let i = start; i < start + windowSize; i++) {
      if (i > page + 2) break
      btns.push(
        <button
          key={i}
          className={`pager-btn ${i === page ? 'active' : ''}`}
          onClick={() => loadPage(i)}
        >
          {i + 1}
        </button>
      )
      if (i > page && !hasNext) break
    }
    return btns
  }

  if (loading && items.length === 0) return <div className="admin-loading">...جار التحميل</div>
  if (error) return <div className="admin-card">{error}</div>

  return (
    <div>
      <h2>طلبات التحويلات</h2>
      {items.length === 0 && !loading && <div className="admin-card">لا توجد طلبات حالياً.</div>}
      {items.map(it => (
        <div key={it.id} className="admin-card" style={{ marginBottom: 12 }}>
          <div><strong>{it.fromName}</strong> → <strong>{it.toName}</strong></div>
          <div>المستخدم: {it.userEmail}</div>
          <div>الكمية: {it.amountFrom} {it.fromCurrency} → {it.amountTo} {it.toCurrency}</div>
          <div>الحالة: {it.status || 'pending'}</div>
          <div>عنوان الإرسال: {it.sendAddress || '—'}</div>
          <div>عنوان الاستقبال: {it.receiveAddress || '—'}</div>
          {it.txId && <div>Transaction ID: {it.txId}</div>}
          {it.proofUrl && <div><a href={it.proofUrl} target="_blank" rel="noreferrer">صورة الإثبات</a></div>}
          <div>التاريخ: {it.createdAt?.seconds ? new Date(it.createdAt.seconds * 1000).toLocaleString() : '—'}</div>
        </div>
      ))}

      <div className="pager">
        <button className="pager-btn" disabled={!hasPrev} onClick={() => hasPrev && loadPage(page - 1)}>السابق</button>
        {pageButtons()}
        <button className="pager-btn" disabled={!hasNext} onClick={() => hasNext && loadPage(page + 1)}>التالي</button>
      </div>

      {loading && <div className="admin-card">...جار التحميل</div>}
    </div>
  )
}
