
import Bull from 'bull';
import { TwitterApi } from 'twitter-api-v2';
import { pool } from '../config/database';

export const tweetQueue = new Bull('tweet-publishing', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
});

tweetQueue.process('publish-tweet', async (job) => {
  const { tweetId } = job.data;
  console.log(`📤 Publishing tweet ${tweetId}`);

  try {
    const tweetResult = await pool.query('SELECT * FROM scheduled_tweets WHERE id = $1', [tweetId]);
    if (tweetResult.rows.length === 0) throw new Error('Tweet not found');

    const tweet = tweetResult.rows[0];
    const accountResult = await pool.query('SELECT * FROM twitter_accounts WHERE id = $1', [tweet.twitter_account_id]);
    const account = accountResult.rows[0];

    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: account.access_token,
      accessSecret: account.refresh_token,
    });

    const response = await client.v2.tweet({ text: tweet.content });

    await pool.query(
      'UPDATE scheduled_tweets SET status = $1, published_tweet_id = $2 WHERE id = $3',
      ['published', response.data.id, tweetId]
    );

    console.log(`✅ Tweet ${tweetId} published`);
    return { success: true, tweetId: response.data.id };
  } catch (error: any) {
    console.error(`❌ Error publishing tweet ${tweetId}:`, error);
    await pool.query(
      'UPDATE scheduled_tweets SET status = $1, error_message = $2 WHERE id = $3',
      ['failed', error.message, tweetId]
    );
    throw error;
  }
});

console.log('🔄 Tweet worker running...');

