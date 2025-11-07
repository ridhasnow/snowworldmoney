import React from 'react';

/*
بانر يأخذ صورة أو فيديو بعرض الشاشة ويضبط الطول تلقائياً.
استخدم background-image أو عنصر <video> حسب المصدر.
*/
export default function Banner({ src, isVideo }: { src?: string; isVideo?: boolean }) {
  return (
    <div className="w-full">
      {isVideo ? (
        <video src={src} className="w-full h-[60vh] object-cover" autoPlay muted loop />
      ) : (
        <div
          className="w-full h-[60vh] bg-center bg-cover"
          style={{ backgroundImage: `url(${src || '/placeholder.jpg'})` }}
        />
      )}
    </div>
  );
}
