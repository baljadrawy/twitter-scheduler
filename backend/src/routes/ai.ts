import express from 'express';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import { aiService } from '../services/aiService';

const router = express.Router();

router.post('/generate', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { prompt, tone, length } = req.body;
    const tweet = await aiService.generateTweet(req.user!.id, prompt, tone, length);
    res.json({ success: true, data: { tweet } });
  } catch (e) { next(e); }
});
// ... أضف endpoints الـ improve و hashtags بنفس الطريقة
export default router;
