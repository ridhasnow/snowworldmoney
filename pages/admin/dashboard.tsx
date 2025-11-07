import React from 'react';

/*
لوحة تحكم الأدمن: قوائم التحويلات، تفاصيل عملية (زر عدسة لفتح modal بالتفاصيل)، إضافة/مسح منتجات، إعداد المسارات، إدارة المستخدمين، إرسال إشعارات.
هنا ضع مكونات التحكم والبيانات المسترجعة من Firestore أو Functions.
*/
export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">لوحة التحكم</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2 bg-white p-4 rounded shadow">قائمة التحويلات (قابلة للتصفح بالصفحات)</div>
          <div className="bg-white p-4 rounded shadow">أدوات سريعة: إضافة/مسح منتجات</div>
        </div>
      </div>
    </div>
  );
}
