import OpenAI from 'openai';
import { pool } from '../config/database';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AIService {
  async generateTweet(userId: string, prompt: string, tone: string, length: string): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `Write a ${tone} tweet (${length}) about: ${prompt}. Return text only.` },
      ],
      max_tokens: 280,
    });
    const tweet = completion.choices[0].message.content?.trim() || '';
    this.trackUsage(userId, 'generate', completion.usage?.total_tokens || 0);
    return tweet;
  }

  async improveTweet(userId: string, content: string): Promise<string[]> {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `Rewrite this tweet in 3 ways. Return one per line.` },
        { role: 'user', content },
      ],
    });
    const raw = completion.choices[0].message.content || '';
    // تنظيف الأرقام والشرطات
    return raw.split('\n').map(l => l.replace(/^[\d-]+\.\s*/, '').trim()).filter(l => l);
  }

  async generateHashtags(userId: string, content: string): Promise<string[]> {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: `Generate 5 hashtags for this tweet.` }, { role: 'user', content }],
    });
    return (completion.choices[0].message.content?.match(/#[a-zA-Z0-9_]+/g) || []).slice(0, 5);
  }

  private async trackUsage(userId: string, action: string, tokens: number) {
    pool.query('INSERT INTO ai_usage (user_id, action_type, tokens_used) VALUES ($1, $2, $3)', [userId, action, tokens]).catch(console.error);
  }
}
export const aiService = new AIService();
