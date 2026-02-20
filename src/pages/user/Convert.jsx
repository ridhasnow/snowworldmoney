import React, { useEffect, useMemo, useState } from 'react'
import { auth, db } from '../../firebase'
import {
  collection, addDoc, doc, getDocs, query, orderBy, limit, serverTimestamp
} from 'firebase/firestore'
import uploadImageToCloudinary from '../../utils/uploadImage'
import '../../styles/User.css'

const useCloudinary = import.meta.env.VITE_USE_CLOUDINARY === 'true'
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export default function Convert() {
  const [products, setProducts] = useState([])
  const productsCol = useMemo(() => collection(db, 'products'), [db])

  const [fromP, setFromP] = useState(null)
  const [toP, setToP] = useState(null)
  const [step, setStep] = useState(1)

  const [amount, setAmount] = useState('')
  const [sendAddress, setSendAddress] = useState('')
  const [rate, setRate] = useState({ baseFrom: 1, baseTo: 0 })
  const [calcTo, setCalcTo] = useState(0)

  const [receiveAddress, setReceiveAddress] = useState('')
  const [proofFile, setProofFile] = useState(null)
  const [proofUrl, setProofUrl] = useState('')
  const [txId, setTxId] = useState('')

  const [msg, setMsg] = useState('')
  const [showPicker, setShowPicker] = useState({ open: false, target: null })

  // جلب المنتجات وضبط المسار الافتراضي: من Payeer إلى D17
  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(query(productsCol, orderBy('updatedAt', 'desc'), limit(200)))
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setProducts(items)

      const payeer = items.find(p => (p.name || '').toLowerCase().includes('payeer')) || items[0]
      const d17 = items.find(p => (p.name || '').toLowerCase().includes('d17')) || items[1] || items[0]

      setFromP(payeer)
      setToP(d17)
    }
    load()
  }, [])

  const computeRate = () => {
    if (!fromP || !toP) return { baseFrom: 1, baseTo: 0 }

    // ابحث عن مسار مباشر من العملة المُرسِلة إلى المستقبِلة
    const direct = (Array.isArray(fromP.routes) ? fromP.routes : []).find(r => r.toId === toP.id)
    if (direct) {
      return { baseFrom: Number(direct.baseFrom || 1), baseTo: Number(direct.baseTo || 0) }
    }

    // إن لم يوجد، حاول المسار العكسي (نحسب المعكوس)
    const reverse = (Array.isArray(toP.routes) ? toP.routes : []).find(r => r.toId === fromP.id)
    if (reverse) {
      const bf = Number(reverse.baseFrom || 1)
      const bt = Number(reverse.baseTo || 0)
      if (bt > 0) return { baseFrom: 1, baseTo: bf / bt }
    }

    return { baseFrom: 1, baseTo: 0 }
  }

  // تحديث التعريفة وعنوان الإرسال عند تغيير المنتجات
  useEffect(() => {
    const r = computeRate()
    setRate(r)
    setSendAddress(fromP?.sendAddress || '') // عنوان الإرسال هو الخاص بالعملة المُرسِلة (من المنتج)
  }, [fromP, toP])

  // حساب القيمة المقابلة
  useEffect(() => {
    const a = Number(amount || 0)
    if (!a || rate.baseTo === 0) { setCalcTo(0); return }
    setCalcTo(a * (rate.baseTo / rate.baseFrom))
  }, [amount, rate])

  const validateStep2 = () => {
    const u = auth.currentUser
    if (!u) { setMsg('❌ يجب تسجيل الدخول لإرسال الطلب'); return false }
    if (!fromP || !toP) { setMsg('❌ الرجاء اختيار منتجين'); return false }
    if (!amount || Number(amount) <= 0 || rate.baseTo === 0) { setMsg('❌ أدخل كمية صحيحة وتعريفة صالحة'); return false }
    if (!receiveAddress.trim()) { setMsg('❌ أدخل عنوان الاستقبال'); return false }
    if (!txId.trim()) { setMsg('❌ أدخل ID Transaction'); return false }
    if (useCloudinary && proofFile && (!cloudName || !uploadPreset)) {
      setMsg('❌ إعدادات Cloudinary غير مكتملة (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET)')
      return false
    }
    return true
  }

  const submitTransfer = async () => {
    setMsg('')
    if (!validateStep2()) return

    const u = auth.currentUser
    if (!u) { setMsg('❌ انتهت الجلسة، سجّل الدخ��ل مجدداً'); return }

    try {
      let proofLink = proofUrl
      let cloudPublicId = ''

      if (useCloudinary && proofFile) {
        const up = await uploadImageToCloudinary(proofFile)
        proofLink = up.url
        cloudPublicId = up.public_id
      }

      await addDoc(collection(db, 'transfers'), {
        userEmail: u.email,
        fromId: fromP.id,
        fromName: fromP.name,
        fromCurrency: fromP.currency,
        toId: toP.id,
        toName: toP.name,
        toCurrency: toP.currency,
        rateFrom: rate.baseFrom,
        rateTo: rate.baseTo,
        amountFrom: Number(amount),
        amountTo: Number(calcTo),
        sendAddress: fromP.sendAddress || '', // عنوان الإرسال من المنتج المرسل
        receiveAddress,
        txId,
        proofUrl: proofLink || '',
        cloudPublicId,
        status: 'pending',
        createdAt: serverTimestamp()
      })
      setMsg('✅ تم إرسال الطلب بنجاح. سيتم مراجعته من الأدمن.')
      setStep(3)
    } catch (e) {
      console.error('Error while submitting transfer:', e)
      setMsg(`❌ تعذّر إرسال الطلب، حاول لاحقاً`)
    }
  }

  const swapProducts = () => {
    setFromP(toP)
    setToP(fromP)
    setAmount('')
    setCalcTo(0)
    setMsg('')
  }

  return (
    <div className="user-card">
      <h2 className="section-title">التحويل بين المنتجات</h2>
      {msg && <div className="user-info">{msg}</div>}

      {showPicker.open && (
        <div className="product-picker">
          <div className="picker-header">
            <h3>اختيار المنتج</h3>
            <button className="close-picker" onClick={() => setShowPicker({ open: false, target: null })}>✖</button>
          </div>
          <div className="picker-grid">
            {products.map(p => (
              <div
                key={p.id}
                className="picker-item"
                onClick={() => {
                  if (showPicker.target === 'from') setFromP(p)
                  else setToP(p)
                  setShowPicker({ open: false, target: null })
                }}
              >
                <img src={p.imageUrl} alt={p.name} />
                <div>
                  <strong>{p.name}</strong>
                  <span>{p.currency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="convert-step">
          <div className="convert-row">
            <div className="product-box">
              <div className="product-title">من</div>
              <div className="product-main">
                <div className="product-logo">{fromP?.imageUrl ? <img src={fromP.imageUrl} alt="من" /> : '—'}</div>
                <div className="product-name">{fromP?.name || '—'}</div>
              </div>
              <button className="user-button" onClick={() => setShowPicker({ open: true, target: 'from' })}>تغيير الاختيار</button>
            </div>

            <div className="arrow-box" onClick={swapProducts} style={{ cursor: 'pointer' }}>⇄</div>

            <div className="product-box">
              <div className="product-title">إلى</div>
              <div className="product-main">
                <div className="product-logo">{toP?.imageUrl ? <img src={toP.imageUrl} alt="إلى" /> : '—'}</div>
                <div className="product-name">{toP?.name || '—'}</div>
              </div>
              <button className="user-button" onClick={() => setShowPicker({ open: true, target: 'to' })}>تغيير الاختيار</button>
            </div>
          </div>

          <div className="rate-info">
            {rate.baseTo > 0 ? (
              <>
                <span>التعريفة: </span>
                <span className="rate-line" dir="ltr">
                  1 {fromP?.currency} = {(rate.baseTo / rate.baseFrom).toFixed(6)} {toP?.currency}
                </span>
              </>
            ) : (
              <span>لا توجد تعريفة متاحة</span>
            )}
          </div>

          <div className="convert-actions">
            <button
              className="user-button"
              disabled={!fromP || !toP || rate.baseTo === 0}
              onClick={() => { setStep(2); setMsg('') }}
            >
              المتابعة
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="convert-step">
          <label>كمية التحويل:</label>
          <input
            className="input"
            type="number"
            min="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder={`مثال: 10 ${fromP?.currency || ''}`}
          />

          <label>القيمة المقابلة:</label>
          <div className="rate-output">
            {calcTo ? `${calcTo.toFixed(6)} ${toP?.currency || ''}` : '—'}
          </div>

          <label>عنوان الإرسال:</label>
          <div className="send-address-box">
            {sendAddress || '—'}
          </div>

          <label>أدخل عنوان الاستقبال الخاص بك:</label>
          <input
            className="input"
            value={receiveAddress}
            onChange={e => setReceiveAddress(e.target.value)}
            placeholder="عنوان الاستقبال"
          />

          <label>رفع لقطة الشاشة إثبات الإرسال:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProofFile(e.target.files?.[0] || null)}
          />

          <label>ID Transaction (رقم التحويل):</label>
          <input
            className="input"
            value={txId}
            onChange={e => setTxId(e.target.value)}
            placeholder="أدخل رقم التحويل"
          />

          <div className="convert-actions">
            <button className="user-button secondary" onClick={() => setStep(1)}>رجوع</button>
            <button className="user-button" onClick={submitTransfer}>إرسال الطلب</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="convert-step">
          <div className="user-info">✅ تم إرسال الطلب، ستتم مراجعته من الأدمن.</div>
          <button className="user-button" onClick={() => { setStep(1); setAmount(''); setCalcTo(0); setTxId(''); setReceiveAddress(''); setProofFile(null); setProofUrl(''); }}>طلب جديد</button>
        </div>
      )}
    </div>
  )
}
