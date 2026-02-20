import React, { useEffect, useState } from 'react'
import { auth, db } from '../../firebase'
import { collection, query, where, orderBy, getDocs, limit, startAfter } from 'firebase/firestore'
import '../../styles/User.css'

const PAGE_SIZE = 50
const fmt = (v, max = 6) =>
  Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: max })

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

  return (
    <div className="user-card">
      <h2>سجل معاملاتي</h2>
      {error && <div className="user-info">{error}</div>}
      {loading && <div className="user-info">...جار التحميل</div>}
      <div className="history-list">
        {items.map(it => {
          // التعريفة من العملة المرسلة إلى العملة المستقبَلة
          const directRate = it.rateTo && it.rateTo !== 0
            ? it.rateTo
            : (it.rateFrom && it.rateFrom !== 0 ? 1 / it.rateFrom : null)

          return (
            <div key={it.id} className="history-item">
              <div className="history-header">
                <strong>{it.fromName} → {it.toName}</strong>
                {statusBadge(it.status)}
              </div>
              <div className="history-body">
                <div className="pill-row">
                  <span className="pill">{fmt(it.amountFrom)} {it.fromCurrency}</span>
                  <span className="pill pill-eq">=</span>
                  <span className="pill">{fmt(it.amountTo, 6)} {it.toCurrency}</span>
                </div>

                {directRate && (
                  <div className="pill-row">
                    <span className="pill">1 {it.fromCurrency}</span>
                    <span className="pill pill-eq">=</span>
                    <span className="pill">{fmt(directRate, 6)} {it.toCurrency}</span>
                  </div>
                )}

                {it.txId && <div>Transaction ID: {it.txId}</div>}
                {it.receiveAddress && <div>عنوان الاستقبال: {it.receiveAddress}</div>}
                {it.proofUrl && <a href={it.proofUrl} target="_blank" rel="noreferrer">صورة الإثبات</a>}
                {it.adminNote && <div><strong>ملاحظة الأدمن:</strong> {it.adminNote}</div>}
                <div className="history-meta">بتاريخ: {formatDate(it.createdAt)}</div>
              </div>
            </div>
          )
        })}
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
