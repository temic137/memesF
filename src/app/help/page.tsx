'use client';

import { ArrowLeft, Download, Clipboard, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HelpPage() {
  const router = useRouter();

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="cluster">
            <button
              onClick={() => router.push('/')}
              className="btn btn-ghost cluster"
              style={{
                color: '#FFFFFF',
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
              }}
            >
              <ArrowLeft size={18} />
              <span>Back to MemeDB</span>
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold" style={{
                color: '#FFFFFF',
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
              }}>Help & Guide</h1>
              <p style={{
                color: '#FFFFFF',
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
              }}>Learn how to save and upload memes</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="page-content">
        <div className="stack-lg">
          {/* Introduction */}
          <div className="card text-center">
            <div className="stack">
              <h2 className="text-3xl font-bold" style={{
                color: '#FFFFFF',
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
              }}>How to Save Memes to MemeDB</h2>
              <p className="text-lg" style={{
                color: '#FFFFFF',
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
              }}>Multiple ways to add memes to your collection</p>
            </div>
          </div>

          {/* Methods Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Drag & Drop */}
            <div className="card text-center">
              <div className="stack">
                <div className="text-4xl mb-4">🖱️</div>
                <h3 className="text-xl font-semibold" style={{
                  color: '#FFFFFF',
                  textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                }}>Drag & Drop</h3>
                <p style={{
                  color: '#FFFFFF',
                  textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                }}>The easiest way to upload memes</p>
                
                <div className="card bg-gray-50 text-left">
                  <div className="stack-sm">
                    <h4 className="font-medium">Steps:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Find a meme image on any website</li>
                      <li>Drag the image from your browser</li>
                      <li>Drop it anywhere on MemeDB</li>
                      <li>The upload modal will open automatically</li>
                      <li>Add tags and upload!</li>
                    </ol>
                  </div>
                </div>

                <div className="alert alert-info">
                  <span className="text-sm">Works from any website or file explorer</span>
                </div>
              </div>
            </div>

            {/* Copy & Paste */}
            <div className="card text-center">
              <div className="stack">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-semibold">Copy & Paste</h3>
                <p className="text-muted">Copy images from anywhere</p>
                
                <div className="card bg-gray-50 text-left">
                  <div className="stack-sm">
                    <h4 className="font-medium">Steps:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Right-click any image and "Copy image"</li>
                      <li>Go to MemeDB</li>
                      <li>Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+V</kbd> (or <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Cmd+V</kbd>)</li>
                      <li>The upload modal opens with your image</li>
                      <li>Add details and save!</li>
                    </ol>
                  </div>
                </div>

                <div className="alert alert-success">
                  <span className="text-sm">Quick notification shows when image is copied</span>
                </div>
              </div>
            </div>

            {/* Bookmarklet */}
            <div className="card text-center border-primary bg-primary-lighter">
              <div className="stack">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold">Drag-to-Save Bookmarklet</h3>
                <p className="text-muted">Save from any website instantly</p>
                
                <div className="card bg-white text-left">
                  <div className="stack-sm">
                    <h4 className="font-medium">How it works:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Get the bookmarklet from the link below</li>
                      <li>Visit any website with memes</li>
                      <li>Drag images to the floating drop zone</li>
                      <li>Images are automatically saved to MemeDB</li>
                    </ol>
                  </div>
                </div>

                <a
                  href="/save-memes"
                  className="btn btn-primary"
                >
                  <Download size={16} />
                  Get Bookmarklet
                </a>

                <div className="text-xs text-muted">
                  Recommended for power users
                </div>
              </div>
            </div>

            {/* Manual Upload */}
            <div className="card text-center">
              <div className="stack">
                <div className="text-4xl mb-4">📁</div>
                <h3 className="text-xl font-semibold">Manual Upload</h3>
                <p className="text-muted">Traditional file selection</p>
                
                <div className="card bg-gray-50 text-left">
                  <div className="stack-sm">
                    <h4 className="font-medium">Steps:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Click the <Upload size={14} className="inline" /> upload button</li>
                      <li>Click "Choose Image" in the modal</li>
                      <li>Select image from your computer</li>
                      <li>Add title and tags</li>
                      <li>Click "Upload Meme"</li>
                    </ol>
                  </div>
                </div>

                <div className="alert alert-info">
                  <span className="text-sm">Great for uploading from your device</span>
                </div>
              </div>
            </div>

            {/* Share Target */}
            <div className="card text-center">
              <div className="stack">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold">Share Target</h3>
                <p className="text-muted">Share directly from other apps</p>
                
                <div className="card bg-gray-50 text-left">
                  <div className="stack-sm">
                    <h4 className="font-medium">How to use:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Find a meme in any app</li>
                      <li>Use the "Share" button</li>
                      <li>Select "MemeDB" from share options</li>
                      <li>Review and save the meme</li>
                    </ol>
                  </div>
                </div>

                <div className="alert alert-info">
                  <span className="text-sm">Available on mobile and desktop</span>
                </div>
              </div>
            </div>

            {/* Browser Extension */}
            <div className="card text-center opacity-60">
              <div className="stack">
                <div className="text-4xl mb-4">🧩</div>
                <h3 className="text-xl font-semibold">Browser Extension</h3>
                <p className="text-muted">Right-click to save (Coming Soon)</p>
                
                <div className="card bg-gray-50 text-left">
                  <div className="stack-sm">
                    <h4 className="font-medium">Features:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Right-click any image to save</li>
                      <li>Auto-tag detection</li>
                      <li>Bulk save from galleries</li>
                      <li>Keyboard shortcuts</li>
                    </ul>
                  </div>
                </div>

                <div className="btn btn-ghost opacity-50 cursor-not-allowed">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>

          {/* Tips & Tricks */}
          <div className="card">
            <div className="stack">
              <h3 className="text-xl font-semibold">💡 Tips & Tricks</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="stack-sm">
                  <h4 className="font-medium">🏷️ Tagging</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted">
                    <li>Tags are auto-generated if left empty</li>
                    <li>Use commas to separate multiple tags</li>
                    <li>Common tags: funny, reaction, viral, template</li>
                    <li>Be descriptive for better searchability</li>
                  </ul>
                </div>

                <div className="stack-sm">
                  <h4 className="font-medium">📸 Image Quality</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted">
                    <li>Maximum file size: 10MB</li>
                    <li>Supported formats: PNG, JPG, GIF</li>
                    <li>Higher resolution images look better</li>
                    <li>Animated GIFs are fully supported</li>
                  </ul>
                </div>

                <div className="stack-sm">
                  <h4 className="font-medium">🔍 Searching</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted">
                    <li>Search by title, tags, or content</li>
                    <li>Use hashtags for tag-specific searches</li>
                    <li>Filter by date or popularity</li>
                    <li>Save frequently used searches</li>
                  </ul>
                </div>

                <div className="stack-sm">
                  <h4 className="font-medium">⚡ Shortcuts</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted">
                    <li><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl+V</kbd> - Paste image anywhere</li>
                    <li><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl+U</kbd> - Open upload modal</li>
                    <li><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Escape</kbd> - Close modals</li>
                    <li>Drag files anywhere to upload</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start */}
          <div className="card bg-primary-lighter">
            <div className="cluster">
              <div className="flex-1 stack">
                <h3 className="text-xl font-semibold">🚀 Quick Start</h3>
                <p className="text-muted">Ready to start saving memes? Try the easiest method first!</p>
              </div>
              <div className="cluster">
                <button
                  onClick={() => router.push('/')}
                  className="btn btn-primary"
                >
                  Start Uploading
                </button>
                <a
                  href="/save-memes"
                  className="btn btn-secondary"
                >
                  Get Bookmarklet
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
