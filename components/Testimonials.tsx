import React from 'react';

/*
قائمة تعليقات تشبه انستجرام: صورة، اسم، تعليق، تاريخ، like/dislike.
التحكم في القدرة على like/dislike يجب أن يتم بعد التحقق من auth.
*/
export default function Testimonials({ items = [] as any[] }) {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {items.map((t, i) => (
        <div key={i} className="flex gap-3 p-3 bg-white rounded-md shadow-sm">
          <img src={t.photo || '/avatar.png'} className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <div className="flex justify-between">
              <div className="font-semibold">{t.name}</div>
              <div className="text-xs text-gray-400">{t.date}</div>
            </div>
            <p className="mt-1 text-sm">{t.text}</p>
            <div className="flex gap-3 mt-2 text-sm">
              <button>👍 {t.likes}</button>
              <button>👎 {t.dislikes}</button>
            </div>
          </div>
        </div>
      ))}
      {/* زر "المزيد" لعرض تعليقات أقدم */}
    </div>
  );
}
