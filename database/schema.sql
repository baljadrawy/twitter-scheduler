CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE twitter_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    twitter_user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    profile_image_url TEXT,
    access_token TEXT NOT NULL,
    access_token_secret TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, twitter_user_id)
);

CREATE TABLE scheduled_tweets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    twitter_account_id UUID REFERENCES twitter_accounts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]',
    scheduled_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    publish_method VARCHAR(50),
    published_tweet_id VARCHAR(255),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ai_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action_type VARCHAR(50),
    tokens_used INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
