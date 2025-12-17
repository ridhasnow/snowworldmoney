import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import AuthForm from '../components/AuthForm'
import ProductCarousel from '../components/ProductCarousel'
import Statistics from '../components/Statistics'
import Comments from '../components/Comments'
import '../styles/HomePage.css'

export default function HomePage() {
  return (
    <div className="home-page">
      <Header />
      <AuthForm />
      <ProductCarousel />
      <Statistics />
      <Comments />
    </div>
  )
}
