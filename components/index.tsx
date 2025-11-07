import React from 'react';
import Navbar from '../components/Navbar';
import Banner from '../components/Banner';
import Carousel from '../components/Carousel';
import UsersCounter from '../components/UsersCounter';
import Testimonials from '../components/Testimonials';
import Transactions from '../components/Transactions';

/*
صفحة الرئيسية: تركيب المكونات الأساسية.
ربط البيانات بـ Firestore في الخطوة التالية.
*/
export default function Home() {
  // لاحقاً: جلب المنتجات/الآراء/المعاملات من Firestore
  const dummyProducts = ['/p1.jpg','/p2.jpg','/p3.jpg','/p4.jpg','/p5.jpg'];
  const dummyTestimonials = [
    { name: 'علي', text:'خدمة ممتازة', date: '2025-11-01', likes: 3, dislikes: 0, photo: '/avatar.png' }
  ];
  const dummyTx = [{ user: 'user1', amount:'10 TND', from:'D17', to:'Payeer', date: '2025-11-06', logo:'/d17.png' }];

  return (
    <div>
      <Navbar />
      <Banner src="/banner.jpg" />
      <div className="max-w-7xl mx-auto px-4">
        <div className="my-6">
          <Carousel items={dummyProducts} />
        </div>

        {/* قسم تسجيل الدخول / إنشاء الحساب -> ستحط هنا مودال AuthModal */}
        <section className="my-8">
          {/* مودال / فورم */}
        </section>

        <UsersCounter count={1234} />

        <section className="my-8">
          <h2 className="text-xl font-semibold mb-4">آراء المستخدمين</h2>
          <Testimonials items={dummyTestimonials} />
        </section>

        <section className="my-8">
          <h2 className="text-xl font-semibold mb-4">آخر المعاملات</h2>
          <Transactions items={dummyTx} />
        </section>
      </div>
    </div>
  );
}
