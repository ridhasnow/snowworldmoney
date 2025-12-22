import React, { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, db } from '../../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { Navigate, useLocation } from 'react-router-dom'

export default function AdminGuard({ children }) {
  const [state, setState] = useState({ loading: true, ok: false })
  const location = useLocation()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ loading: false, ok: false })
        return
      }
      try {
        const snap = await getDoc(doc(db, 'users', user.email))
        const isAdmin = snap.exists() && snap.data()?.role === 'admin'
        if (!isAdmin) {
          await signOut(auth)
        }
        setState({ loading: false, ok: isAdmin })
      } catch {
        setState({ loading: false, ok: false })
      }
    })
    return () => unsub()
  }, [])

  if (state.loading) {
    return <div className="admin-loading">...جار التحميل</div>
  }

  if (!state.ok) {
    return <Navigate to="/admin" replace state={{ from: location }} />
  }

  return children
}
