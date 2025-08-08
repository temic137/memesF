'use client';

import { useState, memo } from 'react';
import { Meme } from '@/types/meme';
import { formatDate, getImageUrl } from '@/lib/utils';
import { Trash2, Eye } from 'lucide-react';
import Image from 'next/image';
import FullScreenMeme from './FullScreenMeme';

interface MemeCardProps {
  meme: Meme;
  onDelete?: (id: string) => void;
}

const MemeCard: React.FC<MemeCardProps> = ({ meme, onDelete }) => {
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);

  // More efficient event handlers
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent any default actions
    if (onDelete) {
      onDelete(meme.id);
    }
  };

  const handleImageClick = () => {
    setIsFullScreenOpen(true);
  };

  const handleCloseFullScreen = () => {
    setIsFullScreenOpen(false);
  };

  const systemTags = ['bookmarklet', 'drag-saved', 'browser-extension', 'saved'];
  const visibleTags = meme.tags.filter(tag => !systemTags.includes(tag.toLowerCase()));
  const hasVisibleTags = visibleTags.length > 0;
  const firstTag = hasVisibleTags ? visibleTags[0] : meme.tags[0] || 'meme';

  return (
    <>
      <div 
        className="meme-card"
        onClick={handleImageClick}
        tabIndex={0}
        role="button"
        aria-label="View meme in fullscreen"
      >
        {/* Optimized Image Container */}
        <div className="meme-card-image-container">
          <Image
            src={getImageUrl(meme.image_url)}
            alt="Meme image"
            fill
            className="meme-card-image"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-meme.svg';
            }}
            loading="lazy"
            quality={80}
          />
          
          {/* Simplified Overlay */}
          <div className="meme-card-overlay" />
          
          {/* Efficient View Indicator */}
          <div className="meme-card-view-indicator">
            <Eye size={18} strokeWidth={2} />
          </div>
          
          {/* Optimized Action Button */}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="meme-card-action-btn delete"
              title="Delete meme"
              aria-label="Delete meme"
            >
              <Trash2 size={14} strokeWidth={2} />
            </button>
          )}
          
          {/* Efficient Tag Display - Always show at least one tag for context */}
          <div className="meme-card-tags">
            <span className={`meme-card-tag ${hasVisibleTags ? 'primary' : 'system'}`}>
              #{firstTag}
            </span>
            {hasVisibleTags && visibleTags.length > 1 && (
              <span className="meme-card-tag-count" title={`${visibleTags.length - 1} more tags`}>
                +{visibleTags.length - 1}
              </span>
            )}
            {!hasVisibleTags && meme.tags.length > 1 && (
              <span className="meme-card-tag-count" title={`${meme.tags.length - 1} more tags`}>
                +{meme.tags.length - 1}
              </span>
            )}
          </div>
          
        </div>
      </div>

      <FullScreenMeme 
        meme={meme}
        isOpen={isFullScreenOpen}
        onClose={handleCloseFullScreen}
      />
    </>
  );
};

// Export memoized component for better performance
export default memo(MemeCard);
