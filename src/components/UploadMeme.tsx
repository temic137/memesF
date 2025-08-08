'use client';

import { useState, useEffect, useCallback, memo, useRef } from 'react';
import Image from 'next/image';
import { uploadMeme } from '@/lib/api';
import { UploadMemeFormData } from '@/types/meme';
import { analyzeImageForTags } from '@/lib/autoTag';
import { Upload, Plus, X, AlertCircle, Loader2, Clipboard } from 'lucide-react';

interface UploadMemeProps {
  onUploadSuccess?: () => void;
  initialData?: {
    text?: string;
    url?: string;
    imageUrl?: string;
    hasImage?: boolean;
  };
}

// Memoized PasteHint component to prevent unnecessary re-renders
const PasteHint = memo(({ show }: { show: boolean }) => (
  show ? (
    <div className="fixed top-6 right-6 alert alert-success z-50">
      <Clipboard size={16} />
      <span>Image copied! Open upload to paste it</span>
    </div>
  ) : null
));

PasteHint.displayName = 'PasteHint';

export default function UploadMeme({ onUploadSuccess, initialData }: UploadMemeProps) {
  // Use refs for values that don't need to trigger re-renders
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Use ref to track image processing state without causing re-renders
  const imageProcessingRef = useRef<boolean>(false);
  
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showPasteHint, setShowPasteHint] = useState(false);
  
  const [formData, setFormData] = useState<{
    tags: string;
    image: File | null;
    preview: string | null;
  }>({
    tags: initialData?.text ? `shared, ${initialData.text.slice(0, 20)}` : '',
    image: null,
    preview: null,
  });

  // Update form data when initialData changes - removed as we now set it initially

  // Handler for processing image files
  const handleFileSelect = useCallback((file: File) => {
    if (imageProcessingRef.current) return; // Prevent duplicate processing
    
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    imageProcessingRef.current = true;

    // Use createObjectURL instead of FileReader for better performance
    const objectUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      image: file,
      preview: objectUrl
    }));
    
    setError(null);
    imageProcessingRef.current = false;
  }, []);

  // Global paste handler with optimized event handling
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Only handle paste if modal is open or we're not in an input field
      const activeElement = document.activeElement;
      const isInInput = activeElement instanceof HTMLInputElement || 
                       activeElement instanceof HTMLTextAreaElement ||
                       activeElement?.getAttribute('contenteditable') === 'true';
      
      // Quick exit if no clipboard data
      if (!e.clipboardData?.items) return;
      
      // Find first image in clipboard
      let imageItem = null;
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        if (e.clipboardData.items[i].type.startsWith('image/')) {
          imageItem = e.clipboardData.items[i];
          break;
        }
      }
      
      // No image found
      if (!imageItem) return;
      
      if (!isOpen && !isInInput) {
        // Show paste hint for a few seconds
        setShowPasteHint(true);
        setTimeout(() => setShowPasteHint(false), 3000);
        return;
      }

      if (isOpen && !isInInput) {
        e.preventDefault();
        const blob = imageItem.getAsFile();
        if (blob) {
          handleFileSelect(blob);
        }
      }
    };

    const handleGlobalDrop = (e: DragEvent) => {
      // Prevent default browser behavior for file drops
      if (!e.dataTransfer?.types.includes('Files')) return;
      
      e.preventDefault();
      
      if (!isOpen) {
        // Auto-open modal if user drops a file anywhere
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
          setIsOpen(true);
          setTimeout(() => handleFileSelect(file), 100);
        }
      }
    };

    const handleGlobalDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('Files')) {
        e.preventDefault();
      }
    };

    document.addEventListener('paste', handlePaste);
    document.addEventListener('drop', handleGlobalDrop);
    document.addEventListener('dragover', handleGlobalDragOver);

    return () => {
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('drop', handleGlobalDrop);
      document.removeEventListener('dragover', handleGlobalDragOver);
    };
  }, [isOpen, handleFileSelect]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.image) {
      setError('Please select an image');
      return;
    }

    setLoading(true);

    try {
      // Auto-generate tags if none provided
      let finalTags = formData.tags.trim();
      if (!finalTags) {
        try {
          // Use AbortController for cancellation if needed
          const abortController = new AbortController();
          const timeoutId = setTimeout(() => abortController.abort(), 5000); // 5s timeout
          
          const result = await analyzeImageForTags(formData.image);
          clearTimeout(timeoutId);
          
          finalTags = result.tags.join(', ') || 'funny, meme';
        } catch {
          finalTags = 'funny, meme';
        }
      }

      const uploadData: UploadMemeFormData = {
        tags: finalTags,
        image: formData.image,
      };

      const response = await uploadMeme(uploadData);

      if (response.success) {
        // Clean up object URL to prevent memory leaks
        if (formData.preview) {
          URL.revokeObjectURL(formData.preview);
        }
        
        setFormData({ tags: '', image: null, preview: null });
        setIsOpen(false);
        onUploadSuccess?.();
      } else {
        setError(response.message || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }, [formData, onUploadSuccess]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const resetForm = useCallback(() => {
    // Clean up object URL to prevent memory leaks
    if (formData.preview) {
      URL.revokeObjectURL(formData.preview);
    }
    setFormData({ tags: '', image: null, preview: null });
    setError(null);
  }, [formData.preview]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (formData.preview) {
        URL.revokeObjectURL(formData.preview);
      }
    };
  }, [formData.preview]);

  if (!isOpen) {
    return (
      <>
        <PasteHint show={showPasteHint} />
        <div className="group fixed bottom-8 right-8 z-40">
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="text-black text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg" style={{backgroundColor: '#00FF88'}}>
              Upload a meme
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent" style={{borderTopColor: '#00FF88'}}></div>
            </div>
          </div>
          
          <button
            onClick={() => setIsOpen(true)}
            className="group-hover:scale-110 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-black transition-all duration-300 hover:shadow-2xl"
            style={{backgroundColor: '#00FF88'}}
            title="Upload a meme"
          >
            <Plus size={28} className="drop-shadow-sm" />
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <PasteHint show={showPasteHint} />
              <div className="modal-overlay">
          <div className="modal-content max-w-sm sm:max-w-md md:max-w-lg">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100 cluster">
          <h2 className="flex-1" style={{
            color: '#FFFFFF',
            textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
          }}>Upload Meme</h2>
          <button
            onClick={() => {
              if (formData.preview) {
                URL.revokeObjectURL(formData.preview);
              }
              setIsOpen(false);
            }}
            className="btn btn-ghost"
            title="Close upload modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {error && (
            <div className="alert alert-error mb-6">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="stack">
            {/* File Upload Area */}
            <div>
              <div
                className={`card transition-all cursor-pointer ${
                  dragActive
                    ? 'border-primary bg-primary-light'
                    : formData.image
                      ? 'border-success bg-success-light'
                      : 'hover:border-gray-300'
                }`}
                style={{padding: '48px 24px', textAlign: 'center'}}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  ref={fileInputRef}
                />

                {formData.preview ? (
                  <div className="stack">
                    <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden border">
                      {/* Using next/image with priority and quality optimization */}
                      <Image
                        src={formData.preview}
                        alt="Preview"
                        fill
                        priority
                        quality={80}
                        loading="eager"
                        className="object-cover"
                      />
                    </div>
                    <p className="font-medium text-gray-700">{formData.image?.name}</p>
                    <div className="cluster">
                      <label
                        htmlFor="file-upload"
                        className="btn btn-secondary"
                      >
                        Change Image
                      </label>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="btn btn-danger"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="stack">
                    <div className="text-4xl mb-4">📁</div>
                    <div>
                      <p className="text-lg font-medium mb-2" style={{
                        color: '#FFFFFF',
                        textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                      }}>
                        Upload your meme
                      </p>
                      <p className="mb-6" style={{
                        color: '#FFFFFF',
                        textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                      }}>Drag & drop or click to browse</p>
                      <div className="cluster justify-center text-sm mb-6" style={{
                        color: '#FFFFFF',
                        textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                      }}>
                        <div className="cluster-sm">
                          <Upload size={16} />
                          <span>Drag & Drop</span>
                        </div>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <div className="cluster-sm">
                          <Clipboard size={16} />
                          <span>Ctrl+V</span>
                        </div>
                      </div>
                    </div>
                    <label
                      htmlFor="file-upload"
                      className="btn btn-primary"
                    >
                      Choose Image
                    </label>
                    <p className="text-xs" style={{
                      color: '#FFFFFF',
                      textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                    }}>PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields - Only show when image is selected */}
            {formData.image && (
              <div>
                <div className="card">
                  <label htmlFor="tags" className="label" style={{
                    color: '#FFFFFF',
                    textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                  }}>
                    Tags <span style={{
                      color: '#FFFFFF',
                      textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                    }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData((prev: {tags: string; image: File | null; preview: string | null}) => ({ ...prev, tags: e.target.value }))}
                    className="input"
                    placeholder="funny, relatable, viral..."
                  />
                  <p className="text-sm mt-2" style={{
                    color: '#FFFFFF',
                    textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                  }}>
                    Separate with commas, or leave empty for automatic tag generation.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {formData.image && (
              <div className="cluster pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn btn-ghost flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`btn flex-1 ${loading ? 'btn-disabled' : 'btn-primary'}`}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload Meme
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
        </div>
      </div>
    </>
  );
}