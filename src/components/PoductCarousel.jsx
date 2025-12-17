import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import '../styles/ProductCarousel.css'

export default function ProductCarousel() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'))
        const productsArray = []
        querySnapshot.forEach((doc) => {
          productsArray.push({ id: doc.id, ... doc.data() })
        })
        setProducts(productsArray)
      } catch (error) {
        console.error('خطأ في جلب المنتجات:', error)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div className="carousel-container">
      <div className="carousel-track">
        {[...products, ...products].map((product, index) => (
          <div key={index} className="carousel-item">
            <div className="product-circle">
              <img src={product.image || 'placeholder.jpg'} alt={product. name} />
              <p>{product.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
