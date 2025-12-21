// إعدادات الواجهة: نقرأ رابط اللوجو من متغيّر بيئة VITE_LOGO_URL
// إذا لم يكن مضبوط، نخليه فارغ ونخفي اللوجو تلقائياً في الواجهة.
const siteConfig = {
  logoUrl: import.meta.env.VITE_LOGO_URL || '',
}

export default siteConfig
