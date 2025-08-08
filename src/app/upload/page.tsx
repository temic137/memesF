'use client';

import { useState } from 'react';
import UploadMeme from '@/components/UploadMeme';

export default function UploadPage() {
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUploadSuccess = () => {
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4" style={{
            color: '#FFFFFF',
            textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
          }}>Upload Meme</h1>
          <p style={{
            color: '#FFFFFF',
            textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
          }}>
            Upload your meme and let our AI automatically generate relevant tags, 
            or add your own custom tags.
          </p>
        </div>

        {uploadSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            🎉 Meme uploaded successfully! Auto-tagging completed.
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <UploadMeme onUploadSuccess={handleUploadSuccess} />
        </div>

        <div className="mt-8 text-center text-sm" style={{
          color: '#FFFFFF',
          textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
        }}>
          <p>
            <strong>Auto-tagging powered by Google Gemini Vision AI</strong>
          </p>
          <p>Leave tags empty to let AI analyze your image and generate relevant tags automatically.</p>
        </div>
      </div>
    </div>
  );
}
