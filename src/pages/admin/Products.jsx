import React, { useEffect, useMemo, useState } from 'react'
import { db } from '../../firebase'
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, getDocs, query, orderBy, limit, serverTimestamp, deleteField
} from 'firebase/firestore'
import uploadImageToCloudinary from '../../utils/uploadImage'

const useCloudinary = import.meta.env.VITE_USE_CLOUDINARY === 'true'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '',
    currency: '',
    fromId: '',           // اختياري: من أي منتج يبدأ التبادل
    routes: [{ toId: '', rate: '' }],  // مصفوفة المسارات
    active: true,
    imageFile: null,
    imageUrl: ''
  })

  const productsCol = useMemo(() => collection(db, 'products'), [db])

  const loadProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const q = query(productsCol, orderBy('updatedAt', 'desc'), limit(50))
      const snap = await getDocs(q)
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch {
      setError('تعذّر تحميل المنتجات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProducts() }, [])

  const resetForm = () => {
    setForm({
      name: '',
      currency: '',
      fromId: '',
      routes: [{ toId: '', rate: '' }],
      active: true,
      imageFile: null,
      imageUrl: ''
    })
    setEditing(null)
  }

  const openAdd = () => { resetForm(); setOpen(true) }

  const openEdit = (p) => {
    // تحويل الحقول القديمة إلى routes إن وجدت
    const legacyRoute = (p.toId || p.rate !== undefined)
      ? [{ toId: p.toId || '', rate: p.rate ?? '' }]
      : []

    setEditing(p)
    setForm({
      name: p.name || '',
      currency: p.currency || '',
      fromId: p.fromId || '',
      routes: (Array.isArray(p.routes) && p.routes.length > 0) ? p.routes.map(r => ({
        toId: r.toId || '',
        rate: r.rate ?? ''
      })) : (legacyRoute.length ? legacyRoute : [{ toId: '', rate: '' }]),
      active: p.active ?? true,
      imageFile: null,
      imageUrl: p.imageUrl || ''
    })
    setOpen(true)
  }

  const addRouteRow = () => {
    setForm(f => ({ ...f, routes: [...f.routes, { toId: '', rate: '' }] }))
  }

  const removeRouteRow = (idx) => {
    setForm(f => {
      const next = [...f.routes]
      next.splice(idx, 1)
      return { ...f, routes: next.length ? next : [{ toId: '', rate: '' }] }
    })
  }

  const setRouteField = (idx, key, value) => {
    setForm(f => {
      const next = f.routes.map((r, i) => i === idx ? { ...r, [key]: value } : r)
      return { ...f, routes: next }
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')

    try {
      if (!form.name || !form.currency) {
        setError('يرجى إدخال اسم المنتج والعملة')
        return
      }

      // تنظيف المصفوفة: تجاهل المسارات الفارغة
      const routes = form.routes
        .map(r => ({ toId: (r.toId || '').trim(), rate: r.rate === '' ? '' : Number(r.rate) }))
        .filter(r => r.toId)

      if (routes.length === 0) {
        setError('أضف مساراً واحداً على الأقل في حقل "إلى"')
        return
      }

      let docId = editing?.id
      let imageUrl = editing?.imageUrl || ''
      let cloudPublicId = editing?.cloudPublicId || ''

      if (!editing) {
        const newDoc = await addDoc(productsCol, {
          name: form.name,
          currency: form.currency,
          fromId: form.fromId || '',
          routes,               // نحفظ المصفوفة
          active: !!form.active,
          imageUrl: '',
          cloudPublicId: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        docId = newDoc.id
      }

      // رفع الصورة أو استخدام رابط
      if (useCloudinary && form.imageFile) {
        const up = await uploadImageToCloudinary(form.imageFile)
        imageUrl = up.url
        cloudPublicId = up.public_id
      } else {
        imageUrl = (form.imageUrl || '').trim()
      }

      // تحديث الوثيقة + حذف الحقول القديمة إن وجدت
      await updateDoc(doc(db, 'products', docId), {
        name: form.name,
        currency: form.currency,
        fromId: form.fromId || '',
        routes,
        active: !!form.active,
        imageUrl,
        cloudPublicId,
        updatedAt: serverTimestamp(),
        toId: deleteField(),
        rate: deleteField(),
      })

      setOpen(false)
      resetForm()
      await loadProducts()
    } catch (e) {
      console.error(e)
      setError('تعذّر حفظ المنتج')
    }
  }

  const handleDelete = async (p) => {
    if (!confirm(`حذف المنتج: ${p.name}?`)) return
    try {
      await deleteDoc(doc(db, 'products', p.id))
      await loadProducts()
    } catch (e) {
      console.error(e)
      setError('تعذّر حذف المنتج')
    }
  }

  const nameById = (id) => products.find(x => x.id === id)?.name || '—'

  return (
    <div>
      <h2>المنتجات</h2>

      <div className="admin-card" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
        <span>إدارة المنتجات (إضافة/تعديل/حذف)</span>
        <button className="admin-button" onClick={openAdd}>إضافة منتج</button>
      </div>

      {error && <div className="admin-error" style={{marginTop:12}}>{error}</div>}

      {loading ? (
        <div className="admin-card" style={{marginTop:12}}>جار التحميل...</div>
      ) : (
        <div className="admin-card" style={{marginTop:12, overflowX:'auto'}}>
          <table className="admin-table" style={{width:'100%'}}>
            <thead>
              <tr>
                <th>الصورة</th>
                <th>الاسم</th>
                <th>العملة</th>
                <th>من</th>
                <th>المسارات (إلى → معدل)</th>
                <th>مفعل؟</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td style={{minWidth:64}}>
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{height:40}}/> : '—'}
                  </td>
                  <td>{p.name}</td>
                  <td>{p.currency}</td>
                  <td>{nameById(p.fromId)}</td>
                  <td style={{maxWidth:360}}>
                    {(Array.isArray(p.routes) ? p.routes : []).map((r, idx) => (
                      <span key={idx} className="admin-chip">
                        {nameById(r.toId)} <span className="admin-chip-meta">({r.rate ?? 0})</span>
                      </span>
                    ))}
                    {(!p.routes || p.routes.length === 0) && '—'}
                  </td>
                  <td>{p.active ? 'نعم' : 'لا'}</td>
                  <td>
                    <button className="admin-button" onClick={() => openEdit(p)} style={{marginInlineEnd:8}}>تعديل</button>
                    <button className="admin-logout" onClick={() => handleDelete(p)}>حذف</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="7" style={{textAlign:'center',padding:'16px'}}>لا توجد منتجات بعد.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <>
          <div className="admin-backdrop" onClick={() => { setOpen(false); resetForm() }} />
          <div className="admin-modal" role="dialog" aria-modal="true">
            <div className="admin-modal-header">
              <h3>{editing ? 'تعديل منتج' : 'إضافة منتج'}</h3>
              <button className="admin-close" onClick={() => { setOpen(false); resetForm() }}>×</button>
            </div>

            <form className="admin-form-grid" onSubmit={handleSave}>
              <label>اسم المنتج</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />

              <label>العملة</label>
              <input value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} placeholder="مثال: TND, USD, BTC" />

              <label>من</label>
              <select value={form.fromId} onChange={e => setForm({...form, fromId: e.target.value})}>
                <option value="">—</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>

              <label>المسارات (إلى + المعدل)</label>
              <div style={{display:'grid', gap:10}}>
                {form.routes.map((r, idx) => (
                  <div key={idx} style={{display:'grid', gridTemplateColumns:'2fr 1fr auto', gap:8}}>
                    <select value={r.toId} onChange={e => setRouteField(idx, 'toId', e.target.value)}>
                      <option value="">—</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" step="0.00000001" value={r.rate} onChange={e => setRouteField(idx, 'rate', e.target.value)} placeholder="المعدل" />
                    <button type="button" className="admin-logout" onClick={() => removeRouteRow(idx)}>حذف</button>
                  </div>
                ))}
                <button type="button" className="admin-button" onClick={addRouteRow}>إضافة مسار</button>
              </div>

              <label>مفعل؟</label>
              <select value={form.active ? '1' : '0'} onChange={e => setForm({...form, active: e.target.value === '1'})}>
                <option value="1">نعم</option>
                <option value="0">لا</option>
              </select>

              {useCloudinary ? (
                <>
                  <label>الصورة (رفع عبر Cloudinary)</label>
                  <input type="file" accept="image/*" onChange={e => setForm({...form, imageFile: e.target.files?.[0] || null})} />
                </>
              ) : (
                <>
                  <label>رابط الصورة (Image URL)</label>
                  <input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://..." />
                </>
              )}

              <div style={{display:'flex', gap:8, marginTop:8}}>
                <button className="admin-button" type="submit">{editing ? 'حفظ التعديلات' : 'حفظ المنتج'}</button>
                <button type="button" className="admin-logout" onClick={() => { setOpen(false); resetForm() }}>إلغاء</button>
              </div>

              {error && <div className="admin-error">{error}</div>}
            </form>
          </div>
        </>
      )}
    </div>
  )
}
