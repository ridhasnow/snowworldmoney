import React from 'react'

export default function Transfers() {
  // لاحقاً: قراءة آخر 50 عملية من Firestore مع صفحة/صفحات (pagination)
  // الحقول: userEmail, items[], txId, status, note, proofUrl, receivingAccount, createdAt, updatedAt
  return (
    <div>
      <h2>طلبات التحويلات</h2>
      <div className="admin-card">سيتم عرض الطلبات هنا مع التحكم في الحالة والملاحظات والمعاينة.</div>
    </div>
  )
}
