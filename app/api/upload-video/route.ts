import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

const CATEGORY_IDS: Record<string, string> = {
  tech: '28',
  vlog: '22',
  shorts: '24',
  gaming: '20',
  tutorial: '27',
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const videoFile = formData.get('videoFile') as File | null;
    const videoUrl = formData.get('videoUrl') as string | null;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const tagsJson = formData.get('tags') as string;
    const category = formData.get('category') as string;
    const monetization = formData.get('monetization') === 'true';
    const scheduleTime = formData.get('scheduleTime') as string | null;

    if (!videoFile && !videoUrl) {
      return NextResponse.json(
        { error: 'Video file or URL is required' },
        { status: 400 }
      );
    }

    const tags = JSON.parse(tagsJson);

    // For demo purposes, simulate upload
    // In production, you'd use OAuth2 and actual YouTube API

    // Check if we have OAuth credentials
    const hasCredentials = process.env.GOOGLE_CLIENT_ID &&
                          process.env.GOOGLE_CLIENT_SECRET;

    if (!hasCredentials) {
      // Demo mode - simulate successful upload
      const videoId = `demo_${Date.now()}`;
      const videoUrl = `https://youtube.com/watch?v=${videoId}`;

      return NextResponse.json({
        success: true,
        videoId,
        videoUrl,
        message: 'Demo mode: Video metadata prepared. Configure Google OAuth credentials to enable actual uploads.',
      });
    }

    // Real upload logic (requires OAuth token from authenticated user)
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.NEXTAUTH_URL
      );

      // This would normally come from the authenticated user's session
      // For now, return error asking user to authenticate
      return NextResponse.json(
        { error: 'Please authenticate with Google to upload videos. OAuth flow not implemented in demo.' },
        { status: 401 }
      );

      // Actual upload code (commented for demo):
      /*
      const youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client,
      });

      let videoStream;
      if (videoFile) {
        const buffer = Buffer.from(await videoFile.arrayBuffer());
        videoStream = Readable.from(buffer);
      } else if (videoUrl) {
        const response = await fetch(videoUrl);
        const buffer = Buffer.from(await response.arrayBuffer());
        videoStream = Readable.from(buffer);
      }

      const publishAt = scheduleTime ? new Date(scheduleTime).toISOString() : undefined;

      const response = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title,
            description,
            tags,
            categoryId: CATEGORY_IDS[category] || '22',
          },
          status: {
            privacyStatus: scheduleTime ? 'private' : 'public',
            publishAt,
            selfDeclaredMadeForKids: false,
            madeForKids: false,
          },
        },
        media: {
          body: videoStream,
        },
      });

      const videoId = response.data.id;
      const videoUrl = `https://youtube.com/watch?v=${videoId}`;

      return NextResponse.json({
        success: true,
        videoId,
        videoUrl,
      });
      */
    } catch (uploadError: any) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: uploadError.message || 'Failed to upload video' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}
