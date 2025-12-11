'use client';

import { useState } from 'react';
import { Upload, Youtube, Sparkles, Calendar, DollarSign, Globe } from 'lucide-react';

interface UploadData {
  videoFile?: File;
  videoUrl?: string;
  category: string;
  language: string;
  monetization: boolean;
  scheduleTime?: string;
}

interface GeneratedMetadata {
  title: string;
  description: string;
  hashtags: string[];
  tags: string[];
  thumbnailPrompt: string;
}

interface UploadSummary extends GeneratedMetadata {
  publishDate?: string;
  videoId?: string;
  videoUrl?: string;
}

export default function Home() {
  const [uploadData, setUploadData] = useState<UploadData>({
    category: 'tech',
    language: 'en',
    monetization: false,
  });
  const [loading, setLoading] = useState(false);
  const [generatedMetadata, setGeneratedMetadata] = useState<GeneratedMetadata | null>(null);
  const [uploadSummary, setUploadSummary] = useState<UploadSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'preview' | 'summary'>('input');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadData({ ...uploadData, videoFile: e.target.files[0], videoUrl: '' });
    }
  };

  const handleGenerateMetadata = async () => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (uploadData.videoFile) {
        formData.append('videoFile', uploadData.videoFile);
      }
      if (uploadData.videoUrl) {
        formData.append('videoUrl', uploadData.videoUrl);
      }
      formData.append('category', uploadData.category);
      formData.append('language', uploadData.language);

      const response = await fetch('/api/generate-metadata', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate metadata');
      }

      const metadata = await response.json();
      setGeneratedMetadata(metadata);
      setStep('preview');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!generatedMetadata) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (uploadData.videoFile) {
        formData.append('videoFile', uploadData.videoFile);
      }
      if (uploadData.videoUrl) {
        formData.append('videoUrl', uploadData.videoUrl);
      }
      formData.append('title', generatedMetadata.title);
      formData.append('description', generatedMetadata.description);
      formData.append('tags', JSON.stringify(generatedMetadata.tags));
      formData.append('category', uploadData.category);
      formData.append('monetization', String(uploadData.monetization));
      if (uploadData.scheduleTime) {
        formData.append('scheduleTime', uploadData.scheduleTime);
      }

      const response = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload video');
      }

      const result = await response.json();
      setUploadSummary({
        ...generatedMetadata,
        publishDate: uploadData.scheduleTime || 'Published immediately',
        videoId: result.videoId,
        videoUrl: result.videoUrl,
      });
      setStep('summary');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUploadData({
      category: 'tech',
      language: 'en',
      monetization: false,
    });
    setGeneratedMetadata(null);
    setUploadSummary(null);
    setError(null);
    setStep('input');
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Youtube className="w-12 h-12 text-youtube-red" />
            <h1 className="text-4xl font-bold text-gray-900">YouTube Upload Agent</h1>
          </div>
          <p className="text-gray-600">Automated video upload with AI-powered SEO optimization</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Input */}
        {step === 'input' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Upload Details
            </h2>

            <div className="space-y-6">
              {/* Video Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video File
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-youtube-red focus:border-transparent"
                />
              </div>

              <div className="text-center text-gray-500 font-medium">OR</div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL
                </label>
                <input
                  type="url"
                  value={uploadData.videoUrl || ''}
                  onChange={(e) => setUploadData({ ...uploadData, videoUrl: e.target.value, videoFile: undefined })}
                  placeholder="https://example.com/video.mp4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-youtube-red focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={uploadData.category}
                  onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-youtube-red focus:border-transparent"
                >
                  <option value="tech">Tech</option>
                  <option value="vlog">Vlog</option>
                  <option value="shorts">Shorts</option>
                  <option value="gaming">Gaming</option>
                  <option value="tutorial">Tutorial</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Language
                </label>
                <select
                  value={uploadData.language}
                  onChange={(e) => setUploadData({ ...uploadData, language: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-youtube-red focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>

              {/* Monetization */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="monetization"
                  checked={uploadData.monetization}
                  onChange={(e) => setUploadData({ ...uploadData, monetization: e.target.checked })}
                  className="w-5 h-5 text-youtube-red focus:ring-youtube-red rounded"
                />
                <label htmlFor="monetization" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Enable Monetization
                </label>
              </div>

              {/* Schedule Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={uploadData.scheduleTime || ''}
                  onChange={(e) => setUploadData({ ...uploadData, scheduleTime: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-youtube-red focus:border-transparent"
                />
              </div>

              <button
                onClick={handleGenerateMetadata}
                disabled={loading || (!uploadData.videoFile && !uploadData.videoUrl)}
                className="w-full bg-youtube-red text-white py-4 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate SEO & Preview
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 'preview' && generatedMetadata && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-youtube-red" />
              Generated Metadata
            </h2>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title ({generatedMetadata.title.length} chars)
                </label>
                <input
                  type="text"
                  value={generatedMetadata.title}
                  onChange={(e) => setGeneratedMetadata({ ...generatedMetadata, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-youtube-red focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={generatedMetadata.description}
                  onChange={(e) => setGeneratedMetadata({ ...generatedMetadata, description: e.target.value })}
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-youtube-red focus:border-transparent"
                />
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hashtags
                </label>
                <div className="flex flex-wrap gap-2">
                  {generatedMetadata.hashtags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {generatedMetadata.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Thumbnail Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail Prompt
                </label>
                <textarea
                  value={generatedMetadata.thumbnailPrompt}
                  onChange={(e) => setGeneratedMetadata({ ...generatedMetadata, thumbnailPrompt: e.target.value })}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-youtube-red focus:border-transparent"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('input')}
                  className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="flex-1 bg-youtube-red text-white py-4 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? (
                    <>Uploading...</>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload to YouTube
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Summary */}
        {step === 'summary' && uploadSummary && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Youtube className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Upload Successful!</h2>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Video Title</h3>
                <p className="text-gray-900">{uploadSummary.title}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-900 whitespace-pre-line">{uploadSummary.description}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {uploadSummary.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Thumbnail Prompt</h3>
                <p className="text-gray-900">{uploadSummary.thumbnailPrompt}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Publish Date/Time</h3>
                <p className="text-gray-900">{uploadSummary.publishDate}</p>
              </div>

              {uploadSummary.videoUrl && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-700 mb-2">Video URL</h3>
                  <a
                    href={uploadSummary.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {uploadSummary.videoUrl}
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={resetForm}
              className="w-full bg-youtube-red text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Upload Another Video
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
