-- Twitter Scheduler Database Schema
-- PostgreSQL 14+

-- تفعيل UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================
-- 1. جدول المستخدمين
-- ============================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================
-- 2. جدول حسابات Twitter
-- ============================
CREATE TABLE twitter_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    twitter_user_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    profile_image_url TEXT,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================
-- 3. جدول التغريدات المجدولة
-- ============================
CREATE TABLE scheduled_tweets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    twitter_account_id UUID REFERENCES twitter_accounts(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (LENGTH(content) <= 280),
    media_urls JSONB DEFAULT '[]',
    media_type VARCHAR(20) DEFAULT 'none' CHECK (media_type IN ('none', 'image', 'video', 'mixed')),
    scheduled_time TIMESTAMP NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed', 'cancelled')),
    targeting_options JSONB DEFAULT '{}',
    published_tweet_id VARCHAR(255),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================
-- 4. جدول الثريدات
-- ============================
CREATE TABLE threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    twitter_account_id UUID REFERENCES twitter_accounts(id) ON DELETE CASCADE,
    title VARCHAR(255),
    scheduled_time TIMESTAMP NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'publishing', 'published', 'failed')),
    targeting_options JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================
-- 5. جدول تغريدات الثريد
-- ============================
CREATE TABLE thread_tweets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (LENGTH(content) <= 280),
    media_urls JSONB DEFAULT '[]',
    media_type VARCHAR(20) DEFAULT 'none' CHECK (media_type IN ('none', 'image', 'video', 'mixed')),
    order_index INTEGER NOT NULL,
    published_tweet_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(thread_id, order_index)
);

-- ============================
-- 6. جدول التحليلات
-- ============================
CREATE TABLE tweet_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tweet_reference_id UUID NOT NULL,
    tweet_reference_type VARCHAR(20) NOT NULL CHECK (tweet_reference_type IN ('single', 'thread')),
    tweet_id VARCHAR(255) NOT NULL,
    impressions INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    retweets INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    fetched_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================
-- 7. جدول بيانات المتابعين
-- ============================
CREATE TABLE follower_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    twitter_account_id UUID REFERENCES twitter_accounts(id) ON DELETE CASCADE,
    total_followers INTEGER DEFAULT 0,
    active_hours JSONB DEFAULT '[]',
    top_locations JSONB DEFAULT '[]',
    interests JSONB DEFAULT '[]',
    analyzed_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================
-- 8. جدول إعادة النشر التلقائية
-- ============================
CREATE TABLE repost_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    twitter_account_id UUID REFERENCES twitter_accounts(id) ON DELETE CASCADE,
    original_tweet_id VARCHAR(255) NOT NULL,
    frequency_days INTEGER NOT NULL CHECK (frequency_days > 0),
    is_active BOOLEAN DEFAULT TRUE,
    last_reposted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================
-- 9. جدول مكتبة الوسائط
-- ============================
CREATE TABLE media_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('image', 'video')),
    file_size BIGINT,
    thumbnail_url TEXT,
    original_filename VARCHAR(255),
    storage_provider VARCHAR(50) DEFAULT 'cloudinary',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================
-- 10. جدول استخدام AI
-- ============================
CREATE TABLE ai_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('generate', 'improve', 'rephrase', 'hashtags', 'ideas')),
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================
-- 11. جدول تفضيلات AI
-- ============================
CREATE TABLE ai_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    default_tone VARCHAR(20) DEFAULT 'casual' CHECK (default_tone IN ('professional', 'casual', 'friendly', 'humorous')),
    default_length VARCHAR(20) DEFAULT 'medium' CHECK (default_length IN ('short', 'medium', 'long')),
    use_emojis BOOLEAN DEFAULT TRUE,
    preferred_topics JSONB DEFAULT '[]',
    learn_from_style BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================
-- Indexes للأداء
-- ============================
CREATE INDEX idx_twitter_accounts_user ON twitter_accounts(user_id);
CREATE INDEX idx_scheduled_tweets_account ON scheduled_tweets(twitter_account_id);
CREATE INDEX idx_scheduled_tweets_time ON scheduled_tweets(scheduled_time);
CREATE INDEX idx_scheduled_tweets_status ON scheduled_tweets(status);
CREATE INDEX idx_threads_account ON threads(twitter_account_id);
CREATE INDEX idx_threads_time ON threads(scheduled_time);
CREATE INDEX idx_thread_tweets_thread ON thread_tweets(thread_id);
CREATE INDEX idx_tweet_analytics_reference ON tweet_analytics(tweet_reference_id, tweet_reference_type);
CREATE INDEX idx_ai_usage_user_date ON ai_usage(user_id, created_at);
CREATE INDEX idx_media_library_user ON media_library(user_id);

-- ============================
-- Triggers لتحديث updated_at
-- ============================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_twitter_accounts_updated_at BEFORE UPDATE ON twitter_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_tweets_updated_at BEFORE UPDATE ON scheduled_tweets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_threads_updated_at BEFORE UPDATE ON threads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================
-- بيانات تجريبية (اختياري)
-- ============================
-- مستخدم تجريبي
INSERT INTO users (email, password_hash, name) 
VALUES ('demo@example.com', '$2b$10$abcdefghijklmnopqrstuv', 'Demo User');

-- ملاحظة: استبدل password_hash بقيمة مشفرة حقيقية في الإنتاج
