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

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(query(productsCol, orderBy('updatedAt', 'desc'), limit(200)))
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setProducts(items)

      const d17 = items.find(p => p.name?.toLowerCase().includes('d17')) || items[0]
      const payeer = items.find(p => p.name?.toLowerCase().includes('payeer')) || items[1] || items[0]
      setFromP(d17)
      setToP(payeer)
    }
    load()
  }, [])

  const computeRate = () => {
    if (!fromP || !toP) return { baseFrom: 1, baseTo: 0 }
    const direct = (Array.isArray(fromP.routes) ? fromP.routes : []).find(r => r.toId === toP.id)
    if (direct) return { baseFrom: Number(direct.baseFrom || 1), baseTo: Number(direct.baseTo || 0) }
    const reverse = (Array.isArray(toP.routes) ? toP.routes : []).find(r => r.toId === fromP.id)
    if (reverse) {
      const bf = Number(reverse.baseFrom || 1)
      const bt = Number(reverse.baseTo || 0)
      if (bt > 0) return { baseFrom: 1, baseTo: bf / bt }
    }
    return { baseFrom: 1, baseTo: 0 }
  }

  useEffect(() => {
    const r = computeRate()
    setRate(r)
    setSendAddress(fromP?.sendAddress || '')
  }, [fromP, toP])

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
    if (!u) { setMsg('❌ انتهت الجلسة، سجّل الدخول مجدداً'); return }

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
        sendAddress: fromP.sendAddress || '',
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

            <div className="arrow-box">→</div>

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
              onClick={() => setStep(2)}
            >
              أكمل
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="convert-step">
          <div className="convert-row">
            <label>كمية التحويل:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="أدخل الكمية"
              required
              className="input"
            />
          </div>

          <div className="convert-row">
            <label>القيمة المقابلة:</label>
            <div className="rate-output">
              {calcTo > 0 ? `${calcTo.toFixed(6)} ${toP?.currency}` : 'غير متاحة'}
            </div>
          </div>

          <div className="convert-row">
            <label>عنوان الإرسال:</label>
            <div className="send-address-box">{sendAddress}</div>
          </div>

          <div className="convert-row">
            <label>أدخل عنوان الاستقبال الخاص بك:</label>
            <input
              type="text"
              value={receiveAddress}
              onChange={(e) => setReceiveAddress(e.target.value)}
              placeholder="أدخل ايميل/رقم هاتف/رقم D17 الخاص بك/Payeer ID/إيميل Binance"
              required
              className="input"
            />
          </div>

          <div className="convert-row">
            <label>رفع لقطة الشاشة إثبات الإرسال:</label>
            <input
              type="file"
              onChange={(e) => setProofFile(e.target.files[0])}
              className="input"
            />
          </div>

          <div className="convert-row">
            <label>ID Transaction (رقم التحويل):</label>
            <input
              type="text"
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder="رقم التحويل"
              required
              className="input"
            />
          </div>

          <div className="convert-actions">
            <button className="user-button" onClick={() => validateStep2() && setStep(3)}>عرض الطلب</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="convert-step">
          <h2>تفاصيل الطلب</h2>
          <div className="convert-summary">
            <p><strong>الكمية:</strong> {amount} {fromP?.currency}</p>
            <p><strong>القيمة المقابلة:</strong> {calcTo.toFixed(6)} {toP?.currency}</p>
            <p><strong>الإرسال إلى:</strong> {sendAddress}</p>
            <p><strong>عنوان الاستقبال:</strong> {receiveAddress}</p>
            <p><strong>ID Transaction:</strong> {txId}</p>
            {proofFile && <p><strong>إثبات الإرسال:</strong> صورة مرفوعة</p>}
          </div>
          <div className="convert-actions">
            <button className="user-button" onClick={() => setStep(2)}>تعديل</button>
            <button className="user-button secondary" onClick={() => setStep(1)}>إلغاء</button>
            <button className="user-button success" onClick={submitTransfer}>إرسال الطلب</button>
          </div>
        </div>
      )}
    </div>
  )
}
