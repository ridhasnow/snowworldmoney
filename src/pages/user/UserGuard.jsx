import React, { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../firebase'
import { Navigate, useLocation } from 'react-router-dom'

export default function UserGuard({ children }) {
  const [loading, setLoading] = useState(true)
  const [ok, setOk] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setOk(!!user)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  if (loading) return <div className="admin-loading">...جار التحميل</div>
  if (!ok) return <Navigate to="/" replace state={{ from: location }} />
  return children
}
