import React from 'react';

/*
مودال تسجيل/دخول عصري مع animation.
ربطه بـ Firebase Auth في الوقت الفعلي.
*/
export default function AuthModal({ open, onClose }: { open: boolean; onClose: ()=>void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md animate-fade">
        <button className="float-right" onClick={onClose}>✕</button>
        <h3 className="text-xl font-semibold mb-4">تسجيل / دخول</h3>
        {/* هنا تضع فورم الايميل والبيانات + forgot password */}
      </div>
      <style jsx>{`
        .animate-fade { animation: fadeIn .2s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  );
}
