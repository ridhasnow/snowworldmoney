import React from 'react'
import '../styles/Header.css'
import logo from '../assets/logo.png' // استيراد الشعار من الكود

export default function Header() {
  return (
    <div className="header-banner">
      <div className="header-content">
        <h1 className="header-title">
          مرحباً بكم في الموقع الرسمي الأول في تونس للتحويل الرقمي
        </h1>

        {/* اللوجو ثابت في أقصى اليمين */}
        <img
          className="header-logo"
          src={logo}
          alt="شعار الموقع"
          loading="lazy"
        />
      </div>
    </div>
  )
}
