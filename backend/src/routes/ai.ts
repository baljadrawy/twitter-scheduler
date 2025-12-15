import express from 'express';
import { authenticateUser, AuthRequest } from '../middleware/auth';
// تأكد من وجود هذا الملف أو سنقوم بإنشائه
import { aiService } from '../services/aiService'; 

const router = express.Router();

router.post('/generate', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { prompt, tone, length } = req.body;
    
    // نستدعي الخدمة لتوليد النص
    const tweet = await aiService.generateTweet(req.user!.id, prompt, tone, length);
    
    res.json({ success: true, data: { tweet } });
  } catch (error) {
    console.error('AI Generate Error:', error);
    res.status(500).json({ success: false, error: 'فشل توليد التغريدة' });
  }
});

router.post('/improve', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { content, options } = req.body;
    const variations = await aiService.improveTweet(req.user!.id, content, options);
    res.json({ success: true, data: { variations } });
  } catch (error) {
    console.error('AI Improve Error:', error);
    res.status(500).json({ success: false, error: 'فشل تحسين النص' });
  }
});

router.post('/hashtags', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { content, count } = req.body;
    const hashtags = await aiService.generateHashtags(req.user!.id, content, count);
    res.json({ success: true, data: { hashtags } });
  } catch (error) {
    console.error('AI Hashtags Error:', error);
    res.status(500).json({ success: false, error: 'فشل توليد الهاشتاقات' });
  }
});

export default router;
