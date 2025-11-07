import React from 'react';

/*
يعرض آخر 10 معاملات فقط — يعتمد على استعلام Firestore محدود حسب التاريخ.
لكل معاملة صورة اللوجو، المبلغ، من -> إلى، تاريخ.
*/
export default function Transactions({ items = [] as any[] }) {
  return (
    <div className="max-w-4xl mx-auto my-8 space-y-3">
      {items.map((tx, i) => (
        <div key={i} className="flex items-center gap-4 p-3 bg-white rounded shadow-sm">
          <img src={tx.logo || '/logo-placeholder.png'} className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <div className="font-medium">{tx.user} حول {tx.amount} {tx.from} → {tx.to}</div>
            <div className="text-sm text-gray-400">{tx.date}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
