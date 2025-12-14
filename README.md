# 🚀 دليل تشغيل Twitter Scheduler - خطوة بخطوة

> **آخر تحديث:** ديسمبر 2024
> **الإصدار:** 1.0.0

---

## 📋 جدول المحتويات

1. [المتطلبات](#المتطلبات)
2. [التثبيت السريع](#التثبيت-السريع)
3. [الإعداد التفصيلي](#الإعداد-التفصيلي)
4. [التشغيل](#التشغيل)
5. [الحصول على API Keys](#الحصول-على-api-keys)
6. [حل المشاكل](#حل-المشاكل)
7. [الأسئلة الشائعة](#الأسئلة-الشائعة)

---

## 🔧 المتطلبات

### البرامج الأساسية:

```bash
✅ Node.js >= 18.0.0
✅ npm >= 9.0.0
✅ PostgreSQL >= 14.0
✅ Redis >= 6.0
✅ Git (اختياري)
```

### التحقق من التثبيت:

```bash
node --version    # يجب أن يظهر v18.x.x أو أحدث
npm --version     # يجب أن يظهر 9.x.x أو أحدث
psql --version    # يجب أن يظهر psql 14.x أو أحدث
redis-cli ping    # يجب أن يرد PONG
```

### إذا لم تكن مثبتة:

#### على macOS:
```bash
# تثبيت Homebrew (إذا لم يكن مثبت)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# تثبيت المتطلبات
brew install node
brew install postgresql@14
brew install redis
```

#### على Linux (Ubuntu/Debian):
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL
sudo apt install postgresql postgresql-contrib

# Redis
sudo apt install redis-server
```

#### على Windows:
```bash
# قم بتحميل وتثبيت:
- Node.js: https://nodejs.org/
- PostgreSQL: https://www.postgresql.org/download/windows/
- Redis: https://github.com/microsoftarchive/redis/releases
```

---

## ⚡ التثبيت السريع (5 دقائق)

### 1. فك ضغط الملفات:

```bash
# فك ضغط الملف
unzip twitter-scheduler.zip
cd twitter-scheduler
```

### 2. تشغيل السكريبت التلقائي:

```bash
# امنح صلاحية التنفيذ
chmod +x setup.sh

# شغّل السكريبت
./setup.sh
```

**السكريبت سيقوم بـ:**
- ✅ تثبيت مكتبات Backend
- ✅ تثبيت مكتبات Frontend
- ✅ إنشاء قاعدة البيانات
- ✅ تنفيذ الـ Schema
- ✅ نسخ ملفات البيئة

### 3. تشغيل التطبيق:

```bash
# افتح 3 نوافذ Terminal:

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Worker
cd backend
npm run worker

# Terminal 3 - Frontend
cd frontend
npm run dev
```

### 4. افتح المتصفح:

```
http://localhost:3000
```

---

## 📝 الإعداد التفصيلي

### الخطوة 1: إعداد Backend

```bash
cd backend

# تثبيت المكتبات
npm install

# نسخ ملف البيئة
cp .env.example .env

# تعديل ملف .env
nano .env
```

#### محتوى .env (مهم جداً):

```env
# ═══════════════════════════════════════
# Server Configuration
# ═══════════════════════════════════════
PORT=5000
NODE_ENV=development

# ═══════════════════════════════════════
# Database Configuration
# ═══════════════════════════════════════
# عدّل username و password حسب إعداداتك
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/twitter_scheduler

# ═══════════════════════════════════════
# Redis Configuration
# ═══════════════════════════════════════
REDIS_URL=redis://localhost:6379

# ═══════════════════════════════════════
# JWT Configuration
# ═══════════════════════════════════════
# 🔴 مهم جداً: غيّر هذا في الإنتاج!
JWT_SECRET=your-super-secret-jwt-key-CHANGE-THIS-IN-PRODUCTION
JWT_EXPIRES_IN=7d

# ═══════════════════════════════════════
# Twitter API Configuration
# ═══════════════════════════════════════
# احصل عليها من: https://developer.twitter.com
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_BEARER_TOKEN=your_bearer_token
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret
TWITTER_CALLBACK_URL=http://localhost:5000/api/auth/twitter/callback

# ═══════════════════════════════════════
# OpenAI API Configuration
# ═══════════════════════════════════════
# احصل عليها من: https://platform.openai.com
OPENAI_API_KEY=sk-your-openai-api-key

# ═══════════════════════════════════════
# Cloudinary Configuration
# ═══════════════════════════════════════
# احصل عليها من: https://cloudinary.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# ═══════════════════════════════════════
# Frontend URL
# ═══════════════════════════════════════
FRONTEND_URL=http://localhost:3000
```

---

### الخطوة 2: إعداد قاعدة البيانات

#### أ) تشغيل PostgreSQL:

```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# شغّل من Start Menu → PostgreSQL
```

#### ب) إنشاء قاعدة البيانات:

```bash
# الدخول إلى PostgreSQL
psql -U postgres

# في PostgreSQL prompt:
CREATE DATABASE twitter_scheduler;

# تأكد من الإنشاء
\l

# اتصل بالقاعدة
\c twitter_scheduler

# الخروج
\q
```

#### ج) تنفيذ Schema:

```bash
# من المجلد الرئيسي
psql -U postgres -d twitter_scheduler -f database/schema.sql

# تحقق من نجاح العملية
psql -U postgres -d twitter_scheduler -c "\dt"

# يجب أن ترى 11 جدول:
# - users
# - twitter_accounts
# - scheduled_tweets
# - threads
# - thread_tweets
# - tweet_analytics
# - follower_insights
# - repost_rules
# - media_library
# - ai_usage
# - ai_preferences
```

---

### الخطوة 3: إعداد Redis

```bash
# تشغيل Redis
# macOS
brew services start redis

# Linux
sudo systemctl start redis

# Windows
redis-server

# اختبار Redis
redis-cli ping
# يجب أن يرد: PONG
```

---

### الخطوة 4: إعداد Frontend

```bash
cd frontend

# تثبيت المكتبات
npm install

# نسخ ملف البيئة
cp .env.local.example .env.local

# تعديل إذا لزم الأمر
nano .env.local
```

#### محتوى .env.local:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Frontend URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🎯 التشغيل

### الطريقة 1: تشغيل يدوي (للتطوير)

افتح 3 نوافذ Terminal:

#### Terminal 1 - Backend Server:
```bash
cd backend
npm run dev

# يجب أن ترى:
# ✅ Connected to PostgreSQL database
# ✅ Connected to Redis
# 🚀 Server is running on port 5000
```

#### Terminal 2 - Background Worker:
```bash
cd backend
npm run worker

# يجب أن ترى:
# ✅ Connected to PostgreSQL database
# ✅ Connected to Redis
# 🔄 Tweet worker is running...
```

#### Terminal 3 - Frontend:
```bash
cd frontend
npm run dev

# يجب أن ترى:
# ✓ Ready in 2.5s
# ○ Local: http://localhost:3000
```

---

### الطريقة 2: تشغيل بـ Docker (الأسهل)

```bash
# من المجلد الرئيسي
docker-compose up -d

# للإيقاف
docker-compose down

# لرؤية الـ Logs
docker-compose logs -f
```

---

### الطريقة 3: تشغيل بـ PM2 (للإنتاج)

```bash
# تثبيت PM2
npm install -g pm2

# تشغيل Backend
cd backend
pm2 start npm --name "twitter-backend" -- run start

# تشغيل Worker
pm2 start npm --name "twitter-worker" -- run worker

# تشغيل Frontend
cd ../frontend
pm2 start npm --name "twitter-frontend" -- run start

# عرض الحالة
pm2 status

# عرض الـ Logs
pm2 logs

# إيقاف الكل
pm2 stop all
```

---

## 🔐 الحصول على API Keys

### 1️⃣ Twitter API Keys

#### الخطوة 1: إنشاء حساب مطور
1. اذهب إلى: https://developer.twitter.com
2. سجل دخول بحسابك على Twitter
3. اضغط "Sign up for Free Account"
4. املأ المعلومات المطلوبة

#### الخطوة 2: إنشاء Project و App
1. من Dashboard → "Create Project"
2. اختر اسم المشروع: "Twitter Scheduler"
3. اختر Use Case: "Making a bot"
4. أدخل وصف المشروع
5. اضغط "Create App"

#### الخطوة 3: الحصول على Keys
1. من صفحة الـ App → "Keys and tokens"
2. احفظ:
   - **API Key**
   - **API Secret Key**
   - **Bearer Token**

#### الخطوة 4: تفعيل OAuth 2.0
1. من App Settings → "User authentication settings"
2. اضغط "Set up"
3. فعّل "OAuth 2.0"
4. Callback URL: `http://localhost:5000/api/auth/twitter/callback`
5. Website URL: `http://localhost:3000`
6. احفظ **Client ID** و **Client Secret**

#### الخطوة 5: الاشتراك في خطة
- **Free**: محدود (للتجربة فقط)
- **Basic**: $100/شهر (3,000 تغريدة/شهر)
- **Pro**: $5,000/شهر (للمشاريع الكبيرة)

**للبداية:** استخدم Free tier للتجربة

---

### 2️⃣ OpenAI API Key

#### الخطوة 1: إنشاء حساب
1. اذهب إلى: https://platform.openai.com
2. اضغط "Sign up"
3. أكمل التسجيل

#### الخطوة 2: إضافة رصيد
1. من القائمة → "Billing"
2. أضف بطاقة ائتمان
3. أضف رصيد ($5 كافي للبداية)

#### الخطوة 3: إنشاء API Key
1. من القائمة → "API keys"
2. اضغط "Create new secret key"
3. احفظ الـ Key (لن تظهر مرة أخرى!)

**التكلفة المتوقعة:** $0.002 لكل 1000 token (حوالي $20-50/شهر)

---

### 3️⃣ Cloudinary

#### الخطوة 1: إنشاء حساب
1. اذهب إلى: https://cloudinary.com
2. اضغط "Sign up for free"
3. أكمل التسجيل

#### الخطوة 2: الحصول على Keys
1. من Dashboard
2. احفظ:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

**الخطة المجانية:** 25 GB storage + 25 GB bandwidth

---

## 🧪 الاختبار

### اختبار Backend:

```bash
# اختبر Health Endpoint
curl http://localhost:5000/health

# يجب أن يرد:
# {"status":"OK","message":"Twitter Scheduler API is running"}
```

### اختبار التسجيل:

```bash
# اختبر API مباشرة
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# يجب أن يرد بـ token و user data
```

### اختبار Frontend:

1. افتح: http://localhost:3000
2. يجب أن ترى صفحة تسجيل دخول
3. سجل حساب جديد
4. يجب أن تنتقل إلى Dashboard

---

## 🐛 حل المشاكل

### المشكلة 1: Backend لا يعمل

```bash
# تحقق من المنافذ المستخدمة
lsof -i :5000

# إذا كان المنفذ محجوز
kill -9 $(lsof -ti:5000)

# أعد تشغيل Backend
cd backend
npm run dev
```

---

### المشكلة 2: Database Connection Error

```bash
# تحقق من تشغيل PostgreSQL
pg_isready

# إذا لم يكن يعمل
brew services restart postgresql  # macOS
sudo systemctl restart postgresql # Linux

# تحقق من صحة DATABASE_URL في .env
# تأكد من username و password صحيحة
```

---

### المشكلة 3: Redis Connection Error

```bash
# تحقق من تشغيل Redis
redis-cli ping

# إذا لم يكن يعمل
brew services restart redis       # macOS
sudo systemctl restart redis      # Linux

# على Windows
redis-server
```

---

### المشكلة 4: Frontend Build Errors

```bash
cd frontend

# احذف وأعد التثبيت
rm -rf .next node_modules package-lock.json
npm install

# أعد التشغيل
npm run dev
```

---

### المشكلة 5: "Module not found"

```bash
# في Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# في Frontend
cd frontend
rm -rf node_modules package-lock.json .next
npm install
```

---

### المشكلة 6: Database Schema Errors

```bash
# أعد إنشاء قاعدة البيانات من الصفر
psql -U postgres

# في PostgreSQL:
DROP DATABASE twitter_scheduler;
CREATE DATABASE twitter_scheduler;
\q

# أعد تنفيذ Schema
psql -U postgres -d twitter_scheduler -f database/schema.sql
```

---

## ❓ الأسئلة الشائعة

### س1: هل يمكن تشغيل التطبيق بدون Twitter API؟
**ج:** نعم! التطبيق يعمل في وضع Demo بدون API Keys. لكن لن يتم النشر الفعلي على Twitter.

### س2: هل OpenAI API إجباري؟
**ج:** لا، لكن بدونه لن يعمل AI Assistant. يمكنك استخدام التطبيق بدون AI.

### س3: ما هي تكلفة APIs الشهرية؟
**ج:** 
- Twitter API: $0 (Free tier) أو $100 (Basic)
- OpenAI API: تقريباً $20-50
- الإجمالي: $20-150/شهر

### س4: هل يمكن استخدام قاعدة بيانات أخرى غير PostgreSQL؟
**ج:** نعم يمكن، لكن تحتاج تعديل الكود. PostgreSQL موصى به بشدة.

### س5: كيف أنشر التطبيق على الإنترنت؟
**ج:** راجع ملف `DEPLOYMENT.md` للتفاصيل الكاملة.

---

## 📞 الدعم

### إذا واجهت مشكلة:

1. **تحقق من Logs:**
   ```bash
   # Backend logs
   cd backend
   npm run dev
   
   # Frontend logs
   cd frontend
   npm run dev
   ```

2. **تحقق من جميع الخدمات:**
   ```bash
   # PostgreSQL
   pg_isready
   
   # Redis
   redis-cli ping
   
   # Backend
   curl http://localhost:5000/health
   ```

3. **أعد تشغيل كل شيء:**
   ```bash
   # أوقف جميع الخدمات (Ctrl+C)
   
   # أعد تشغيل PostgreSQL و Redis
   brew services restart postgresql
   brew services restart redis
   
   # أعد تشغيل Backend و Frontend
   ```

---

## ✅ Checklist النجاح

قبل البدء في الاستخدام، تأكد من:

- [ ] Node.js مثبت (v18+)
- [ ] PostgreSQL يعمل
- [ ] Redis يعمل
- [ ] قاعدة البيانات تم إنشاؤها
- [ ] Schema تم تنفيذه
- [ ] ملفات .env تم إعدادها
- [ ] Backend يعمل (port 5000)
- [ ] Worker يعمل
- [ ] Frontend يعمل (port 3000)
- [ ] يمكن فتح http://localhost:3000
- [ ] يمكن التسجيل والدخول

---

## 🎉 مبروك!

إذا وصلت لهنا والتطبيق يعمل، فأنت جاهز للبدء! 🚀

**الخطوات التالية:**
1. سجل حساب جديد
2. جرب إنشاء تغريدة
3. استخدم AI Assistant
4. استكشف جميع الميزات
5. احصل على Twitter API Keys للنشر الفعلي

---

**استمتع باستخدام Twitter Scheduler! 🎊**
