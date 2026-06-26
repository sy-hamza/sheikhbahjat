# موقع الشيخ عامر بهجت — الأرشيف الرقمي الرسمي

<div align="center">

**الموقع الرسمي والأرشيف الرقمي الشامل للشيخ عامر بهجت**

</div>

---

## 🏗️ مكدس التقنيات

| الطبقة | التقنية |
|--------|---------|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Backend** | FastAPI (Python) |
| **Database** | SQLite + SQLAlchemy |
| **Auth** | JWT (HttpOnly cookies) + bcrypt |
| **Security** | CSRF, Rate Limiting, XSS Prevention, Security Headers |

## 📁 هيكل المشروع

```
bahjat/
├── backend/          # FastAPI Backend
│   ├── app/
│   │   ├── models/   # SQLAlchemy ORM models
│   │   ├── schemas/  # Pydantic validation
│   │   ├── routers/  # API endpoints
│   │   ├── security/ # JWT, CSRF, sanitization
│   │   └── middleware/# Security headers, rate limiting
│   ├── seed_data.py  # Database seeding
│   └── requirements.txt
│
├── frontend/         # Next.js Frontend
│   └── src/
│       ├── app/      # Pages (App Router)
│       ├── components/ # Reusable components
│       └── lib/      # API client, utilities
│
└── README.md
```

## 🚀 البدء السريع

### المتطلبات
- **Node.js** >= 18
- **Python** >= 3.10
- **npm** أو **yarn**

### 1. إعداد الـ Backend

```bash
cd backend

# إنشاء بيئة افتراضية
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# تثبيت المكتبات
pip install -r requirements.txt

# تهيئة قاعدة البيانات مع بيانات تجريبية
python seed_data.py

# تشغيل الخادم
uvicorn app.main:app --reload --port 8000
```

### 2. إعداد الـ Frontend

```bash
cd frontend

# تثبيت المكتبات
npm install

# تشغيل خادم التطوير
npm run dev
```

### 3. فتح الموقع
- **الموقع**: http://localhost:3000
- **لوحة التحكم**: http://localhost:3000/admin/login
- **API Docs**: http://localhost:8000/api/docs

### بيانات الدخول للوحة التحكم
```
اسم المستخدم: admin
كلمة المرور: Admin@12345
```

## 🔒 الأمان

- ✅ JWT في HttpOnly Cookies
- ✅ تشفير كلمات المرور بـ bcrypt
- ✅ حماية CSRF (Double Submit Cookie)
- ✅ تعقيم المدخلات (XSS Prevention)
- ✅ Rate Limiting (خاصة على تقديم الأسئلة)
- ✅ Security Headers (CSP, X-Frame-Options, HSTS)
- ✅ SQLAlchemy ORM (SQL Injection Prevention)
- ✅ Pydantic Validation (Strict Input Validation)

## 📋 الميزات

- 🏠 صفحة رئيسية تفاعلية مع Hero Section
- 📂 أرشيف رقمي ذكي بنظام مجلدات هرمي
- 📚 عرض كتب ثلاثي الأبعاد مع PDF Viewer
- 🎵 منظومات مع مشغل صوتي مخصص وعرض ثنائي
- ❓ بوابة أسئلة وفتاوى مع بحث فوري
- 🔐 لوحة تحكم إدارية محمية
- 🌙 وضع مظلم/فاتح
- 📱 تصميم متجاوب بالكامل
- 🎨 حركات سلسة مع Framer Motion
