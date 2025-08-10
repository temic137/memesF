import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Use production-ready URLs with fallbacks  
  const frontendBaseUrl = process.env.NEXT_PUBLIC_BOOKMARKLET_URL || 'http://localhost:3000';
  
  // Security: Add domain validation (for future use)
  const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') || ['localhost:3000'];
  const requestOrigin = request.headers.get('origin');
  
  // Note: Domain validation not implemented yet - consider adding for production
  console.log('Bookmarklet request from:', requestOrigin, 'Allowed:', allowedDomains);
  
  // Add basic security headers
  const securityHeaders = {
    'Content-Type': 'application/javascript',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };

  const bookmarkletCode = `javascript:(function(){
    'use strict';
    
    // Security: Validate execution environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.error('MemeDB: Invalid execution environment');
      return;
    }
    
    // Security: Check if already loaded to prevent double execution
    if (document.getElementById('memedb-bookmark')) {
      const existing = document.getElementById('memedb-bookmark');
      existing.style.animation = 'bounce 0.5s ease-in-out';
      setTimeout(() => existing.style.animation = '', 500);
      return;
    }

    // Create floating bookmarklet
    const bookmark = document.createElement('div');
    bookmark.id = 'memedb-bookmark';
    bookmark.innerHTML = '<div style="position:fixed;top:20px;right:20px;z-index:999999;background:linear-gradient(135deg,#10B981 0%,#059669 100%);color:#FFFFFF;padding:12px 16px;border-radius:12px;font-weight:700;box-shadow:0 8px 18px rgba(0,0,0,0.12);border:1px solid rgba(255,255,255,0.25);cursor:move;display:flex;align-items:center;gap:8px;min-width:140px;font-family:system-ui,sans-serif;"><span style="font-size:18px;">🎭</span><span style="font-size:14px;font-weight:700;">MemeDB</span><div style="display:flex;gap:4px;margin-left:auto;"><button style="background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.35);color:#FFFFFF;padding:4px 6px;border-radius:6px;cursor:pointer;font-size:12px;" onclick="this.parentElement.parentElement.remove();">✕</button></div></div>';
    
    // Make draggable
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    let xOffset = 0;
    let yOffset = 0;

    const mainButton = bookmark.querySelector('div');
    
    mainButton.addEventListener('mousedown', function(e) {
      if (e.target.tagName === 'BUTTON') return;
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      isDragging = true;
      mainButton.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', function(e) {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        xOffset = currentX;
        yOffset = currentY;
        bookmark.style.transform = \`translate3d(\${currentX}px, \${currentY}px, 0)\`;
      }
    });

    document.addEventListener('mouseup', function() {
      isDragging = false;
      mainButton.style.cursor = 'move';
      initialX = currentX;
      initialY = currentY;
    });

    // Handle drops
    mainButton.addEventListener('dragover', function(e) {
      e.preventDefault();
      mainButton.style.background = 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)';
      mainButton.style.animation = 'pulse 1.2s infinite';
    });

    mainButton.addEventListener('dragleave', function(e) {
      mainButton.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
      mainButton.style.animation = '';
    });

    mainButton.addEventListener('drop', async function(e) {
      e.preventDefault();
      mainButton.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
      mainButton.style.animation = '';
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          showNotification('🔍 Uploading image...', '#FFB84D');
          
          const formData = new FormData();
          formData.append('image', file);
          formData.append('source', 'bookmarklet');
          formData.append('context', window.location.hostname || 'web');

          try {
            // Security: Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
              throw new Error('File too large (max 10MB)');
            }
            
            // Security: Add timeout and credentials handling
            const response = await fetch('${frontendBaseUrl}/api/upload-bookmarklet', {
              method: 'POST',
              body: formData,
              signal: AbortSignal.timeout(30000), // 30 second timeout
              credentials: 'same-origin'
            });

            if (response.ok) {
              const result = await response.json();
              if (result.success) {
                showNotification('✅ Meme saved successfully!', '#10B981');
                // Auto-close the bookmarklet after successful save
                setTimeout(() => {
                  const bookmark = document.getElementById('memedb-bookmark');
                  if (bookmark) {
                    bookmark.remove();
                  }
                }, 2000);
              } else {
                throw new Error(result.error || 'Upload failed');
              }
            } else {
              throw new Error('Upload failed');
            }
          } catch (error) {
            console.error('Upload error:', error);
            showNotification('❌ Failed to save meme: ' + (error instanceof Error ? error.message : String(error)), '#FF4444');
          }
        } else {
          showNotification('❌ Please drop an image file', '#FF4444');
        }
      } else {
        showNotification('❌ Please drop an image file', '#FF4444');
      }
    });

    function showNotification(text, color = '#10B981') {
      // Security: Sanitize notification text to prevent XSS
      const sanitizedText = String(text).replace(/[<>&"']/g, function(match) {
        const escapeMap = {'<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;'};
        return escapeMap[match];
      });
      
      const notification = document.createElement('div');
      notification.textContent = sanitizedText;
      notification.style.cssText = \`
        position: fixed;
        top: 80px;
        right: 20px;
        background: \${color};
        color: #FFFFFF;
        padding: 10px 14px;
        border-radius: 8px;
        font-family: system-ui, sans-serif;
        font-size: 12px;
        font-weight: 600;
        z-index: 1000001;
        box-shadow: 0 4px 16px rgba(0,0,0,0.24);
        animation: slideIn 0.25s ease-out;
      \`;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = \`
      @keyframes pulse {
        0% { box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12); }
        50% { box-shadow: 0 8px 22px rgba(0, 0, 0, 0.16); }
        100% { box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12); }
      }
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    \`;
    document.head.appendChild(style);

    document.body.appendChild(bookmark);
  })();`;

  return new NextResponse(bookmarkletCode, {
    headers: securityHeaders,
  });
}
