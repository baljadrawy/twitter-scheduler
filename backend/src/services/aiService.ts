import OpenAI from 'openai';
import { pool } from '../config/database';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AIService {
  async generateTweet(userId: string, prompt: string, tone: string = 'casual', length: string = 'medium'): Promise {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `You are a Twitter expert. Create ${tone} tweets that are ${length} length.` },
        { role: 'user', content: prompt },
      ],
      max_tokens: 150,
    });

    const tweet = completion.choices[0].message.content?.trim() || '';
    await this.trackUsage(userId, 'generate', completion.usage?.total_tokens || 0);
    return tweet;
  }

  async improveTweet(userId: string, content: string, options: number = 3): Promise {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `Improve tweets. Return ${options} variations, one per line.` },
        { role: 'user', content: content },
      ],
      max_tokens: 300,
    });

    const improved = completion.choices[0].message.content?.trim() || '';
    await this.trackUsage(userId, 'improve', completion.usage?.total_tokens || 0);
    return improved.split('\n').filter(t => t.trim()).slice(0, options);
  }

  async generateHashtags(userId: string, content: string, count: number = 5): Promise {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `Generate ${count} relevant hashtags. Return only hashtags with # symbol, one per line.` },
        { role: 'user', content: content },
      ],
      max_tokens: 100,
    });

    const hashtags = completion.choices[0].message.content?.trim().split('\n').filter(h => h.startsWith('#')).slice(0, count) || [];
    await this.trackUsage(userId, 'hashtags', completion.usage?.total_tokens || 0);
    return hashtags;
  }

  private async trackUsage(userId: string, actionType: string, tokensUsed: number): Promise {
    await pool.query(
      'INSERT INTO ai_usage (user_id, action_type, tokens_used) VALUES ($1, $2, $3)',
      [userId, actionType, tokensUsed]
    );
  }
}

export const aiService = new AIService();
