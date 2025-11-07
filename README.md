# مشروع: منصة تحويل منتجات رقمية (Next.js + Firebase)

وصف سريع:
- Next.js + TypeScript + TailwindCSS للواجهة.
- Firebase Auth + Firestore + Storage للباك-إند والبيانات.
- واجهة مستخدم مع: شريط علوي، بانر صورة/فيديو قابل للتكيّف، شريط صور متحرك يعرض المنتجات، مودال تسجيل/دخول أنيق، عداد مستخدمين حي، آراء المستخدمين، قسم آخر المعاملات.
- لوحة أدمن منفصلة على /admin.

تشغيل محلي:
1. انسخ المشروع:
   git clone <repo>
2. انسخ المتغيرات البيئية من .env.example إلى .env.local وعدّل القيم.
3. تثبيت الحزم:
   npm install
4. تشغيل:
   npm run dev
5. افتح http://localhost:3000

متغيرات بيئية مطلوبة (.env.local):
- NEXT_PUBLIC_FIREBASE_API_KEY=...
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
- NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
- NEXT_PUBLIC_FIREBASE_APP_ID=...
- FIREBASE_ADMIN_PRIVATE_KEY=... (للوظائف السيرفرية/أدمن - تعامل بحذر)

ملاحظات أمان وتصميم:
- لا توجد أموال حقيقية في النظام — المستخدم يرسل لإيصال/عنوان تُعرض تفاصيله فقط.
- لوحة الأدمن يجب حمايتها بإضافة قواعد أمان Firebase و/أو استخدام JWT + role checks.
- أضف قواعد Firestore لتقييد عمليات القراءة/الكتابة.
- لاحقاً: إضافة Cloud Functions لمعالجة التغييرات، Webhooks للـStripe إن لجأت للمدفوعات الحقيقية.

ملفات أساسية مقترحة أدناه — كل ملف يحتوي تعليق يوضح مكان التعديلات.
