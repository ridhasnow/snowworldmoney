import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import '../styles/Statistics.css'

export default function Statistics() {
  const [userCount, setUserCount] = useState(0)
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'))
        setUserCount(usersSnapshot.size)

        const transactionsSnapshot = await getDocs(
          query(collection(db, 'transactions'), orderBy('date', 'desc'), limit(10))
        )
        const transactionsArray = []
        transactionsSnapshot.forEach((doc) => {
          transactionsArray.push(doc.data())
        })
        setTransactions(transactionsArray)
      } catch (error) {
        console.error('خطأ في جلب الإحصائيات:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="statistics-container">
      <div className="stat-box">
        <h3>عدد المستخدمين</h3>
        <p className="stat-number">{userCount}</p>
      </div>

      <div className="transactions-box">
        <h3>آخر 10 عمليات تحويل</h3>
        <ul className="transactions-list">
          {transactions.map((transaction, index) => (
            <li key={index}>
              {transaction.from} → {transaction.to} | {transaction.amount}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
