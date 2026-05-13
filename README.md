# Sawad

منصة شحن ألعاب وبطاقات رقمية مبنية بـ `React + Vite` للواجهة و`Express` للـ API.

## المجلدات

- `client`: الواجهة الأمامية
- `server`: الخادم وواجهات الـ API

## التشغيل المحلي

ثبّت الاعتمادات ثم شغّل المشروع:

```bash
npm run install:all
npm run dev
```

الروابط المحلية:

- الواجهة: `http://localhost:5173`
- الخادم: `http://localhost:5000`
- لوحة التحكم: `http://localhost:5173/#/admin`
- صفحة العملاء: `http://localhost:5173/#/login`

## متغيرات البيئة

### `server/.env`

```env
PORT=5000
CLIENT_URL=http://localhost:5173,https://your-vercel-domain.vercel.app
ADMIN_EMAIL=admin@sawad.com
ADMIN_PASSWORD=123456
MONGODB_URI=
MONGODB_DB_NAME=sawad
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=sawad/products
```

### `client/.env`

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_API_URL=https://your-render-service.onrender.com/api
VITE_SITE_URL=https://your-vercel-domain.vercel.app
```

## نشر Backend على Render

المشروع يحتوي على ملف [render.yaml](render.yaml) جاهز.

خطوات النشر:

1. اربط المستودع مع Render.
2. اختر `Blueprint` أو أنشئ `Web Service` من نفس المستودع.
3. اجعل `Root Directory` هو `server` إذا أنشأته يدويًا.
4. أضف القيم التالية في بيئة Render:
   - `CLIENT_URL`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `MONGODB_URI`
   - `MONGODB_DB_NAME`
   - `GOOGLE_CLIENT_ID`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
5. يمكن إبقاء `CLOUDINARY_FOLDER` على القيمة الافتراضية `sawad/products`.

الإعدادات المتوقعة:

- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`

بعد النشر، تأكد أن `/api/health` يرجع:

```json
{
  "status": "ok",
  "service": "sawad-api",
  "storage": {
    "driver": "mongodb"
  }
}
```

إذا ظهر `json` بدل `mongodb` فهذا يعني أن `MONGODB_URI` غير مضبوط.

## نشر Frontend على Vercel

المشروع يحتوي على ملف [client/vercel.json](client/vercel.json) لدعم الـ SPA routes.

خطوات النشر:

1. اربط المستودع مع Vercel.
2. اختر `Root Directory` = `client`.
3. أضف متغيرات البيئة التالية:
   - `VITE_API_URL`
   - `VITE_SITE_URL`
   - `VITE_GOOGLE_CLIENT_ID`

القيم المقترحة:

```env
VITE_API_URL=https://your-render-service.onrender.com/api
VITE_SITE_URL=https://your-vercel-domain.vercel.app
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

## ربط Google Login

من Google Cloud Console:

- أضف في `Authorized JavaScript origins`:
  - `http://localhost:5173`
  - `https://your-vercel-domain.vercel.app`

واستخدم نفس `Client ID` في:

- `server/.env`
- `client/.env`

## ربط MongoDB

أفضل خيار للنشر هو `MongoDB Atlas`.

ضع رابط الاتصال في:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB_NAME=sawad
```

السيرفر يدعم:

- MongoDB تلقائيًا إذا وُجد `MONGODB_URI`
- fallback إلى `db.json` إذا لم يوجد

وعند أول تشغيل مع MongoDB سيجري استيراد البيانات الحالية من `server/src/data/db.json` مرة واحدة إذا كانت قاعدة البيانات فارغة.

## Cloudinary

رفع صور المنتجات يعتمد على Cloudinary من خلال:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER`

## ملاحظات مهمة قبل الإطلاق

- غيّر بيانات دخول الإدارة الافتراضية.
- تأكد أن `CLIENT_URL` في السيرفر يساوي رابط Vercel النهائي.
- تأكد أن `VITE_API_URL` في الواجهة يساوي رابط Render النهائي.
- لا ترفع ملفات `.env` الحقيقية إلى GitHub.
- إذا كنت تستخدم MongoDB في الإنتاج، فملف `db.json` يصبح فقط نسخة seed / fallback وليس قاعدة الإنتاج الأساسية.
