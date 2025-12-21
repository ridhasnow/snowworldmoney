import React from 'react'
import '../styles/Headers.css'
import siteConfig from '../config/siteConfig'

export default function Header() {
  return (
    <div className="header-banner">
      <div className="header-content">
        <h1 className="header-title">
          مرحباً بكم في الموقع الرسمي الأول في تونس للتحويل الرقمي
        </h1>

        {/* نعرض اللوجو فقط إذا فيه رابط مضبوط */}
        {siteConfig.logoUrl && (
          <img
            className="header-logo"
            src={siteConfig.logoUrl}
            alt="شعار الموقع"
            loading="lazy"
          />
        )}
      </div>
    </div>
  )
}
