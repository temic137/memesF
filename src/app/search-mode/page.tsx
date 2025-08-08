'use client';

import { useState, useEffect, useCallback } from 'react';
import { Meme, SearchQuery } from '@/types/meme';
import { getMemes, searchMemes } from '@/lib/api';
import { Search, X, TrendingUp, Shuffle, Clock, Grab } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

function MemeSearchMode() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedMeme, setDraggedMeme] = useState<Meme | null>(null);

  // Load memes function
  const loadMemes = useCallback(async (query?: SearchQuery | 'random' | 'trending' | 'recent') => {
    setLoading(true);
    
    try {
      let response;
      
      if (query === 'random') {
        response = await getMemes();
        if (response.success && response.data) {
          // Shuffle for random effect
          const shuffled = [...response.data].sort(() => Math.random() - 0.5);
          response.data = shuffled;
        }
      } else if (query === 'trending' || query === 'recent') {
        response = await getMemes();
      } else if (query && typeof query === 'object') {
        response = await searchMemes(query);
      } else {
        response = await getMemes();
      }

      if (response.success && response.data) {
        setMemes(response.data);
      } else {
        setMemes([]);
      }
    } catch (err) {
      console.error('Failed to load memes:', err);
      setMemes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadMemes();
  }, [loadMemes]);

  // Search with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery.length === 0) {
        loadMemes();
      } else if (searchQuery.length >= 2) {
        loadMemes({ q: searchQuery });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, loadMemes]);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent<HTMLImageElement>, meme: Meme) => {
    setDraggedMeme(meme);
    const imageUrl = getImageUrl(meme.image_url);
    const title = meme.tags.length > 0 ? meme.tags.join(', ') : 'Untitled';
    
    // Set drag data in multiple formats for compatibility
    e.dataTransfer.setData('text/uri-list', imageUrl);
    e.dataTransfer.setData('text/plain', imageUrl);
    e.dataTransfer.setData('text/html', `<img src="${imageUrl}" alt="${title}">`);
    
    // Add visual feedback
    setTimeout(() => {
      addDropZoneHighlights();
    }, 50);
  };

  const handleDragEnd = () => {
    setDraggedMeme(null);
    removeDropZoneHighlights();
  };

  const addDropZoneHighlights = () => {
    const dropZones = document.querySelectorAll(`
      textarea,
      [contenteditable="true"],
      input[type="text"],
      .message-input,
      [class*="input"],
      [class*="message"],
      [class*="compose"],
      [role="textbox"]
    `);
    
    dropZones.forEach((zone: Element) => {
      const htmlZone = zone as HTMLElement;
      if (htmlZone.offsetWidth > 0 && htmlZone.offsetHeight > 0) {
        htmlZone.style.border = '2px dashed #10b981';
        htmlZone.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
        htmlZone.classList.add('meme-drop-zone');
      }
    });
  };

  const removeDropZoneHighlights = () => {
    const dropZones = document.querySelectorAll('.meme-drop-zone');
    dropZones.forEach((zone: Element) => {
      const htmlZone = zone as HTMLElement;
      htmlZone.style.border = '';
      htmlZone.style.backgroundColor = '';
      htmlZone.classList.remove('meme-drop-zone');
    });
  };

  const truncateTitle = (title: string, maxLength: number) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 3) + '...';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-bold">🎭 Find Memes</h1>
            <button
              onClick={() => window.close()}
              className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search memes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
            />
          </div>
          
          {/* Quick Actions */}
          {/* <div className="flex gap-2 justify-center">
            <button
              onClick={() => loadMemes('trending')}
              className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-full text-xs font-medium hover:bg-orange-600 transition-colors"
            >
              <TrendingUp size={12} />
              Trending
            </button>
            <button
              onClick={() => loadMemes('random')}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white rounded-full text-xs font-medium hover:bg-purple-600 transition-colors"
            >
              <Shuffle size={12} />
              Random
            </button>
            <button
              onClick={() => loadMemes('recent')}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-full text-xs font-medium hover:bg-green-600 transition-colors"
            >
              <Clock size={12} />
              Recent
            </button>
          </div> */}
        </div>

        {/* Results Section */}
        <div className="h-96 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              🔍 Searching...
            </div>
          ) : memes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? `No results for "${searchQuery}" 😢` : 'No memes found 😢'}
              <br />
              <small className="text-gray-400">Try different keywords</small>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {memes.map((meme) => {
                const displayTitle = meme.tags.length > 0 ? meme.tags.join(', ') : 'Untitled';
                return (
                  <div
                    key={meme.id}
                    className="group relative bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-200 hover:scale-105 cursor-grab active:cursor-grabbing"
                    title={`${displayTitle} - Drag me to any chat or text area!`}
                  >
                    <img
                      src={getImageUrl(meme.image_url)}
                      alt={displayTitle}
                      draggable
                      onDragStart={(e) => handleDragStart(e, meme)}
                      onDragEnd={handleDragEnd}
                      className="w-full h-20 object-cover"
                    />
                    <div className="p-2">
                      <div className="text-xs text-center text-gray-700 font-medium truncate">
                        {truncateTitle(displayTitle, 20)}
                      </div>
                    </div>
                    
                    {/* Drag indicator */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black/50 text-white p-1 rounded">
                        <Grab size={12} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hint Section */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
          <div className="text-xs text-gray-600">
            💡 Drag any meme into chat or text area below
          </div>
          {draggedMeme && (
            <div className="mt-2 text-xs text-purple-600 font-medium">
              🎯 Dragging: {truncateTitle(draggedMeme.tags.length > 0 ? draggedMeme.tags.join(', ') : 'Untitled', 30)}
            </div>
          )}
        </div>
      </div>

      {/* Demo Text Area for Testing */}
      <div className="max-w-md mx-auto mt-6 p-4 bg-white rounded-lg shadow-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Chat Area (Try dropping memes here!)</h3>
        <textarea
          placeholder="Drop memes here to test the drag & drop functionality..."
          className="w-full h-24 p-3 border-2 border-dashed border-gray-300 rounded-lg resize-none focus:border-purple-500 focus:outline-none"
          onDrop={(e) => {
            e.preventDefault();
            const imageUrl = e.dataTransfer.getData('text/plain');
            if (imageUrl) {
              e.currentTarget.value += `\n[Meme: ${imageUrl}]\n`;
            }
          }}
          onDragOver={(e) => e.preventDefault()}
        />
      </div>

      {/* Instructions */}
      <div className="max-w-md mx-auto mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">How to use:</h3>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Search for memes using the search box</li>
          <li>2. Click and drag any meme thumbnail</li>
          <li>3. Drop it into any chat, text area, or messaging app</li>
          <li>4. The image will be automatically inserted!</li>
        </ol>
      </div>
    </div>
  );
}

export default MemeSearchMode;
