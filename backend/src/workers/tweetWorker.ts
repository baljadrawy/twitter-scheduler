import Bull from 'bull';
import { TwitterApi } from 'twitter-api-v2';
import { Scraper } from 'agent-twitter-client'; // 📦 npm install agent-twitter-client
import axios from 'axios'; // 📦 npm install axios
import { pool } from '../config/database';

// إعداد الصف (Queue)
export const tweetQueue = new Bull('tweet-publishing', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
});

// دالة مساعدة لتحميل الصور من الرابط وتحويلها لـ Buffer
async function downloadMedia(url: string): Promise<{ buffer: Buffer; type: string }> {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  // تحديد النوع بناءً على الامتداد (بسيط)
  const isVideo = url.match(/\.(mp4|mov)$/i);
  return { 
    buffer: Buffer.from(response.data), 
    type: isVideo ? 'mp4' : 'jpg' 
  };
}

// 🚀 معالج المهمة (The Processor)
tweetQueue.process('publish-tweet', async (job) => {
  const { tweetId } = job.data;
  console.log(`🎬 Processing tweet job: ${tweetId}`);

  try {
    // 1. جلب البيانات من قاعدة البيانات
    const tweetResult = await pool.query('SELECT * FROM scheduled_tweets WHERE id = $1', [tweetId]);
    if (tweetResult.rows.length === 0) throw new Error('Tweet not found');
    const tweet = tweetResult.rows[0];

    // حماية: إذا كانت التغريدة منشورة بالفعل لا تكررها
    if (tweet.status === 'published') {
        console.log('⚠️ Tweet already published, skipping.');
        return;
    }

    const accountResult = await pool.query('SELECT * FROM twitter_accounts WHERE id = $1', [tweet.twitter_account_id]);
    const account = accountResult.rows[0];

    // =================================================
    // 🏛️ المحاولة الأولى: API الرسمي (Official v2)
    // =================================================
    try {
        console.log('📡 Attempting Official API...');
        
        const client = new TwitterApi({
          appKey: process.env.TWITTER_API_KEY!,
          appSecret: process.env.TWITTER_API_SECRET!,
          accessToken: account.access_token,
          // ⚠️ ملاحظة: إذا كنت تستخدم OAuth 1.0a تأكد من تخزين Secret
          // إذا كنت تستخدم OAuth 2.0، قد تحتاج لآلية Refresh Token هنا
          accessSecret: account.access_token_secret || account.refresh_token, 
        });

        // أ. رفع الوسائط (إن وجدت)
        let mediaIds: string[] = [];
        if (tweet.media_urls && Array.isArray(tweet.media_urls) && tweet.media_urls.length > 0) {
            console.log(`🖼️ Uploading ${tweet.media_urls.length} media files...`);
            for (const url of tweet.media_urls) {
                const { buffer, type } = await downloadMedia(url);
                // v2.tweet يحتاج media_id يتم الحصول عليه من v1.uploadMedia
                const mediaId = await client.v1.uploadMedia(buffer, { type });
                mediaIds.push(mediaId);
            }
        }

        // ب. نشر التغريدة
        const payload: any = { text: tweet.content };
        if (mediaIds.length > 0) {
            payload.media = { media_ids: mediaIds };
        }

        const response = await client.v2.tweet(payload);

        // ج. تحديث الحالة لنجاح
        await pool.query(
            `UPDATE scheduled_tweets 
             SET status = 'published', published_tweet_id = $1, publish_method = 'official', updated_at = NOW() 
             WHERE id = $2`,
            [response.data.id, tweetId]
        );

        console.log(`✅ Tweet published officially: ${response.data.id}`);
        return { success: true, method: 'official', id: response.data.id };

    } catch (officialError: any) {
        console.error(`⚠️ Official API Failed: ${officialError.message}`);
        
        // إذا كان الخطأ بسبب المحتوى (مثلاً نص طويل جداً)، لا تحاول مرة أخرى
        // أما إذا كان خطأ مصادقة أو شبكة، ننتقل للخطة البديلة
        
        // =================================================
        // 🍪 المحاولة الثانية: الكوكيز (Fallback)
        // =================================================
        console.log('🔄 Switching to Cookie Fallback...');

        const scraper = new Scraper();
        
        // تأكد من وضع هذه القيم في .env
        await scraper.setCookies([
            { key: 'auth_token', value: process.env.TWITTER_AUTH_TOKEN, domain: '.twitter.com' },
            { key: 'ct0', value: process.env.TWITTER_CT0, domain: '.twitter.com' },
        ]);

        if (!await scraper.isLoggedIn()) {
            throw new Error('Fallback failed: Cookies are invalid');
        }

        // ملاحظة: مكتبات الكوكيز قد تواجه صعوبة في رفع الفيديو، هنا نركز على النص والصور
        // ستحتاج لتحويل الـ Buffer لشيء تقبله المكتبة إذا أردت رفع صور بالكوكيز
        
        await scraper.sendTweet(tweet.content); // إرسال النص (يمكن تطويره للصور)

        // د. تحديث الحالة لنجاح (بديل)
        await pool.query(
            `UPDATE scheduled_tweets 
             SET status = 'published', publish_method = 'cookie_fallback', updated_at = NOW() 
             WHERE id = $1`,
            [tweetId]
        );

        console.log(`✅ Tweet published via Cookies!`);
        return { success: true, method: 'cookie' };
    }

  } catch (finalError: any) {
    // =================================================
    // ❌ الفشل النهائي
    // =================================================
    console.error(`❌ Job failed completely for tweet ${tweetId}:`, finalError);
    
    await pool.query(
      `UPDATE scheduled_tweets 
       SET status = 'failed', error_message = $1, updated_at = NOW() 
       WHERE id = $2`,
      [finalError.message, tweetId]
    );
    
    throw finalError;
  }
});

console.log('👷 Tweet Worker is listening for jobs...');
