'use client';

import { Meme } from '@/types/meme';
import { formatDate, getImageUrl } from '@/lib/utils';
import { X, Calendar, Tag, Download, Share2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';

interface FullScreenMemeProps {
  meme: Meme;
  isOpen: boolean;
  onClose: () => void;
}

export default function FullScreenMeme({ meme, isOpen, onClose }: FullScreenMemeProps) {
  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const imageUrl = getImageUrl(meme.image_url);
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `meme-${meme.id}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this meme!',
          text: 'Awesome meme from the public database',
          url: window.location.href,
        });
      } catch {
        // User cancelled or share failed
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      // Could add a toast notification here
      alert('Link copied to clipboard!');
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between p-4 md:p-6">
          <div className="flex items-center gap-4">
            {/* Header content can be added here if needed */}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Share meme"
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Download meme"
            >
              <Download size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Close (Esc)"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="flex items-center justify-center min-h-screen p-4 md:p-8"
        onClick={onClose}
      >
        <div 
          className="relative max-w-full max-h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={getImageUrl(meme.image_url)}
            alt="Meme"
            width={1200}
            height={800}
            className="max-w-full max-h-[calc(100vh-8rem)] object-contain rounded-lg shadow-2xl"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-meme.svg';
            }}
            priority
          />
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/50 to-transparent">
        <div className="p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Tags - Filter out system tags */}
            {(() => {
              const systemTags = ['bookmarklet', 'drag-saved', 'browser-extension', 'saved'];
              const visibleTags = meme.tags.filter(tag => !systemTags.includes(tag.toLowerCase()));
              return visibleTags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-blue-400 flex-shrink-0" />
                  <div className="flex flex-wrap gap-2">
                    {visibleTags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-500/20 text-blue-200 text-sm rounded-md font-medium border border-blue-400/30"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Date */}
            <div className="flex items-center gap-2 text-white/70">
              <Calendar size={16} />
              <span className="text-sm">{formatDate(meme.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
