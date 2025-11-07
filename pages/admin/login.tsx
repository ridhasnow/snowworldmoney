import React from 'react';

/*
صفحة تسجيل دخول الأدمن. لاحقاً اربطها بـ Firebase Admin auth أو تحقق خاص.
ضع هذه الصفحة على /admin/login ثم بعد المصادقة توجه للـ dashboard.
*/
export default function AdminLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl mb-4">دخول الأدمن</h2>
        {/* فورم اسم مستخدم + كلمة مرور */}
      </div>
    </div>
  );
}
