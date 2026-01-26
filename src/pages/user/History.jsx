import React, { useEffect, useState } from 'react'
import { auth, db } from '../../firebase'
import { collection, query, where, orderBy, getDocs, limit, startAfter } from 'firebase/firestore'
import '../../styles/User.css'

const PAGE_SIZE = 50

export default function History() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [cursors, setCursors] = useState([]) // نخزن آخر وثيقة لكل صفحة للتنقل للأمام
  const u = auth.currentUser

  const loadPage = async (pageIndex) => {
    if (!u) return
    setLoading(true); setError('')
    try {
      let q = query(
        collection(db, 'transfers'),
        where('userEmail', '==', u.email),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE)
      )
      if (pageIndex > 0 && cursors[pageIndex - 1]) {
        q = query(
          collection(db, 'transfers'),
          where('userEmail', '==', u.email),
          orderBy('createdAt', 'desc'),
          startAfter(cursors[pageIndex - 1]),
          limit(PAGE_SIZE)
        )
      }
      const snap = await getDocs(q)
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data(), _doc: d }))
      setItems(docs)
      // حفظ مؤشر الصفحة الجديدة
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
      setError('تعذّر تحميل السجل')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPage(0) }, [u]) // تحميل الصفحة الأولى عند الدخول

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

  const hasPrev = page > 0
  const hasNext = items.length === PAGE_SIZE // قد يكون هناك صفحة لاحقة

  const pageButtons = () => {
    // نعرض نافذة صغيرة حول الصفحة الحالية لتسهيل التنقل
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
      // نتوقف إن لم نكن نعرف بعد عن صفحات لاحقة ولم نملأ النافذة
      if (i > page && !hasNext) break
    }
    return btns
  }

  return (
    <div className="user-card">
      <h2>سجل معاملاتي</h2>
      {error && <div className="user-info">{error}</div>}
      {loading && <div className="user-info">...جار التحميل</div>}
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
        {items.length === 0 && !error && !loading && <div className="user-info">لا توجد معاملات بعد.</div>}
      </div>

      <div className="pager">
        <button className="pager-btn" disabled={!hasPrev} onClick={() => hasPrev && loadPage(page - 1)}>السابق</button>
        {pageButtons()}
        <button className="pager-btn" disabled={!hasNext} onClick={() => hasNext && loadPage(page + 1)}>التالي</button>
      </div>
    </div>
  )
}
