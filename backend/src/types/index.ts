```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: Date;
}

export interface TwitterAccount {
  id: string;
  user_id: string;
  twitter_user_id: string;
  username: string;
  access_token: string;
  refresh_token?: string;
}

export interface ScheduledTweet {
  id: string;
  twitter_account_id: string;
  content: string;
  media_urls: string[];
  media_type: 'none' | 'image' | 'video';
  scheduled_time: Date;
  status: 'pending' | 'published' | 'failed';
  published_tweet_id?: string;
}

export interface AIActionType {
  type: 'generate' | 'improve' | 'rephrase' | 'hashtags';
}
```

---
