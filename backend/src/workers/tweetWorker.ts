import Bull from 'bull';
import { TwitterApi } from 'twitter-api-v2';
import { Scraper } from 'agent-twitter-client';
import axios from 'axios';
import { pool } from '../config/database';

export const tweetQueue = new Bull('tweet-publishing', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
});

async function downloadMedia(url: string) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const type = url.endsWith('.mp4') ? 'mp4' : 'jpg';
  return { buffer: Buffer.from(response.data), type };
}

tweetQueue.process('publish-tweet', async (job) => {
  const { tweetId } = job.data;
  console.log(`🚀 Processing tweet ${tweetId}`);

  try {
    const tweetRes = await pool.query('SELECT * FROM scheduled_tweets WHERE id = $1', [tweetId]);
    if (!tweetRes.rows.length) throw new Error('Tweet not found');
    const tweet = tweetRes.rows[0];
    
    if (tweet.status === 'published') return;

    const accRes = await pool.query('SELECT * FROM twitter_accounts WHERE id = $1', [tweet.twitter_account_id]);
    const account = accRes.rows[0];

    // 1. المحاولة الرسمية
    try {
      const client = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY!,
        appSecret: process.env.TWITTER_API_SECRET!,
        accessToken: account.access_token,
        accessSecret: account.access_token_secret || account.refresh_token,
      });

      let mediaIds: string[] = [];
      if (tweet.media_urls?.length) {
        for (const url of tweet.media_urls) {
          const { buffer, type } = await downloadMedia(url);
          const mId = await client.v1.uploadMedia(buffer, { type });
          mediaIds.push(mId);
        }
      }

      const res = await client.v2.tweet({ text: tweet.content, media: mediaIds.length ? { media_ids: mediaIds } : undefined });
      
      await pool.query("UPDATE scheduled_tweets SET status='published', publish_method='official', published_tweet_id=$1 WHERE id=$2", [res.data.id, tweetId]);
      return { success: true, method: 'official' };

    } catch (officialErr: any) {
      console.warn('⚠️ Official API failed, trying cookies...', officialErr.message);
      
      // 2. محاولة الكوكيز (Fallback)
      const scraper = new Scraper();
      await scraper.setCookies([
        { key: 'auth_token', value: process.env.TWITTER_AUTH_TOKEN, domain: '.twitter.com' },
        { key: 'ct0', value: process.env.TWITTER_CT0, domain: '.twitter.com' },
      ]);
      
      await scraper.sendTweet(tweet.content); // ملاحظة: الصور تحتاج معالجة خاصة في scraper
      
      await pool.query("UPDATE scheduled_tweets SET status='published', publish_method='cookie_fallback' WHERE id=$1", [tweetId]);
      return { success: true, method: 'cookie' };
    }

  } catch (err: any) {
    console.error(`❌ Failed: ${err.message}`);
    await pool.query("UPDATE scheduled_tweets SET status='failed', error_message=$1 WHERE id=$2", [err.message, tweetId]);
    throw err;
  }
});
