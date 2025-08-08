'use client';

import { useState } from 'react';
import { ArrowLeft, Copy, Check, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SaveMemesPage() {
  const router = useRouter();
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);

  // Use environment variable for the bookmarklet URL
  const bookmarkletBaseUrl = process.env.NEXT_PUBLIC_BOOKMARKLET_URL || 'http://localhost:3000';
  const unifiedBookmarkletCode = `javascript:(function(){var script=document.createElement('script');script.src='${bookmarkletBaseUrl}/memedb-bookmarklet.js?v='+Date.now();document.head.appendChild(script);})();`;

  const copyBookmarklet = () => {
    navigator.clipboard.writeText(unifiedBookmarkletCode)
      .then(() => {
        setCopiedBookmarklet(true);
        setTimeout(() => setCopiedBookmarklet(false), 2000);
      })
      .catch(() => {
        // Fallback: open a prompt for manual copy
        window.prompt('Copy the bookmarklet code below:', unifiedBookmarkletCode);
      });
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#FFFFFF'}}>
      {/* Header */}
      <header style={{backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(0, 255, 136, 0.2)'}}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 hover:opacity-70 transition-colors"
              style={{
                color: '#1F2937',
                fontWeight: '500'
              }}
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to MemeDB</span>
            </button>
            
            <button
              onClick={() => router.push('/test-bookmarklet')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              style={{
                fontWeight: '500'
              }}
            >
              🧪 Test Bookmarklet
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
         
          <h1 className="text-4xl font-bold mb-4" style={{
            color: '#1F2937'
          }}>
            Save & Find Memes from Anywhere
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{
            color: '#4B5563'
          }}>
            Smart bookmarklet that automatically switches between Save Mode and Search Mode based on context.
          </p>
        </div>

        {/* Installation Card */}
        <div className="rounded-2xl p-8 shadow-sm border mb-12" style={{backgroundColor: '#FFFFFF', borderColor: 'rgba(0, 255, 136, 0.2)'}}>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{
              color: '#1F2937'
            }}>Memes Bookmarklet</h2>
            <p style={{
              color: '#4B5563'
            }}>Smart toggle between Save Mode (on meme sites) and Search Mode (in chat apps)</p>
          </div>

          {/* Unified bookmarklet */}
          <div className="text-center py-12 mb-8 rounded-xl border-2 border-dashed" style={{backgroundColor: 'rgba(0, 255, 136, 0.1)', borderColor: 'rgba(0, 255, 136, 0.3)'}}>
            <div
              className="unified-memedb-bookmarklet-button inline-flex items-center gap-3 px-8 py-4 font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 no-underline text-lg cursor-grab active:cursor-grabbing"
              style={{
                background: 'linear-gradient(135deg, #00FF88 0%, #00CC66 100%)',
                color: '#FFFFFF',
                fontWeight: 'bold',
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
              }}
              title="Drag this to your bookmarks bar to install the Memes Bookmarklet"
              draggable="true"
              onDragStart={(e) => {
                e.dataTransfer.setData('text/uri-list', unifiedBookmarkletCode);
                e.dataTransfer.setData('text/plain', unifiedBookmarkletCode);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #00CC66 0%, #00AA44 100%)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 255, 136, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #00FF88 0%, #00CC66 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span className="text-2xl">🎭</span>
              Memes Bookmarklet
            </div>
            <p className="mt-4 font-medium" style={{
              color: '#1F2937'
            }}>
              ⬆️ Drag this button to your bookmarks bar
            </p>
            <p className="text-sm mt-2" style={{
              color: '#4B5563'
            }}>
              Show bookmarks bar: <kbd className="px-2 py-1 rounded text-xs" style={{backgroundColor: '#F3F4F6', color: '#374151'}}>Ctrl+Shift+B</kbd> (Chrome/Edge) or <kbd className="px-2 py-1 rounded text-xs" style={{backgroundColor: '#F3F4F6', color: '#374151'}}>Ctrl+B</kbd> (Firefox)
            </p>
          </div>

          {/* Alternative method */}
          <div className="text-center">
            <p className="mb-4" style={{
              color: '#1F2937'
            }}>Alternative installation methods:</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={copyBookmarklet}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-md hover:-translate-y-1`}
                style={{
                  backgroundColor: copiedBookmarklet ? '#00FF88' : '#FFFFFF',
                  border: '2px solid rgba(0, 255, 136, 0.3)',
                  color: '#1F2937'
                }}
              >
                {copiedBookmarklet ? (
                  <>
                    <Check size={18} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copy Code
                  </>
                )}
              </button>
              <a
                href={unifiedBookmarkletCode}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium hover:shadow-md hover:-translate-y-1 transition-all duration-200 no-underline"
                style={{
                  backgroundColor: '#FFFFFF', 
                  border: '2px solid rgba(0, 255, 136, 0.3)',
                  color: '#1F2937'
                }}
                onClick={(e) => {
                  // Many browsers block clicking javascript: URLs; provide copy fallback
                  e.preventDefault();
                  copyBookmarklet();
                }}
              >
                <Download size={18} />
                Install Directly
              </a>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="save-memes-feature-card text-center p-6 rounded-2xl" style={{backgroundColor: '#FFFFFF', border: '1px solid rgba(0, 255, 136, 0.2)'}}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{backgroundColor: 'rgba(0, 255, 136, 0.2)'}}>
              <span className="text-2xl">💾</span>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{
              color: '#1F2937'
            }}>Saving Memes</h3>
            <div className="text-left text-sm space-y-2" style={{
              color: '#4B5563'
            }}>
              <p>• <strong>On Reddit/Twitter:</strong> Shows floating &quot;Drop Memes Here&quot; button</p>
              <p>• <strong>Drag & drop:</strong> Drag images directly onto the button</p>
              <p>• <strong>AI tagging:</strong> Automatically analyzes and saves to database!</p>
            </div>
          </div>
          
          <div className="save-memes-feature-card text-center p-6 rounded-2xl" style={{backgroundColor: '#FFFFFF', border: '1px solid rgba(0, 255, 136, 0.2)'}}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{backgroundColor: 'rgba(102, 126, 234, 0.2)'}}>
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{
              color: '#1F2937'
            }}>Using Saved Memes</h3>
            <div className="text-left text-sm space-y-2" style={{
              color: '#4B5563'
            }}>
              <p>• <strong>On Discord/Slack:</strong> Shows floating search panel (non-blocking)</p>
              <p>• <strong>Hover for search:</strong> Hover Save button to reveal Search mode</p>
              <p>• <strong>Drag anywhere:</strong> Drag memes to any chat or text field!</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center" style={{
            color: '#1F2937'
          }}>Why You&apos;ll Love the Unified Bookmarklet</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">🎭</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{
                  color: '#1F2937'
                }}>Smart Mode Detection</h3>
                <p className="text-sm" style={{
                  color: '#4B5563'
                }}>Automatically opens Save or Search mode based on the website</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">🌐</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{
                  color: '#1F2937'
                }}>Works Everywhere</h3>
                <p className="text-sm" style={{
                  color: '#4B5563'
                }}>Gmail, Slack, forums, anywhere!</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">⚡</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{
                  color: '#1F2937'
                }}>AI-Powered Tagging</h3>
                <p className="text-sm" style={{
                  color: '#4B5563'
                }}>Automatically analyzes and tags memes for better search</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">🎯</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{
                  color: '#1F2937'
                }}>Drag & Drop Everything</h3>
                <p className="text-sm" style={{
                  color: '#4B5563'
                }}>Save from any site, search and drag into any chat app</p>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="rounded-2xl p-6 mb-8" style={{backgroundColor: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)'}}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{color: '#00FF88'}}>
            <span>⚠️</span>
            Installation Not Working? Try This:
          </h3>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <span className="font-medium">1.</span>
              <div>
                <p className="font-medium">Show your bookmarks bar first:</p>
                <p>Chrome/Edge: Press <kbd className="px-2 py-1 rounded text-xs" style={{backgroundColor: '#F3F4F6', color: '#374151'}}>Ctrl+Shift+B</kbd></p>
                <p>Firefox: Press <kbd className="px-2 py-1 rounded text-xs" style={{backgroundColor: '#F3F4F6', color: '#374151'}}>Ctrl+B</kbd></p>
                <p>Safari: Press <kbd className="px-2 py-1 rounded text-xs" style={{backgroundColor: '#F3F4F6', color: '#374151'}}>Cmd+Shift+B</kbd></p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-medium">2.</span>
              <div>
                <p className="font-medium">Try the drag method:</p>
                <p><strong>Drag slowly</strong> from the 🎭 button above to your bookmarks bar</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-medium">3.</span>
              <div>
                <p className="font-medium">Manual installation (if drag doesn&apos;t work):</p>
                <ol className="list-decimal list-inside mt-1 space-y-1 ml-4">
                  <li>Click &quot;Copy Code&quot; button above</li>
                  <li>Right-click your bookmarks bar → &quot;Add bookmark&quot; or &quot;New bookmark&quot;</li>
                  <li>Name: <code className="px-1 rounded" style={{backgroundColor: '#F3F4F6', color: '#374151'}}>Memes Bookmarklet</code></li>
                  <li>URL/Location: Paste the copied code</li>
                  <li>Save the bookmark</li>
                </ol>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-medium">4.</span>
              <div>
                <p className="font-medium">Make sure your backend server is running:</p>
                <p>The Rust backend should be running on port 3001</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
