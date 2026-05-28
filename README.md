# ResumAI

ResumAI is a full-stack resume analyzer built with React Router + TypeScript.  
Users can sign up, upload a PDF resume, run AI feedback analysis, and review ATS-style scoring with improvement tips.

## Tech Stack

- React 19 + React Router 7 (SSR enabled)
- TypeScript
- Tailwind CSS 4
- PostgreSQL (`pg`)
- `bcryptjs` for password hashing
- Puter SDK (cloud file storage + AI chat)

## Core Features

- Email/password authentication with DB-backed session tokens
- Resume upload (PDF)
- PDF-to-image conversion for preview
- AI feedback parsing into structured JSON score data
- Resume history listing per user
- Detailed review page:
  - Overall score
  - ATS score + tips
  - Tone & style
  - Content
  - Structure
  - Skills

## Routes

### Pages

- `/` Home
- `/auth` Login/Signup
- `/upload` Upload + Analyze
- `/resume/:id` Resume details

### API

- `/api/auth/check`
- `/api/auth/login`
- `/api/auth/signup`
- `/api/auth/logout`
- `/api/resumes`

## Requirements

- Node.js 20+
- npm
- PostgreSQL 16+ (local)

## Local Setup

### 1) Clone and install

```bash
git clone https://github.com/Trixxy98/AI-resumeAnalyzer.git
cd AI-resumeAnalyzer
npm ci
```

### 2) Setup PostgreSQL

Create DB:

```bash
createdb resumai
```

Run schema:

```bash
psql -d resumai -f schema.sql
```

If needed, enable extensions manually:

```bash
psql -d resumai -c 'CREATE EXTENSION IF NOT EXISTS "pgcrypto";'
psql -d resumai -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
```

### 3) Configure environment

Create `.env` in project root (`AI-resumeAnalyzer/.env`):

```env
DB_USER=rith
DB_HOST=localhost
DB_NAME=resumai
DB_PASSWORD=harith1234
DB_PORT=5432
```

Adjust values to your local PostgreSQL credentials.

### 4) Run development server

```bash
npm run dev
```

App URL: `http://localhost:5173`

## Scripts

- `npm run dev` Run development server
- `npm run build` Build production output
- `npm run start` Serve built app
- `npm run typecheck` Generate route types + TypeScript check

## Docker

Build:

```bash
docker build -t resumai .
```

Run:

```bash
docker run -p 3000:3000 resumai
```

## Database Tables

Defined in `schema.sql`:

- `users`
- `user_sessions`
- `resumes`

## Common Issues

### `role "postgres" does not exist`

Your local role may not be `postgres`. Update `.env` with your actual DB username (e.g. `rith`).

### `npm ci` fails

Run command inside repo folder containing `package-lock.json`:

```bash
cd AI-resumeAnalyzer
npm ci
```

### AI response returns fenced JSON and page stays on analyzing

The app already handles fenced JSON parsing (` ```json ... ``` `).  
If it still fails, retry once and check browser console/network for AI service errors.

### `Model not found: claude-3-7-sonnet`

The app now uses provider default model to avoid hardcoded unavailable models.

## Notes

- Keep `.env` local (do not commit secrets).
- For pgAdmin usage, connect using your existing PostgreSQL role and ensure it matches `.env`.
