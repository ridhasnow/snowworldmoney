import React, { useEffect, useMemo, useState } from 'react'
import { db } from '../../firebase'
import {
  collection, getDocs, query, orderBy, limit, startAfter, where, updateDoc, doc
} from 'firebase/firestore'
import '../../styles/User.css'

const PAGE_SIZE = 50
const TX_PAGE_SIZE = 50

export default function Users() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [cursors, setCursors] = useState([])
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [userTransfers, setUserTransfers] = useState([])
  const [txPage, setTxPage] = useState(0)
  const [txCursors, setTxCursors] = useState([])
  const [loadingTransfers, setLoadingTransfers] = useState(false)
  const [editTx, setEditTx] = useState(null)

  const usersCol = useMemo(() => collection(db, 'users'), [])

  const loadPage = async (pageIndex) => {
    setLoading(true); setError('')
    try {
      let q = query(usersCol, orderBy('createdAt', 'desc'), limit(PAGE_SIZE))
      if (pageIndex > 0 && cursors[pageIndex - 1]) {
        q = query(usersCol, orderBy('createdAt', 'desc'), startAfter(cursors[pageIndex - 1]), limit(PAGE_SIZE))
      }
      if (search.trim()) {
        q = query(
          usersCol,
          where('email', '>=', search.trim()),
          where('email', '<=', search.trim() + '\uf8ff'),
          orderBy('email'),
          limit(PAGE_SIZE)
        )
      }
      const snap = await getDocs(q)
      const docs = snap.docs
        .map(d => ({ id: d.id, ...d.data(), _doc: d }))
        .filter(u => (u.role || '').toLowerCase() !== 'admin') // إخفاء الأدمن
      setItems(docs)
      if (docs.length > 0 && !search.trim()) {
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
      setError('تعذّر تحميل المستخدمين')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPage(0) }, [])

  const hasPrev = page > 0
  const hasNext = !search.trim() && items.length === PAGE_SIZE

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

  const loadUserTransfers = async (user, pageIndex = 0) => {
    setLoadingTransfers(true)
    try {
      let q = query(
        collection(db, 'transfers'),
        where('userEmail', '==', user.email || user.id),
        orderBy('createdAt', 'desc'),
        limit(TX_PAGE_SIZE)
      )
      if (pageIndex > 0 && txCursors[pageIndex - 1]) {
        q = query(
          collection(db, 'transfers'),
          where('userEmail', '==', user.email || user.id),
          orderBy('createdAt', 'desc'),
          startAfter(txCursors[pageIndex - 1]),
          limit(TX_PAGE_SIZE)
        )
      }
      const snap = await getDocs(q)
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data(), _doc: d }))
      setUserTransfers(docs)
      if (docs.length > 0) {
        const lastDoc = docs[docs.length - 1]._doc
        setTxCursors(prev => {
          const next = [...prev]
          next[pageIndex] = lastDoc
          return next
        })
      }
      setTxPage(pageIndex)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingTransfers(false)
    }
  }

  const openUserDetails = (user) => {
    setSelectedUser(user)
    setUserTransfers([])
    setTxPage(0); setTxCursors([])
    loadUserTransfers(user, 0)
  }

  const hasPrevTx = txPage > 0
  const hasNextTx = userTransfers.length === TX_PAGE_SIZE

  const startEditTx = (tx) => {
    setEditTx({ id: tx.id, status: tx.status || 'pending', note: tx.adminNote || '' })
  }

  const saveEditTx = async () => {
    if (!editTx) return
    try {
      await updateDoc(doc(db, 'transfers', editTx.id), {
        status: editTx.status,
        adminNote: editTx.note || ''
      })
      setUserTransfers(prev => prev.map(t => t.id === editTx.id ? { ...t, status: editTx.status, adminNote: editTx.note } : t))
      setEditTx(null)
    } catch (e) {
      console.error(e)
      alert('تعذّر حفظ التعديل')
    }
  }

  if (loading && items.length === 0) return <div className="admin-loading">...جار التحميل</div>
  if (error) return <div className="admin-card">{error}</div>

  return (
    <div>
      <h2>المستخدمون</h2>

      <div className="admin-card" style={{ marginBottom: 12 }}>
        <input
          className="input"
          placeholder="بحث بالبريد..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%' }}
        />
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <button className="user-button" onClick={() => loadPage(0)}>بحث</button>
          {search.trim() && <button className="user-button secondary" onClick={() => { setSearch(''); loadPage(0) }}>مسح البحث</button>}
        </div>
      </div>

      {items.length === 0 && !loading && <div className="admin-card">لا يوجد مستخدمون حالياً.</div>}
      {items.map(u => (
        <div key={u.id} className="admin-card" style={{ marginBottom: 12 }}>
          <div><strong>{u.email || u.id}</strong></div>
          {u.username && <div>الاسم المستعار: {u.username}</div>}
          {u.firstName && <div>الاسم الأول: {u.firstName}</div>}
          {u.lastName && <div>الاسم الأخير: {u.lastName}</div>}
          {u.phone && <div>الهاتف: {u.phone}</div>}
          {u.role && <div>الدور: {u.role}</div>}
          {u.createdAt?.seconds && <div>تاريخ الإنشاء: {new Date(u.createdAt.seconds * 1000).toLocaleString()}</div>}
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="user-button" onClick={() => openUserDetails(u)}>🔍 تفاصيل المستخدم</button>
          </div>
        </div>
      ))}

      <div className="pager">
        <button className="pager-btn" disabled={!hasPrev} onClick={() => hasPrev && loadPage(page - 1)}>السابق</button>
        {pageButtons()}
        <button className="pager-btn" disabled={!hasNext} onClick={() => hasNext && loadPage(page + 1)}>التالي</button>
      </div>

      {/* مودال تفاصيل المستخدم */}
      {selectedUser && (
        <div className="modal-backdrop">
          <div className="modal modal-scroll">
            <div className="modal-header">
              <h3>تفاصيل المستخدم</h3>
              <button className="close-picker" onClick={() => { setSelectedUser(null); setUserTransfers([]) }}>✖</button>
            </div>
            <div className="modal-body">
              <div><strong>البريد:</strong> {selectedUser.email || selectedUser.id}</div>
              {selectedUser.username && <div><strong>الاسم المستعار:</strong> {selectedUser.username}</div>}
              {selectedUser.firstName && <div><strong>الاسم الأول:</strong> {selectedUser.firstName}</div>}
              {selectedUser.lastName && <div><strong>الاسم الأخير:</strong> {selectedUser.lastName}</div>}
              {selectedUser.phone && <div><strong>الهاتف:</strong> {selectedUser.phone}</div>}
              {selectedUser.address && <div><strong>العنوان:</strong> {selectedUser.address}</div>}
              {selectedUser.birthdate && <div><strong>تاريخ الميلاد:</strong> {selectedUser.birthdate}</div>}
              {selectedUser.whatsapp && <div><strong>واتساب:</strong> {selectedUser.whatsapp}</div>}
              {selectedUser.telegram && <div><strong>تيليجرام:</strong> {selectedUser.telegram}</div>}
              {selectedUser.role && <div><strong>الدور:</strong> {selectedUser.role}</div>}
              {selectedUser.createdAt?.seconds && <div><strong>تاريخ الإنشاء:</strong> {new Date(selectedUser.createdAt.seconds * 1000).toLocaleString()}</div>}

              <h4 style={{ marginTop: 12 }}>معاملات المستخدم</h4>
              {loadingTransfers && <div className="user-info">...جار التحميل</div>}
              {!loadingTransfers && userTransfers.length === 0 && <div className="user-info">لا توجد معاملات.</div>}
              {!loadingTransfers && userTransfers.map(tx => (
                <div key={tx.id} className="history-item" style={{ marginBottom: 8 }}>
                  <div className="history-header">
                    <strong>{tx.fromName} → {tx.toName}</strong>
                    <span className="badge badge-pending">{tx.status || 'pending'}</span>
                  </div>
                  <div className="history-body">
                    <div>الكمية: {tx.amountFrom} {tx.fromCurrency} → {tx.amountTo} {tx.toCurrency}</div>
                    <div>العنوان: {tx.receiveAddress || '—'}</div>
                    <div>Transaction ID: {tx.txId || '—'}</div>
                    {tx.adminNote && <div>ملاحظة الأدمن: {tx.adminNote}</div>}
                    <div className="history-meta">
                      {tx.createdAt?.seconds ? new Date(tx.createdAt.seconds * 1000).toLocaleString() : '—'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="user-button" onClick={() => startEditTx(tx)}>✏️ تعديل الحالة/ملاحظة</button>
                  </div>
                </div>
              ))}

              <div className="pager">
                <button className="pager-btn" disabled={!hasPrevTx} onClick={() => hasPrevTx && loadUserTransfers(selectedUser, txPage - 1)}>السابق</button>
                <span className="pager-btn active">صفحة {txPage + 1}</span>
                <button className="pager-btn" disabled={!hasNextTx} onClick={() => hasNextTx && loadUserTransfers(selectedUser, txPage + 1)}>التالي</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال تعديل الحالة/الملاحظة */}
      {editTx && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>تعديل الطلب</h3>
              <button className="close-picker" onClick={() => setEditTx(null)}>✖</button>
            </div>
            <div className="modal-body">
              <label>الحالة</label>
              <select
                className="input"
                value={editTx.status}
                onChange={(e) => setEditTx(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="pending">قيد المراجعة</option>
                <option value="approved">مقبولة</option>
                <option value="rejected">مرفوضة</option>
              </select>

              <label style={{ marginTop: 8 }}>ملاحظة الأدمن</label>
              <textarea
                className="input"
                rows={3}
                value={editTx.note}
                onChange={(e) => setEditTx(prev => ({ ...prev, note: e.target.value }))}
                placeholder="اكتب ملاحظة ستظهر للمستخدم"
              />

              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button className="user-button success" onClick={saveEditTx}>حفظ</button>
                <button className="user-button secondary" onClick={() => setEditTx(null)}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
