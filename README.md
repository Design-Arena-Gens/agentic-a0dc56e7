# YouTube Upload Agent

Automated YouTube video upload with AI-powered SEO optimization.

## Features

- 🎥 Upload videos via file or URL
- 🤖 AI-generated SEO titles (60-70 chars)
- 📝 AI-generated descriptions with keywords
- 🏷️ Auto-generated hashtags and tags
- 🎨 Thumbnail prompt generation
- 📅 Schedule publishing
- 💰 Monetization options
- 🌍 Multi-language support

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Setup

Copy `.env.example` to `.env` and configure:

```env
# Google OAuth2 (for YouTube uploads)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret

# OpenAI (for SEO generation)
OPENAI_API_KEY=your_openai_key
```

## Usage

1. **Input video**: Upload file or provide URL
2. **Select options**: Category, language, monetization, schedule
3. **Generate metadata**: AI creates optimized SEO content
4. **Preview & edit**: Review and customize generated content
5. **Upload**: Publish to YouTube

## Deployment

Deploy to Vercel:

```bash
vercel deploy --prod
```

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- OpenAI API
- Google YouTube API
- Lucide Icons
