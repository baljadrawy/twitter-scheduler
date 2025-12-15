import express from 'express';
import { z } from 'zod';
import { authenticateUser, AuthRequest } from '../middleware/auth'; // تأكد أن اسم الملف auth.ts في middleware
import { pool } from '../config/database';
import { tweetQueue } from '../workers/tweetWorker';

const router = express.Router();

// 1. Schema للتحقق من البيانات القادمة
const scheduleSchema = z.object({
  twitter_account_id: z.string().uuid(),
  content: z.string().min(1, "لا يمكن ترك التغريدة فارغة").max(280, "التغريدة طويلة جداً"),
  scheduled_time: z.string().datetime(), // يجب أن يكون ISO String
  media_urls: z.array(z.string().url()).optional(),
});

// 2. إنشاء جدولة جديدة
router.post('/', authenticateUser, async (req: AuthRequest, res) => {
  try {
    // التحقق من المدخلات
    const { twitter_account_id, content, scheduled_time, media_urls } = scheduleSchema.parse(req.body);

    const userId = req.user!.id;

    // أمان: التحقق من أن المستخدم يملك هذا الحساب فعلاً
    const accountCheck = await pool.query(
      'SELECT id FROM twitter_accounts WHERE id = $1 AND user_id = $2',
      [twitter_account_id, userId]
    );

    if (accountCheck.rows.length === 0) {
      return res.status(403).json({ success: false, error: 'لا تملك صلاحية النشر لهذا الحساب' });
    }

    // حساب وقت التأخير (Delay)
    const delay = new Date(scheduled_time).getTime() - Date.now();
    if (delay < 0) {
      return res.status(400).json({ success: false, error: 'وقت الجدولة يجب أن يكون في المستقبل' });
    }

    // الحفظ في الداتابيس
    const result = await pool.query(
      `INSERT INTO scheduled_tweets 
       (twitter_account_id, content, media_urls, scheduled_time, status) 
       VALUES ($1, $2, $3, $4, 'pending') 
       RETURNING *`,
      [twitter_account_id, content, JSON.stringify(media_urls || []), scheduled_time]
    );

    const tweet = result.rows[0];

    // الإرسال للـ Queue
    await tweetQueue.add(
      'publish-tweet', 
      { tweetId: tweet.id }, 
      { delay: delay, jobId: tweet.id } // jobId يمنع تكرار نفس المهمة
    );

    res.status(201).json({ success: true, data: tweet });

  } catch (error) {
    if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: error.errors[0].message });
    }
    console.error('Schedule Error:', error);
    res.status(500).json({ success: false, error: 'فشلت عملية الجدولة' });
  }
});

// 3. جلب التغريدات المجدولة للمستخدم
router.get('/', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT st.*, ta.username, ta.profile_image_url 
       FROM scheduled_tweets st 
       JOIN twitter_accounts ta ON st.twitter_account_id = ta.id 
       WHERE ta.user_id = $1 
       ORDER BY st.scheduled_time DESC`,
      [req.user!.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch Error:', error);
    res.status(500).json({ success: false, error: 'فشل جلب التغريدات' });
  }
});

export default router;
