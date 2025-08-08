'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, ChevronDown, Tag, Zap, Sparkles, TrendingUp } from 'lucide-react';
import { getAllAvailableTags, getTagsByCategory, getRelatedTags, getTagSynonyms } from '@/lib/autoTag';

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  onCategoryFilter?: (category: string) => void;
  onSortChange?: (sort: string) => void;
}

const SEARCH_HINTS = [
  'Search for "funny cats"',
  'Filter by tag: "programming"',
  'Find "work memes"',
  'Discover "relatable moments"',
  'Try "drake-pointing" templates',
  'Search "wholesome" content'
];

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, onClear, onCategoryFilter, onSortChange }) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [currentHint, setCurrentHint] = useState(0);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get all available tags from the hierarchy
  const allTags = getAllAvailableTags();
  const popularTags = allTags.slice(0, 20); // Top 20 tags

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHint((prev) => (prev + 1) % SEARCH_HINTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = allTags.filter(tag => 
        tag.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredTags(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredTags(popularTags.slice(0, 8));
      setShowSuggestions(false);
    }
  }, [query, allTags, popularTags]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowCategoryFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    const timeoutId = setTimeout(() => {
      if (value.trim()) {
        onSearch(value.trim());
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    onSearch(tag);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    setSelectedCategory('');
    onClear();
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (query.length === 0) {
      setFilteredTags(popularTags.slice(0, 8));
      setShowSuggestions(true);
    } else if (filteredTags.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    setShowCategoryFilter(false);
    onCategoryFilter?.(category);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    onSortChange?.(sort);
  };

  const getCategoryTags = (category: string) => {
    switch (category) {
      case 'templates':
        return getTagsByCategory('templates');
      case 'emotions':
        return getTagsByCategory('emotions');
      case 'topics':
        return getTagsByCategory('topics');
      case 'relatable':
        return getTagsByCategory('relatable');
      default:
        return [];
    }
  };

  return (
    <div className="w-full space-y-4" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search 
            size={20} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            ref={inputRef}
            type="text"
            placeholder={SEARCH_HINTS[currentHint]}
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className="w-full pl-10 pr-12 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'rgba(57,255,20,0.1)',
              borderColor: 'rgba(0,247,255,0.3)',
              color: '#FFFFFF',
              backdropFilter: 'blur(10px)'
            }}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 hover:bg-opacity-20 transition-colors"
            >
              <X size={16} style={{color: '#D3D3D3'}} />
            </button>
          )}
        </div>

        {/* Enhanced search suggestions */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-lg shadow-xl border overflow-hidden z-50" style={{backgroundColor: 'rgba(57,255,20,0.95)', borderColor: 'rgba(0,247,255,0.3)', backdropFilter: 'blur(10px)'}}>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={16} style={{color: '#D3D3D3'}} />
                <span className="text-sm font-medium" style={{color: '#D3D3D3'}}>
                  {query ? 'Matching tags' : 'Popular tags'}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {filteredTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="px-3 py-1.5 text-sm rounded-lg transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: 'rgba(0,247,255,0.2)', 
                      color: '#FFFFFF',
                      border: '1px solid rgba(0,247,255,0.3)'
                    }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              {query && filteredTags.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm" style={{color: '#D3D3D3'}}>No matching tags found</p>
                  <button
                    onClick={() => handleTagClick(query)}
                    className="mt-2 px-4 py-2 text-white text-sm rounded-lg transition-colors"
                    style={{backgroundColor: '#00FF88'}}
                  >
                    Search for &quot;{query}&quot;
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </form>

      {/* Enhanced filter controls */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Category Filter */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: selectedCategory ? 'rgba(0,247,255,0.3)' : 'rgba(0,247,255,0.1)',
              color: '#FFFFFF',
              border: '1px solid rgba(0,247,255,0.3)'
            }}
          >
            <Filter size={16} />
            <span className="text-sm">
              {selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'Category'}
            </span>
            <ChevronDown size={14} />
          </button>

          {showCategoryFilter && (
            <div className="absolute top-full left-0 mt-2 rounded-lg shadow-xl border overflow-hidden z-50 min-w-48" style={{backgroundColor: 'rgba(57,255,20,0.95)', borderColor: 'rgba(0,247,255,0.3)', backdropFilter: 'blur(10px)'}}>
              <div className="p-2">
                {['templates', 'emotions', 'topics', 'relatable'].map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryFilter(category)}
                    className="w-full text-left px-3 py-2 rounded text-sm transition-colors hover:bg-opacity-20"
                    style={{color: '#FFFFFF'}}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sort Options */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryFilter(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: 'rgba(0,247,255,0.1)',
              color: '#FFFFFF',
              border: '1px solid rgba(0,247,255,0.3)'
            }}
          >
            <TrendingUp size={16} />
            <span className="text-sm">
              {sortBy === 'relevance' ? 'Relevance' : 
               sortBy === 'date' ? 'Newest' : 
               sortBy === 'date_asc' ? 'Oldest' : 'Popular'}
            </span>
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Quick Actions */}
        <button
          onClick={() => onSearch('funny')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200"
          style={{
            backgroundColor: 'rgba(0,255,136,0.2)',
            color: '#FFFFFF',
            border: '1px solid rgba(0,255,136,0.3)'
          }}
        >
          <Sparkles size={16} />
          <span className="text-sm">Funny</span>
        </button>

        <button
          onClick={() => onSearch('relatable')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200"
          style={{
            backgroundColor: 'rgba(0,255,136,0.2)',
            color: '#FFFFFF',
            border: '1px solid rgba(0,255,136,0.3)'
          }}
        >
          <Zap size={16} />
          <span className="text-sm">Relatable</span>
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;
