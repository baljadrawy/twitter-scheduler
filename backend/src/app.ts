
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import tweetRoutes from './routes/tweets';
import aiRoutes from './routes/ai';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Twitter Scheduler API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tweets', tweetRoutes);
app.use('/api/ai', aiRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
