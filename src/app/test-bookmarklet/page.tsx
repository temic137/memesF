'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TestBookmarkletPage() {
  const router = useRouter();
  const [draggedContent, setDraggedContent] = useState('');
  const [chatMessages, setChatMessages] = useState([
    'Hey! Testing the meme bookmarklet...',
    'Can you send that funny meme?'
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [pageStats, setPageStats] = useState({
    images: 0,
    textInputs: 0,
    domain: ''
  });

  // Update page stats on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageStats({
        images: document.querySelectorAll('img').length,
        textInputs: document.querySelectorAll('textarea, input[type="text"], [contenteditable]').length,
        domain: window.location.hostname
      });
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedData = e.dataTransfer.getData('text/plain') || 
                       e.dataTransfer.getData('text/uri-list') ||
                       e.dataTransfer.getData('text/html');
    setDraggedContent(droppedData);
    
    // If it's an image URL, add it to chat
    if (droppedData.includes('http') && droppedData.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
      setChatMessages(prev => [...prev, `Image: ${droppedData}`]);
    } else {
      setChatMessages(prev => [...prev, droppedData]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const sendMessage = () => {
    if (currentMessage.trim()) {
      setChatMessages(prev => [...prev, currentMessage]);
      setCurrentMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to MemeDB</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Title and Instructions */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 Bookmarklet Test Environment
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            This page simulates different website environments to test both Save Mode and Search Mode 
            of the MemeDB bookmarklet. Install the bookmarklet first, then test it here!
          </p>
          
          {/* Quick Install Link */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 inline-block">
            <p className="text-blue-800 font-medium mb-2">📌 Need the bookmarklet?</p>
            <button
              onClick={() => router.push('/save-memes')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Bookmarklet
            </button>
          </div>
        </div>

        {/* Test Environments Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          
          {/* Save Mode Test - Simulates Image-Heavy Sites */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-green-100 px-6 py-4 border-b border-green-200">
              <h2 className="text-xl font-semibold text-green-800 flex items-center gap-2">
                💾 Save Mode Test
                <span className="text-sm font-normal text-green-600">(Simulates Reddit/Twitter)</span>
              </h2>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                This section has many <strong>real meme images</strong> to trigger Save Mode. Click the bookmarklet here to test saving actual memes.
              </p>
              
              {/* Mock Social Media Posts with Images */}
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">@meme_lord</span>
                  </div>
                  <p className="mb-3">When you&apos;re debugging at 3 AM and this happens:</p>
                  <img 
                    src="https://i.imgflip.com/1g8my4.jpg" 
                    alt="Drake pointing meme"
                    className="w-full max-w-sm rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                    draggable
                  />
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
                    <span className="font-medium">@coding_humor</span>
                  </div>
                  <p className="mb-3">Every developer ever:</p>
                  <img 
                    src="https://i.imgflip.com/2/1bij.jpg" 
                    alt="Distracted boyfriend meme"
                    className="w-full max-w-sm rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                    draggable
                  />
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full"></div>
                    <span className="font-medium">@reaction_gif_central</span>
                  </div>
                  <p className="mb-3">Me trying to explain my code to my team:</p>
                  <img 
                    src="https://i.imgflip.com/30b1gx.jpg" 
                    alt="This is fine meme"
                    className="w-full max-w-sm rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                    draggable
                  />
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">✅ Test Save Mode:</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>1. Click bookmarklet → Should show &quot;Drop Memes Here&quot; button</li>
                  <li>2. Drag any real meme image above to the button</li>
                  <li>3. Choose AI or manual tagging</li>
                  <li>4. Verify meme saves successfully</li>
                  <li>5. Button should stay open for more saves (only closes when you click ✕)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Search Mode Test - Simulates Chat Apps */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-100 px-6 py-4 border-b border-blue-200">
              <h2 className="text-xl font-semibold text-blue-800 flex items-center gap-2">
                🔍 Search Mode Test
                <span className="text-sm font-normal text-blue-600">(Simulates Discord/Slack)</span>
              </h2>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                This section simulates a chat environment. Click the bookmarklet here to test searching memes.
              </p>
              
              {/* Mock Chat Interface */}
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="text-white text-sm mb-2 font-medium">#general</div>
                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                  {chatMessages.map((message, index) => (
                    <div key={index} className="text-gray-300 text-sm">
                      <span className="text-blue-400 font-medium">TestUser:</span> {message}
                    </div>
                  ))}
                </div>
                
                {/* Chat Input - Drag Target */}
                <div className="relative">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message... (or drag memes here!)"
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  />
                  <button
                    onClick={sendMessage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Send
                  </button>
                </div>
              </div>
              
              {/* Email-style Text Area */}
              <div className="border border-gray-300 rounded-lg p-4 mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Email Composer:</div>
                <textarea
                  placeholder="Compose your email... (drag memes here too!)"
                  className="w-full h-24 p-3 border border-gray-300 rounded resize-none focus:border-blue-500 focus:outline-none"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                />
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">✅ Test Search Mode:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>1. Click bookmarklet → Should show &quot;Drop Memes Here&quot; button</li>
                  <li>2. Hover button → &quot;🔍 Search Mode&quot; appears</li>
                  <li>3. Click &quot;Search Mode&quot; → Search panel opens (non-blocking)</li>
                  <li>4. Search for memes → Drag results to chat/email above</li>
                  <li>5. Verify page interaction still works</li>
                  <li>6. Search panel stays open until you manually close it</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-yellow-100 px-6 py-4 border-b border-yellow-200">
            <h2 className="text-xl font-semibold text-yellow-800 flex items-center gap-2">
              🔧 Debug Information
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Current Page Context:</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Images on page:</strong> {pageStats.images}</div>
                  <div><strong>Text inputs:</strong> {pageStats.textInputs}</div>
                  <div><strong>Domain:</strong> {pageStats.domain}</div>
                  <div><strong>Expected mode:</strong> <span className="text-blue-600 font-medium">Depends on bookmarklet logic</span></div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Last Dragged Content:</h3>
                <div className="bg-gray-100 p-3 rounded text-sm font-mono break-all max-h-32 overflow-y-auto">
                  {draggedContent || 'No content dragged yet...'}
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">🧪 Testing Checklist:</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-yellow-700">
                <div>
                  <strong>Save Mode:</strong>
                  <ul className="mt-1 space-y-1 list-disc list-inside">
                    <li>Button appears in top-right</li>
                    <li>Drag & drop works</li>
                    <li>Visual feedback on hover</li>
                    <li>AI tagging popup</li>
                    <li>Successful upload</li>
                  </ul>
                </div>
                <div>
                  <strong>Search Mode:</strong>
                  <ul className="mt-1 space-y-1 list-disc list-inside">
                    <li>Hover reveals search button</li>
                    <li>Search panel is non-blocking</li>
                    <li>Real-time search works</li>
                    <li>Memes are draggable</li>
                    <li>Drop into text fields works</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Test Scenarios */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
          <div className="bg-purple-100 px-6 py-4 border-b border-purple-200">
            <h2 className="text-xl font-semibold text-purple-800">🎯 Advanced Test Scenarios</h2>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Mobile Simulation */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">📱 Mobile Simulation</h3>
                <div className="bg-gray-100 p-3 rounded-lg text-center">
                  <div className="w-16 h-24 bg-gray-300 rounded mx-auto mb-2 flex items-center justify-center">
                    <span className="text-xs text-gray-600">Mobile View</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Resize browser to mobile width and test bookmarklet behavior
                  </p>
                </div>
              </div>
              
              {/* External Image Test */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">🖼️ External Images</h3>
                <img 
                  src="https://i.imgflip.com/1ur9b0.jpg"
                  alt="Surprised Pikachu meme"
                  className="w-full rounded border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                  draggable
                />
                <p className="text-xs text-gray-600 mt-2">
                  Test with external image URLs
                </p>
              </div>
              
              {/* Performance Test */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">⚡ Performance</h3>
                <div className="space-y-2">
                  {[
                    'https://i.imgflip.com/345v97.jpg', // Expanding brain
                    'https://i.imgflip.com/26am.jpg',   // Socially awkward penguin
                    'https://i.imgflip.com/1ihzfe.jpg', // Mocking SpongeBob
                    'https://i.imgflip.com/1otk96.jpg', // Distracted boyfriend
                    'https://i.imgflip.com/4t0m5.jpg'   // Woman yelling at cat
                  ].map((src, i) => (
                    <img 
                      key={i}
                      src={src} 
                      alt={`Perf test ${i + 1}`}
                      className="w-12 h-8 inline-block mr-1 rounded border cursor-pointer"
                      draggable
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Multiple images for performance testing
                </p>
              </div>
            </div>
            
            {/* Test Instructions */}
            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-3">📋 Complete Test Checklist</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-purple-700">Functionality Tests:</strong>
                  <ul className="mt-2 space-y-1 text-purple-600">
                    <li>✓ Smart mode detection works</li>
                    <li>✓ Save mode drag & drop</li>
                    <li>✓ Search mode hover activation</li>
                    <li>✓ Non-blocking search overlay</li>
                    <li>✓ AI tagging popup</li>
                    <li>✓ Manual tagging works</li>
                    <li>✓ Search results are draggable</li>
                    <li>✓ Drop into text fields works</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-purple-700">Error Handling:</strong>
                  <ul className="mt-2 space-y-1 text-purple-600">
                    <li>✓ Invalid image formats</li>
                    <li>✓ Network errors</li>
                    <li>✓ Backend offline scenario</li>
                    <li>✓ Large file handling</li>
                    <li>✓ Empty search results</li>
                    <li>✓ Multiple bookmarklet clicks</li>
                    <li>✓ Escape key closes modals</li>
                    <li>✓ Click outside closes popups</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Browser Compatibility Notice */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6 text-center">
          <h3 className="font-semibold text-gray-800 mb-2">🌐 Browser Compatibility</h3>
          <p className="text-gray-600 text-sm mb-4">
            Test the bookmarklet in different browsers: Chrome, Firefox, Safari, Edge. 
            Drag & drop behavior may vary slightly between browsers.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-3 rounded border">
              <strong>Chrome</strong><br/>
              ✅ Full support
            </div>
            <div className="bg-white p-3 rounded border">
              <strong>Firefox</strong><br/>
              ✅ Full support
            </div>
            <div className="bg-white p-3 rounded border">
              <strong>Safari</strong><br/>
              ⚠️ Limited drag support
            </div>
            <div className="bg-white p-3 rounded border">
              <strong>Edge</strong><br/>
              ✅ Full support
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            🔄 Reload Page
          </button>
          <button
            onClick={() => {
              const overlay = document.getElementById('memedb-overlay');
              if (overlay) overlay.remove();
            }}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            🧹 Clear Bookmarklet
          </button>
          <button
            onClick={() => router.push('/save-memes')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📌 Get Bookmarklet
          </button>
          <button
            onClick={() => {
              // Force refresh the bookmarklet script
              const script = document.createElement('script');
              script.src = `${window.location.origin}/memedb-bookmarklet.js?v=${Date.now()}`;
              document.head.appendChild(script);
            }}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            🔄 Refresh Bookmarklet
          </button>
        </div>
      </main>
    </div>
  );
}
