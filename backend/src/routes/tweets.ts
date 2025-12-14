import express from 'express';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import { pool } from '../config/database';
import { tweetQueue } from '../workers/tweetWorker';

const router = express.Router();

router.post('/', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { twitter_account_id, content, scheduled_time } = req.body;
    
    const result = await pool.query(
      'INSERT INTO scheduled_tweets (twitter_account_id, content, scheduled_time) VALUES ($1, $2, $3) RETURNING *',
      [twitter_account_id, content, scheduled_time]
    );

    const tweet = result.rows[0];
    const delay = new Date(scheduled_time).getTime() - Date.now();
    
    await tweetQueue.add('publish-tweet', { tweetId: tweet.id }, { delay: Math.max(0, delay) });

    res.status(201).json({ success: true, data: tweet });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to schedule' });
  }
});

router.get('/', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      'SELECT st.* FROM scheduled_tweets st JOIN twitter_accounts ta ON st.twitter_account_id = ta.id WHERE ta.user_id = $1 ORDER BY st.scheduled_time DESC',
      [req.user!.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch' });
  }
});

export default router;
