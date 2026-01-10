import React, { useEffect, useMemo, useState } from 'react'
import { auth, db } from '../../firebase'
import {
  collection, addDoc, doc, getDocs, getDoc, query, orderBy, limit, serverTimestamp
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

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(query(productsCol, orderBy('updatedAt', 'desc'), limit(200)))
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setProducts(items)

      // اختيار افتراضي عشوائي بين D17 و Payeer إن وجدت
      const d17 = items.find(p => p.name?.toLowerCase().includes('d17')) || items[0]
      const payeer = items.find(p => p.name?.toLowerCase().includes('payeer')) || items[1] || items[0]
      setFromP(d17)
      setToP(payeer)
    }
    load()
  }, [])

  // إيجاد التعريفة من "fromP.routes" أو قلبها من "toP.routes"
  const computeRate = () => {
    if (!fromP || !toP) return { baseFrom: 1, baseTo: 0 }
    const direct = (Array.isArray(fromP.routes) ? fromP.routes : []).find(r => r.toId === toP.id)
    if (direct) return { baseFrom: Number(direct.baseFrom || 1), baseTo: Number(direct.baseTo || 0) }
    const reverse = (Array.isArray(toP.routes) ? toP.routes : []).find(r => r.toId === fromP.id)
    if (reverse) {
      const bf = Number(reverse.baseFrom || 1)
      const bt = Number(reverse.baseTo || 0)
      // إذا التعريفة من "to → from" نقلبها: 1 from = (bf/bt) to
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
    // amount * (baseTo/baseFrom)
    setCalcTo(a * (rate.baseTo / rate.baseFrom))
  }, [amount, rate])

  const openPicker = (which) => {
    const list = prompt('اكتب اسم المنتج الذي تريد اختياره (كما هو ظاهر في القائمة):')
    if (!list) return
    const p = products.find(x => x.name?.toLowerCase() === list.toLowerCase())
    if (!p) { alert('لم يتم العثور على المنتج'); return }
    which === 'from' ? setFromP(p) : setToP(p)
  }

  const submitTransfer = async () => {
    try {
      let proofLink = proofUrl
      let cloudPublicId = ''

      if (useCloudinary && proofFile) {
        const up = await uploadImageToCloudinary(proofFile)
        proofLink = up.url
        cloudPublicId = up.public_id
      }

      const docRef = await addDoc(collection(db, 'transfers'), {
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
      <h2>التحويل بين المنتجات</h2>
      {msg && <div className="user-info">{msg}</div>}

      {step === 1 && (
        <div className="convert-step">
          <div className="convert-row">
            <div className="product-box">
              <div className="product-title">من</div>
              <div className="product-main">
                <div className="product-logo">{fromP?.imageUrl ? <img src={fromP.imageUrl} /> : '—'}</div>
                <div className="product-name">{fromP?.name || '—'}</div>
              </div>
              <button className="user-button" onClick={() => openPicker('from')}>تغيير الاختيار</button>
            </div>

            <div className="arrow-box">→</div>

            <div className="product-box">
              <div className="product-title">إلى</div>
              <div className="product-main">
                <div className="product-logo">{toP?.imageUrl ? <img src={toP.imageUrl} /> : '—'}</div>
                <div className="product-name">{toP?.name || '—'}</div>
              </div>
              <button className="user-button" onClick={() => openPicker('to')}>تغيير الاختيار</button>
            </div>
          </div>

          <div className="rate-info">
            {rate.baseTo > 0
              ? <>التعريفة: 1 {fromP?.currency} = {rate.baseTo / rate.baseFrom} {toP?.currency}</>
              : <>لا توجد تعريفة متاحة بين المنتجين</>}
          </div>

          <div className="convert-actions">
            <button className="user-button" disabled={!fromP || !toP || rate.baseTo === 0}
                    onClick={() => setStep(2)}>
              أكمل
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="convert-step">
          <label>الكمية المراد تحويلها ({fromP?.currency})</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
          <div className="rate-info">
            يقابلها تقريباً: <strong>{calcTo.toFixed(6)} {toP?.currency}</strong>
          </div>

          <label>أرسل المبلغ المطلوب إلى العنوان التالي</label>
          <div className="send-address-box">{fromP?.sendAddress || '—'}</div>
          <div className="note">
            بعد تحويلك خارج الموقع إلى هذا العنوان، اضغط التالي لإكمال الطلب.
          </div>

          <div className="convert-actions">
            <button className="user-button" onClick={() => setStep(1)}>رجوع</button>
            <button className="user-button" disabled={!amount || Number(amount) <= 0} onClick={() => setStep(3)}>التالي</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="convert-step">
          <label>ID Transaction</label>
          <input value={txId} onChange={e => setTxId(e.target.value)} placeholder="معرف العملية" />

          {useCloudinary ? (
            <>
              <label>إضافة صورة إثبات (لقطة شاشة)</label>
              <input type="file" accept="image/*" onChange={e => setProofFile(e.target.files?.[0] || null)} />
            </>
          ) : (
            <>
              <label>رابط صورة الإثبات</label>
              <input value={proofUrl} onChange={e => setProofUrl(e.target.value)} placeholder="https://..." />
            </>
          )}

          <label>عنوان الاستقبال لديك</label>
          <input value={receiveAddress} onChange={e => setReceiveAddress(e.target.value)}
                 placeholder="اكتب عنوان الاستقبال حسب المنتج المختار (ID/محفظة/هاتف/إيميل...)" />

          <div className="note">
            ملاحظة: أدخل المعرف الصحيح للعملية وارفع صورة واضحة، ثم اكتب عنوان الاستقبال الخاص بك
            بدقة حسب المنتج المستهدف. سيتم مراجعة الطلب من الأدمن وإتمام العملية.
          </div>

          <div className="convert-actions">
            <button className="user-button" onClick={() => setStep(1)}>إلغاء</button>
            <button className="user-button" onClick={submitTransfer}>إرسال الطلب</button>
          </div>
        </div>
      )}
    </div>
  )
}
