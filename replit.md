# Twitter Scheduler

## Overview
A Twitter scheduling application with AI-powered tweet generation. Built with Next.js frontend and Express.js backend.

## Architecture
- **Frontend**: Next.js 14 with React 18, Tailwind CSS
- **Backend**: Express.js with TypeScript (currently not running - requires Redis)
- **Database**: PostgreSQL (Replit-provided)
- **Queue**: Bull/Redis (optional - for tweet scheduling)

## Project Structure
```
/
├── frontend/          # Next.js application
│   ├── app/          # App router pages
│   ├── next.config.js
│   └── package.json
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── config/   # Database and Redis config
│   │   ├── routes/   # API routes
│   │   ├── services/ # Business logic
│   │   └── workers/  # Background job workers
│   └── package.json
└── database/         # SQL schema
    └── schema.sql
```

## Running the Project
- **Frontend**: Runs on port 5000 via workflow
- **Backend**: Uses port 3001 (optional, requires API keys)

## Database Schema
11 tables for users, twitter accounts, scheduled tweets, threads, analytics, etc.

## External APIs Required
- Twitter API (for posting tweets)
- OpenAI API (for AI tweet generation)
- Cloudinary (for media storage)

## Notes
- Frontend runs in demo mode without backend
- Redis is optional - backend gracefully handles missing Redis
