# MemeDB Frontend

A modern Next.js frontend for the MemeDB application.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp env.local.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
   NEXT_PUBLIC_BOOKMARKLET_URL=http://localhost:3000
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## Deployment

Build for production:
```bash
npm run build
npm start
```

## Environment Variables

- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL
- `NEXT_PUBLIC_BOOKMARKLET_URL` - Frontend URL for bookmarklet generation
