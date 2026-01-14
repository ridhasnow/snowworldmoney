import React, { useEffect, useMemo, useState } from 'react'
import { auth, db } from '../../firebase'
import {
  collection, addDoc, doc, getDocs, query, orderBy, limit, serverTimestamp
} from 'firebase/firestore'
import uploadImageToCloudinary from '../../utils/uploadImage'
import '../../styles/User.css'

const useCloudinary = import.meta.env.VITE_USE_CLOUDINARY === 'true'

export default function Convert() {
  const u = auth.currentUser
  const [products, setProducts] = useState([])
  const productsCol = useMemo(() => collection(db, 'products'), [db])

  const [fromP, setFromP] = useState(null)
  const [toP, setToP] = useState(null)

  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState('')
  const [sendAddress, setSendAddress] = useState('')

  const [rate, setRate] = useState({ baseFrom: 1, baseTo: 0 }) // 1 من → كم إلى
  const [calcTo, setCalcTo] = useState(0)

  const [txId, setTxId] = useState('')
  const [proofFile, setProofFile] = useState(null)
  const [proofUrl, setProofUrl] = useState('')
  const [receiveAddress, setReceiveAddress] = useState('')
  const [msg, setMsg] = useState('')
  const [showPicker, setShowPicker] = useState({ open: false, target: null }) // المفتاح لتفعيل التوب أب

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

  const submitTransfer = async () => {
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
      setStep(1)
      setAmount('')
      setCalcTo(0)
      setTxId('')
      setProofFile(null)
      setProofUrl('')
      setReceiveAddress('')
    } catch (e) {
      console.error(e)
      setMsg('❌ تعذّر إرسال الطلب، حاول لاحقاً')
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
            {rate.baseTo > 0
              ? <strong>التعريفة: 1 {fromP?.currency} = {(rate.baseTo / rate.baseFrom).toFixed(6)} {toP?.currency}</strong>
              : <span>لا توجد تعريفة متاحة</span>}
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
    </div>
  )
}
