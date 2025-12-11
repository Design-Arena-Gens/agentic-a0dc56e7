import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key',
});

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  tech: ['technology', 'software', 'coding', 'programming', 'developer', 'tech review', 'innovation'],
  vlog: ['vlog', 'daily life', 'lifestyle', 'personal', 'day in the life', 'vlogger'],
  shorts: ['shorts', 'short video', 'quick tips', 'viral', 'trending'],
  gaming: ['gaming', 'gameplay', 'games', 'gamer', 'playthrough', 'walkthrough', 'esports'],
  tutorial: ['tutorial', 'how to', 'guide', 'learn', 'education', 'step by step', 'tips'],
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const category = formData.get('category') as string;
    const language = formData.get('language') as string;
    const videoFile = formData.get('videoFile') as File | null;
    const videoUrl = formData.get('videoUrl') as string | null;

    if (!videoFile && !videoUrl) {
      return NextResponse.json(
        { error: 'Video file or URL is required' },
        { status: 400 }
      );
    }

    // Get video filename or extract from URL for context
    let videoContext = '';
    if (videoFile) {
      videoContext = videoFile.name;
    } else if (videoUrl) {
      videoContext = videoUrl.split('/').pop() || 'video';
    }

    // Generate metadata using OpenAI
    const prompt = `You are a YouTube SEO expert. Generate optimized metadata for a ${category} video with filename/context: "${videoContext}".

Requirements:
- Title: 60-70 characters, SEO-optimized, attention-grabbing
- Description: 200-300 words with keywords, call-to-action, and value proposition
- Hashtags: 5-8 relevant hashtags
- Tags: 15-20 SEO keywords
- Thumbnail prompt: Detailed description for creating an eye-catching thumbnail

Category: ${category}
Language: ${language}

Return ONLY valid JSON in this exact format:
{
  "title": "SEO Title Here",
  "description": "Full description here...",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "tags": ["tag1", "tag2", "tag3"],
  "thumbnailPrompt": "Thumbnail description here"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a YouTube SEO expert. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content generated');
    }

    let metadata;
    try {
      metadata = JSON.parse(content);
    } catch (parseError) {
      // Fallback metadata if parsing fails
      const keywords = CATEGORY_KEYWORDS[category] || [];
      metadata = {
        title: `${category.charAt(0).toUpperCase() + category.slice(1)}: ${videoContext.slice(0, 50)}`,
        description: `Check out this amazing ${category} video! Don't forget to like, comment, and subscribe for more content!\n\n${keywords.join(', ')}\n\nFollow us for more updates!`,
        hashtags: keywords.slice(0, 5).map(k => `#${k.replace(/\s+/g, '')}`),
        tags: keywords.concat(['video', category, 'content', 'youtube']),
        thumbnailPrompt: `Create an eye-catching thumbnail featuring bold text, vibrant colors, and imagery related to ${category}. Include the main topic prominently.`,
      };
    }

    // Ensure title is within length limits
    if (metadata.title.length > 100) {
      metadata.title = metadata.title.slice(0, 97) + '...';
    }

    return NextResponse.json(metadata);
  } catch (error: any) {
    console.error('Error generating metadata:', error);

    // Return fallback metadata on error
    const formData = await request.formData();
    const category = formData.get('category') as string || 'video';
    const keywords = CATEGORY_KEYWORDS[category] || ['video', 'content'];

    return NextResponse.json({
      title: `Amazing ${category.charAt(0).toUpperCase() + category.slice(1)} Content`,
      description: `Check out this amazing ${category} video! Don't forget to like, comment, and subscribe for more content!\n\n${keywords.join(', ')}\n\nFollow us for more updates!`,
      hashtags: keywords.slice(0, 5).map(k => `#${k.replace(/\s+/g, '')}`),
      tags: keywords.concat(['video', category, 'content', 'youtube']),
      thumbnailPrompt: `Create an eye-catching thumbnail featuring bold text, vibrant colors, and imagery related to ${category}. Include the main topic prominently.`,
    });
  }
}
