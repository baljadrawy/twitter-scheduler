import express from 'express';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import { aiService } from '../services/aiService';

const router = express.Router();

router.post('/generate', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { prompt, tone, length } = req.body;
    const tweet = await aiService.generateTweet(req.user!.id, prompt, tone, length);
    res.json({ success: true, data: { tweet } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'AI generation failed' });
  }
});

router.post('/improve', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { content, options } = req.body;
    const variations = await aiService.improveTweet(req.user!.id, content, options);
    res.json({ success: true, data: { variations } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'AI improvement failed' });
  }
});

router.post('/hashtags', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { content, count } = req.body;
    const hashtags = await aiService.generateHashtags(req.user!.id, content, count);
    res.json({ success: true, data: { hashtags } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Hashtag generation failed' });
  }
});

export default router;
