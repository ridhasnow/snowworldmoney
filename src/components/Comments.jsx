import React, { useState, useEffect } from 'react'
import { db, auth } from '../firebase'
import { collection, getDocs, addDoc, query, orderBy, limit } from 'firebase/firestore'
import '../styles/Comments.css'

export default function Comments() {
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
    })

    const fetchComments = async () => {
      try {
        const commentsSnapshot = await getDocs(
          query(collection(db, 'comments'), orderBy('date', 'desc'), limit(10))
        )
        const commentsArray = []
        commentsSnapshot.forEach((doc) => {
          commentsArray.push(doc.data())
        })
        setComments(commentsArray)
      } catch (error) {
        console.error('خطأ في جلب التعليقات:', error)
      }
    }

    fetchComments()
  }, [])

  const handleAddComment = async (e) => {
    e.preventDefault()
    
    if (!user) {
      alert('يجب تسجيل الدخول أولاً')
      return
    }

    if (!commentText.trim()) return

    try {
      await addDoc(collection(db, 'comments'), {
        text: commentText,
        author: user.email,
        date: new Date(),
      })
      setCommentText('')
      
      const updatedComments = await getDocs(
        query(collection(db, 'comments'), orderBy('date', 'desc'), limit(10))
      )
      const commentsArray = []
      updatedComments.forEach((doc) => {
        commentsArray. push(doc.data())
      })
      setComments(commentsArray)
    } catch (error) {
      console.error('خطأ في إضافة التعليق:', error)
    }
  }

  return (
    <div className="comments-container">
      <h2>التعليقات والآراء</h2>

      {user && (
        <form onSubmit={handleAddComment} className="comment-form">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="اترك تعليقاً..."
            className="comment-input"
          />
          <button type="submit" className="comment-button">إرسال التعليق</button>
        </form>
      )}

      <div className="comments-list">
        {comments. map((comment, index) => (
          <div key={index} className="comment-item">
            <p><strong>{comment.author}</strong></p>
            <p>{comment.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
