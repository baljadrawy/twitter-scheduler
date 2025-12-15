import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import tweetRoutes from './routes/tweets';
import aiRoutes from './routes/ai';
import twitterAuthRoutes from './routes/twitterAuth'; // تأكد من إنشاء هذا الملف
import { errorHandler } from './middleware/errorHandler';
import './workers/tweetWorker'; // 🔥 تشغيل الـ Worker

dotenv.config();
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tweets', tweetRoutes); // لاحظ: المسار tweets
app.use('/api/ai', aiRoutes);
app.use('/api/twitter', twitterAuthRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));

export default app;
