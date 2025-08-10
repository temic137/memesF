'use client';

import { ArrowLeft, Download, Share2, Upload, Smartphone } from 'lucide-react';
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
            >
              <ArrowLeft size={18} />
              <span>Back to MemeDB</span>
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Help & Guide</h1>
              <p className="text-muted">Learn how to save and upload memes</p>
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
              <h2 className="text-3xl font-bold">How to Save Memes to MemeDB</h2>
              <p className="text-muted text-lg">Multiple ways to add memes to your collection</p>
            </div>
          </div>

          {/* Methods Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Drag & Drop */}
            <div className="card text-center">
              <div className="stack">
                <div className="text-4xl mb-4">🖱️</div>
                <h3 className="text-xl font-semibold">Drag & Drop</h3>
                <p className="text-muted">The easiest way to upload memes</p>
                
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
                      <li>Right-click any image and &quot;Copy image&quot;</li>
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
                      <li>Use the &quot;Share&quot; button</li>
                      <li>Select &quot;MemeDB&quot; from share options</li>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Bookmark className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Drag & Drop Bookmarklet</h3>
              <p className="text-sm text-gray-600">Save images by dragging</p>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded border">
                <p className="text-xs text-gray-600 mb-2">Drag this button to your bookmarks bar:</p>
                <a 
                  href={bookmarkletCode}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                  title="Drag this to your bookmarks bar, then click it on any website to activate drag & drop saving"
                >
                  <span style={{fontSize: '20px'}}>🎭</span>
                  <span>Save to MemeDB</span>
                </a>
                <p className="text-xs text-gray-500 mt-2">
                  <strong>How it works:</strong> Click the bookmark on any website to activate a drop zone. 
                  Then drag images from that page (or your computer) anywhere on the page to save them instantly!
                </p>
              </div>
              
              <button
                onClick={copyBookmarklet}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800"
              >
                {copiedBookmarklet ? (
                  <>
                    <Check size={14} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy Code
                  </>
                )}
              </button>

              <div className="text-xs text-gray-500 space-y-1">
                <p>• Drag this button to your bookmarks bar</p>
                <p>• Click it on any website to activate</p>
                <p>• Drag images from any site onto the page</p>
                <p>• Images save instantly to MemeDB</p>
                <p>• Works on Reddit, Twitter, Instagram, etc.</p>
              </div>
            </div>
          </div>

          {/* Drag & Drop */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Upload className="text-green-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Drag & Drop</h3>
              <p className="text-sm text-gray-600">Direct upload anywhere</p>
            </div>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Drag images from any folder</p>
              <p>• Drop anywhere on the page</p>
              <p>• Paste with Ctrl+V (Cmd+V)</p>
              <p>• Auto-opens upload dialog</p>
              <p>• Supports PNG, JPG, GIF</p>
            </div>
          </div>

          {/* Mobile Share */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Share2 className="text-purple-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Mobile Share</h3>
              <p className="text-sm text-gray-600">Share from any app</p>
            </div>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Appears in mobile share menu</p>
              <p>• Share from Photos, Camera, etc.</p>
              <p>• Install as PWA app first</p>
              <p>• Works on Android & iOS</p>
              <p>• Auto-fills title and tags</p>
            </div>
          </div>
        </div>

        {/* Mobile PWA Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Smartphone className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📱 Install as Mobile App</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Android (Chrome):</h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Tap the menu (⋮) in Chrome</li>
                    <li>Tap &quot;Add to Home screen&quot;</li>
                    <li>Confirm the installation</li>
                    <li>Now appears in share menus!</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">iOS (Safari):</h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Tap the Share button (□↗)</li>
                    <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
                    <li>Tap &quot;Add&quot; to confirm</li>
                    <li>Available in iOS share sheet!</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe size={20} />
            Quick Start Guide
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Desktop Users:</h4>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Drag the blue button to your bookmarks bar</li>
                <li>Visit any website with images (Reddit, Twitter, etc.)</li>
                <li>Click the &quot;🎭 Save to MemeDB&quot; bookmark to activate</li>
                <li>Drag images from the page anywhere to save them</li>
                <li>Or drag image files from your computer</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Mobile Users:</h4>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Install MemeDB as a mobile app</li>
                <li>Open any app with images</li>
                <li>Tap the Share button</li>
                <li>Select &quot;MemeDB&quot; from the list</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">💡 Pro Tips</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• The bookmarklet creates a drop zone that works with any image drag</li>
            <li>• You can drag images from other browser tabs or your desktop</li>
            <li>• Press ESC to deactivate the drop zone when you&apos;re done</li>
            <li>• Tags are auto-generated using AI if you leave them empty</li>
            <li>• The app works offline once installed as a PWA</li>
            <li>• Shared content automatically pre-fills the title and tags</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
