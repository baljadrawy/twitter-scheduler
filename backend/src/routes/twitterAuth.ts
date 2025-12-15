import express from 'express';
import { TwitterApi } from 'twitter-api-v2';
import { pool } from '../config/database';
import { authenticateUser, AuthRequest } from '../middleware/auth';

const router = express.Router();

// تخزين مؤقت للحالة (State) - في بيئة الإنتاج يفضل استخدام Redis
// المفتاح هو الـ state، والقيمة هي object يحتوي على codeVerifier و userId
const authStates = new Map<string, { codeVerifier: string; userId: string }>();

// 1. بدء عملية الربط (توجيه المستخدم إلى تويتر)
// هذا الرابط يستدعيه الفرونت إند عندما يضغط المستخدم على "ربط حساب تويتر"
router.get('/auth/twitter/link', authenticateUser, async (req: AuthRequest, res) => {
  try {
    // إعداد العميل باستخدام مفاتيح التطبيق فقط
    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });

    // إنشاء رابط المصادقة
    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
      process.env.CALLBACK_URL || 'http://localhost:5000/api/twitter/callback',
      { 
        // الصلاحيات المطلوبة: قراءة المستخدم، قراءة التغريدات، وكتابة التغريدات، والوصول دون اتصال (Refresh Token)
        scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'] 
      }
    );

    // حفظ الـ codeVerifier لاستخدامه لاحقاً عند عودة المستخدم
    // نربطه بـ state و userId لنعرف من هو المستخدم عند العودة
    authStates.set(state, { codeVerifier, userId: req.user!.id });

    // إرسال الرابط للفرونت إند ليقوم بتوجيه المستخدم إليه
    res.json({ success: true, url });
  } catch (error) {
    console.error('Twitter Auth Start Error:', error);
    res.status(500).json({ error: 'Failed to start Twitter auth' });
  }
});

// 2. استقبال العودة من تويتر (Callback)
// تويتر سيعيد المستخدم إلى هذا الرابط مع كود المصادقة
router.get('/twitter/callback', async (req, res) => {
  // نستخرج الـ state و code من الرابط
  const { state, code } = req.query;
  
  // التحقق من وجود البيانات
  const storedState = authStates.get(state as string);

  if (!state || !code || !storedState) {
    return res.status(400).send('Invalid state or code. Please try again.');
  }

  const { codeVerifier, userId } = storedState;

  try {
    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });

    // استبدال الكود المؤقت بالتوكنات الدائمة (Access Token & Refresh Token)
    const { client: loggedClient, accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({
      code: code as string,
      codeVerifier,
      redirectUri: process.env.CALLBACK_URL || 'http://localhost:5000/api/twitter/callback',
    });

    // جلب بيانات المستخدم (مثل الصورة والاسم) لتخزينها
    const { data: userObject } = await loggedClient.v2.me({
        'user.fields': ['profile_image_url']
    });

    // حساب وقت انتهاء الصلاحية
    const expiresAt = new Date(Date.now() + (expiresIn * 1000));

    // حفظ البيانات في جدول twitter_accounts
    // نستخدم ON CONFLICT لتحديث البيانات إذا كان الحساب مربوطاً بالفعل
    await pool.query(
      `INSERT INTO twitter_accounts 
       (user_id, twitter_user_id, username, profile_image_url, access_token, refresh_token, token_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, twitter_user_id) 
       DO UPDATE SET 
         access_token = EXCLUDED.access_token,
         refresh_token = EXCLUDED.refresh_token,
         token_expires_at = EXCLUDED.token_expires_at,
         profile_image_url = EXCLUDED.profile_image_url,
         updated_at = NOW()`,
      [userId, userObject.id, userObject.username, userObject.profile_image_url, accessToken, refreshToken, expiresAt]
    );

    // تنظيف الذاكرة المؤقتة
    authStates.delete(state as string);

    // إعادة توجيه المستخدم إلى صفحة الداشبورد في الفرونت إند مع رسالة نجاح
    // تأكد من تعديل هذا الرابط ليتناسب مع البورت الخاص بالفرونت إند (غالباً 3000)
    res.redirect('http://localhost:3000/dashboard?twitter_linked=success');

  } catch (error) {
    console.error('Twitter Callback Error:', error);
    res.redirect('http://localhost:3000/dashboard?twitter_linked=error');
  }
});

export default router;
