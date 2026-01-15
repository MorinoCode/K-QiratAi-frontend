import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// ایمپورت مستقیم فایل‌های JSON از پوشه src/locales
// مطمئن شو که مسیر فایل‌ها دقیقا همین است
import translationEN from "../public/locales/en/translation.json";
import translationAR from "../public/locales/ar/translation.json";

// تعریف منابع (Resources)
const resources = {
  en: {
    translation: translationEN,
  },
  ar: {
    translation: translationAR,
  },
};

i18n
  .use(initReactI18next) // اتصال i18next به React
  .init({
    resources, // فایل‌های ترجمه که بالا ایمپورت کردیم
    lng: "en", // زبان پیش‌فرض (می‌توانی به 'ar' تغییر دهی)
    fallbackLng: "en", // اگر ترجمه‌ای پیدا نشد، انگلیسی نشان بده
    
    interpolation: {
      escapeValue: false, // React خودش جلوی XSS را می‌گیرد
    },
    
    react: {
        useSuspense: false // جلوگیری از ارورهای لودینگ ناخواسته
    }
  });

export default i18n;