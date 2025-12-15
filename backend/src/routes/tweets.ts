import express from 'express';
import { z } from 'zod';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import { pool } from '../config/database';
import { tweetQueue } from '../workers/tweetWorker';

const router = express.Router();
const schema = z.object({
  twitter_account_id: z.string().uuid(),
  content: z.string().min(1).max(280),
  scheduled_time: z.string().datetime(),
  media_urls: z.array(z.string().url()).optional(),
});

router.post('/', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { twitter_account_id, content, scheduled_time, media_urls } = schema.parse(req.body);
    
    // التحقق من الملكية
    const check = await pool.query('SELECT id FROM twitter_accounts WHERE id=$1 AND user_id=$2', [twitter_account_id, req.user!.id]);
    if (!check.rows.length) return res.status(403).json({ error: 'Unauthorized account' });

    const delay = new Date(scheduled_time).getTime() - Date.now();
    if (delay < 0) return res.status(400).json({ error: 'Time in past' });

    const result = await pool.query(
      `INSERT INTO scheduled_tweets (twitter_account_id, content, media_urls, scheduled_time, status) 
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [twitter_account_id, content, JSON.stringify(media_urls || []), scheduled_time]
    );

    await tweetQueue.add('publish-tweet', { tweetId: result.rows[0].id }, { delay, jobId: result.rows[0].id });
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (e) { next(e); }
});

export default router;
