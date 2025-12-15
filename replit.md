# Twitter Scheduler

## Overview
A Twitter scheduling application with AI-powered tweet generation. Built with Next.js frontend with integrated API routes.

## Architecture
- **Frontend & API**: Next.js 14 with React 18, Tailwind CSS, and API Routes
- **Database**: PostgreSQL (Replit-provided)
- **Authentication**: JWT-based with bcryptjs password hashing

## Project Structure
```
/
├── frontend/          # Next.js application
│   ├── app/
│   │   ├── api/      # API routes for auth
│   │   │   └── auth/ # Login and register endpoints
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── next.config.js
│   └── package.json
├── backend/          # Express.js API server (not used in Replit)
├── database/         # SQL schema
│   └── schema.sql
└── replit.md
```

## Running the Project
- **Frontend**: Runs on port 5000 via workflow
- **API Routes**: Integrated in Next.js at `/api/*`

## API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## Database Schema
11 tables for users, twitter accounts, scheduled tweets, threads, analytics, etc.

## External APIs (Optional)
- Twitter API (for posting tweets)
- OpenAI API (for AI tweet generation)
- Cloudinary (for media storage)

## Notes
- Registration and login save to PostgreSQL database
- JWT tokens used for authentication
- Password hashing with bcryptjs
