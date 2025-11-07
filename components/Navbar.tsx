import React from 'react';

/*
شريط علوي أبيض غامق فيه مربع "online" ونقطة خضراء تنبض، و7/7 24/24
*/
export default function Navbar() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-gray-900 text-white rounded-md flex items-center gap-2">
            <span className="text-sm">online</span>
            <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          </div>
          <div className="text-sm text-gray-600">7/7 24/24</div>
        </div>
        <div className="flex items-center gap-3">
          {/* هنا توضع أزرار تسجيل/بروفايل/رصيد */}
          <button className="text-sm px-3 py-1 rounded-md">دخول</button>
        </div>
      </div>
    </header>
  );
}
