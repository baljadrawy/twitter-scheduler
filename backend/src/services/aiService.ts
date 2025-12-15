import OpenAI from 'openai';
import { pool } from '../config/database';

// التحقق من وجود المفتاح لتجنب الأخطاء الغامضة
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️ Warning: OPENAI_API_KEY is missing!');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AIService {
  
  // 1. توليد تغريدة
  async generateTweet(userId: string, prompt: string, tone: string = 'casual', length: string = 'medium'): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `You are a professional Twitter content creator. Write a ${tone} tweet (length: ${length}) about the topic provided. Do not use hashtags unless asked. Return only the tweet text.` },
        { role: 'user', content: prompt },
      ],
      max_tokens: 280, // تويتر لا يقبل أكثر من ذلك
      temperature: 0.7,
    });

    const tweet = completion.choices[0].message.content?.trim() || '';
    
    // تسجيل الاستهلاك (لا ننتظر النتيجة لعدم تعطيل الرد)
    this.trackUsage(userId, 'generate', completion.usage?.total_tokens || 0).catch(console.error);
    
    return tweet;
  }

  // 2. تحسين/اقتراح بدائل
  async improveTweet(userId: string, content: string, options: number = 3): Promise<string[]> {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `You are a viral tweet editor. Rewrite the following tweet to make it more engaging. Provide ${options} different variations. Return strictly one variation per line. Do not include numbering (1., 2.) or bullet points.` },
        { role: 'user', content: content },
      ],
      max_tokens: 300,
    });

    const rawContent = completion.choices[0].message.content?.trim() || '';
    
    // تنظيف المخرجات: إزالة الأرقام (1.) أو الشرطات (-) في بداية السطر
    const variations = rawContent
      .split('\n')
      .map(line => line.replace(/^[\d-]+\.\s*|^-\s*/, '').trim()) // Regex للتنظيف
      .filter(line => line.length > 0)
      .slice(0, options);

    this.trackUsage(userId, 'improve', completion.usage?.total_tokens || 0).catch(console.error);
    
    return variations;
  }

  // 3. توليد هاشتاقات
  async generateHashtags(userId: string, content: string, count: number = 5): Promise<string[]> {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `Generate ${count} relevant, trending hashtags for this tweet. Return only the hashtags separated by spaces or newlines.` },
        { role: 'user', content: content },
      ],
      max_tokens: 100,
    });

    const response = completion.choices[0].message.content || '';
    
    // استخراج الكلمات التي تبدأ بـ # فقط
    // هذا الـ Regex يستخرج الهاشتاقات حتى لو كانت وسط نص
    const hashtags = response.match(/#[a-zA-Z0-9_\u0600-\u06FF]+/g) || [];
    
    this.trackUsage(userId, 'hashtags', completion.usage?.total_tokens || 0).catch(console.error);
    
    return hashtags.slice(0, count);
  }

  // دالة تتبع الاستهلاك
  private async trackUsage(userId: string, actionType: string, tokensUsed: number): Promise<void> {
    try {
      await pool.query(
        'INSERT INTO ai_usage (user_id, action_type, tokens_used) VALUES ($1, $2, $3)',
        [userId, actionType, tokensUsed]
      );
    } catch (err) {
      console.error('Failed to log AI usage:', err);
    }
  }
}

export const aiService = new AIService();
