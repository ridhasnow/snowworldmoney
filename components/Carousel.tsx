import React from 'react';

/*
شريط صور متحرك من اليمين لليسار يعرض كل المنتجات (يعتمد على مكتبة slider لاحقاً أو CSS animation).
يجب أن يستمع لتغييرات Firestore لعرض المنتجات المضافة/المحذوفة تلقائياً.
*/
export default function Carousel({ items = [] as string[] }) {
  return (
    <div className="overflow-hidden">
      <div className="flex animate-marquee gap-4 py-4">
        {items.map((src, i) => (
          <img key={i} src={src} className="w-40 h-24 object-cover rounded-md" alt={`item-${i}`} />
        ))}
      </div>

      <style jsx>{`
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
