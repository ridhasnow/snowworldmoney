import React from 'react'
import '../styles/Headers.css'

export default function Header() {
  const logoUrl = import.meta.env.VITE_LOGO_URL // إذا غير مُعرّف، اللوغو لن يظهر

  return (
    <div className="header-banner">
      <div className="header-content">
        <h1 className="header-title">
          مرحباً بكم في الموقع الرسمي الأول في تونس للتحويل الرقمي
        </h1>

        {/* مكان ثابت لشعار الموقع في أقصى اليمين (اختياري) */}
        {logoUrl && (
          <img
            className="header-logo"
            src={logoUrl}
            alt="شعار الموقع"
            loading="lazy"
          />
        )}
      </div>
    </div>
  )
}
