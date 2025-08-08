'use client';

import { SearchQuery } from '@/types/meme';
import { Search, X, RefreshCw, Circle } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface HeaderProps {
  backendStatus: 'checking' | 'online' | 'offline';
  loading: boolean;
  currentQuery: SearchQuery | null;
  loadMemes: (query?: SearchQuery) => void;
  handleSearchString: (queryString: string) => void;
  handleClearSearch: () => void;
}

const Header: React.FC<HeaderProps> = ({
  backendStatus,
  loading,
  currentQuery,
  loadMemes,
  handleSearchString,
  handleClearSearch,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      handleSearchString(searchInput.trim());
    }
  };

  const handleClear = () => {
    setSearchInput('');
    handleClearSearch();
  };

  return (
    <header className="sticky top-0 z-50 shadow-md" 
            style={{backgroundColor: '#00FF88'}}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Compact Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            {/* <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 shadow-md" style={{backgroundColor: '#FFFFFF'}}>
              <span className="text-lg sm:text-xl font-bold" style={{
                color: '#FFFFFF',
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
              }}>M</span>
            </div> */}
            <h1 className="text-lg sm:text-xl font-bold tracking-tight hidden sm:block" style={{
              color: '#FFFFFF',
              textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
            }}>Memes</h1>
          </Link>

          {/* Optimized Search Bar */}
          <div className="flex-1 max-w-xs sm:max-w-md mx-2 sm:mx-6">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{color: '#666666'}} />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search memes..."
                  className="w-full pl-10 pr-10 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all placeholder-gray-500 text-base font-medium"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#1A1A1A',
                    color: '#1A1A1A',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                />
                {(searchInput || currentQuery) && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-70 transition-colors"
                    style={{color: '#666666'}}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Streamlined Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Compact Status Indicator */}
            <div className="flex items-center gap-2">
              <Circle 
                size={8} 
                className={`${
                  backendStatus === 'online' ? 'text-green-600 fill-current' :
                  backendStatus === 'offline' ? 'text-red-600 fill-current' :
                  'text-yellow-600 fill-current animate-pulse'
                }`} 
              />
            </div>

            {/* Compact Refresh Button */}
            <button
              onClick={() => loadMemes(currentQuery || undefined)}
              disabled={loading}
              className="p-1.5 sm:p-2 rounded-lg transition-all disabled:opacity-50 hover:shadow-md"
              style={{
                color: '#FFFFFF',
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
              }}
              title="Refresh"
            >
              <RefreshCw size={16} className={`${loading ? 'animate-spin' : ''} sm:w-5 sm:h-5`} />
            </button>

            {/* Compact Save Memes / Bookmarklet Link */}
            <Link
              href="/save-memes"
              className="px-2 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base font-bold transition-all rounded-lg hover:shadow-md hidden sm:inline-flex items-center"
              style={{
                color: '#FFFFFF',
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
              }}
            >
              Bookmarklet
            </Link>
          </div>
        </div>

        {/* Compact Search Results Info */}
        {currentQuery && (
          <div className="pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold" style={{
              color: '#FFFFFF',
              textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
            }}>
              <span>Search results</span>
              {currentQuery.q && (
                <span className="px-2 py-1 text-xs font-bold rounded-md" style={{
                  color: '#FFFFFF',
                  textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                }}>
                  &ldquo;{currentQuery.q}&rdquo;
                </span>
              )}
              {currentQuery.tag && (
                <span className="px-2 py-1 text-xs font-bold rounded-md" style={{
                  color: '#FFFFFF',
                  textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                }}>
                  #{currentQuery.tag}
                </span>
              )}
            </div>
            <button 
              onClick={handleClear}
              className="text-sm font-semibold hover:opacity-70 transition-colors"
              style={{
                color: '#FFFFFF',
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
              }}
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;