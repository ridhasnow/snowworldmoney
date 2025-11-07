import React from 'react';

/*
عداد حي للمستخدمين. يجب توصيله بـ Firestore للحصول على عدد الحسابات (live snapshot).
*/
export default function UsersCounter({ count = 0 }: { count?: number }) {
  return (
    <div className="text-center my-6">
      <div className="text-lg font-medium mb-2">المستخدمين الذين يثقون بنا</div>
      <div className="text-4xl font-extrabold text-indigo-600">{count}</div>
    </div>
  );
}
