'use client';

import { useState, useEffect, useCallback } from 'react';
import { Meme, SearchQuery } from '@/types/meme';
import { getMemes, searchMemes, deleteMeme, healthCheck } from '@/lib/api';
import dynamic from 'next/dynamic';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { AlertCircle, Upload, Bookmark } from 'lucide-react';
import Header from '@/components/Header';
import MemeCard from '@/components/MemeCard';

// Lazy load components that aren't needed immediately
const UploadMeme = dynamic(() => import('@/components/UploadMeme'), {
  ssr: false
});

function Home() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [currentQuery, setCurrentQuery] = useState<SearchQuery | null>(null);

  // Check backend health once on component mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await healthCheck();
        setBackendStatus('online');
      } catch {
        setBackendStatus('offline');
      }
    };
    
    checkBackend();
  }, []);

  // Load memes function
  const loadMemes = useCallback(async (query?: SearchQuery) => {
    setLoading(true);
    setError(null);

    try {
      const response = query && (query.q || query.tag || query.limit)
        ? await searchMemes(query)
        : await getMemes();

      if (response.success && response.data) {
        setMemes(response.data);
        setCurrentQuery(query || null);
      } else {
        setError(response.message || 'Failed to load memes');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load memes');
      setBackendStatus('offline');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadMemes();
  }, [loadMemes]);

  // Search handlers
  const handleSearchString = useCallback((queryString: string) => {
    const searchQuery: SearchQuery = { q: queryString };
    loadMemes(searchQuery);
  }, [loadMemes]);

  const handleClearSearch = useCallback(() => {
    setCurrentQuery(null);
    loadMemes();
  }, [loadMemes]);

  // Handle delete with optimistic UI update
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this meme?')) {
      return;
    }

    const previousMemes = [...memes];
    setMemes(memes => memes.filter(meme => meme.id !== id));

    try {
      const response = await deleteMeme(id);
      if (!response.success) {
        setMemes(previousMemes);
        alert('Failed to delete meme: ' + response.message);
      }
    } catch (err) {
      setMemes(previousMemes);
      alert('Failed to delete meme: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [memes]);

  // Handle upload success
  const handleUploadSuccess = useCallback(() => {
    loadMemes(currentQuery || undefined);
  }, [loadMemes, currentQuery]);

  return (
    <div className="min-h-screen bg-white">
      <Header
        backendStatus={backendStatus}
        loading={loading}
        currentQuery={currentQuery}
        loadMemes={loadMemes}
        handleSearchString={handleSearchString}
        handleClearSearch={handleClearSearch}
      />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Quick Actions */}
        {!currentQuery && (
          <div className="mb-6 flex gap-2 justify-center">
            {/* <a
              href="/save-memes.html"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors no-underline bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700"
              style={{
                color: '#FFFFFF',
                textShadow: 'none'
              }}
            >
              🎯 Get Bookmarklets
            </a> */}

            {/* <a
              href="/save-memes"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors no-underline"
              style={{
                color: '#FFFFFF',
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
              }}
            >
              <Bookmark size={14} />
              Bookmarklet
            </a> */}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingSkeleton />}

        {/* Empty State */}
        {!loading && !error && memes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium mb-2" style={{
              color: '#FFFFFF',
              textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
            }}>
              {currentQuery ? 'No memes found' : 'Start Your Collection'}
            </h3>
            
            <p className="text-sm mb-6" style={{
              color: '#FFFFFF',
              textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
            }}>
              {currentQuery 
                ? 'Try adjusting your search terms' 
                : 'Upload your first meme or use the bookmarklet'
              }
            </p>

            {currentQuery ? (
              <button
                onClick={handleClearSearch}
                className="px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  color: '#FFFFFF',
                  textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                }}
              >
                Show All Memes
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <button
                  onClick={handleUploadSuccess}
                  className="px-3 sm:px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    color: '#FFFFFF',
                    textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                  }}
                >
                  Upload Meme
                </button>
                <a
                  href="/save-memes"
                  className="px-3 sm:px-4 py-2 text-sm font-medium transition-colors no-underline"
                  style={{
                    color: '#FFFFFF',
                    textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                  }}
                >
                  Get Bookmarklet
                </a>
              </div>
            )}
          </div>
        )}

        {/* Memes Grid */}
        {!loading && !error && memes.length > 0 && (
          <div>
            {/* Results Info */}
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <span className="text-sm" style={{
                color: '#FFFFFF',
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
              }}>
                {memes.length} meme{memes.length !== 1 ? 's' : ''}
              </span>
              {currentQuery && (
                <span className="text-xs" style={{
                  color: '#FFFFFF',
                  textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                }}>
                  Filtered results
                </span>
              )}
            </div>
            
            {/* Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
              {memes.map(meme => (
                <MemeCard
                  key={meme.id}
                  meme={meme}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Results Limit Notice */}
            {memes.length >= 50 && (
              <div className="text-center mt-6">
                <span className="text-xs" style={{
                  color: '#FFFFFF',
                  textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                }}>
                  Showing first {memes.length} results
                </span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Lazy-loaded Upload FAB */}
      <UploadMeme onUploadSuccess={handleUploadSuccess} />
    </div>
  );
}

export default Home;
