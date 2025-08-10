// MemeDB Complete Bookmarklet System - Two Modes
// This script implements a smart toggle between Save Mode and Search Mode

(function() {
    'use strict';
    
    // Dynamic Configuration - Detect URLs at runtime
    // Smart URL detection based on current environment
    const CONFIG = (() => {
        // If we're running locally, use localhost
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return {
                apiBaseUrl: 'http://localhost:3001',
                frontendBaseUrl: 'http://localhost:3000',
                overlayId: 'memedb-overlay',
                version: '2.0'
            };
        }
        
        // For production, use the same frontend URL as API for now
        // This will need to be updated when backend is deployed separately
        const productionFrontend = 'https://memes-f.vercel.app';
        return {
            apiBaseUrl: productionFrontend, // Backend API calls will go through frontend proxy
            frontendBaseUrl: productionFrontend,
            overlayId: 'memedb-overlay',
            version: '2.0'
        };
    })();
    
    // Global variables
    let currentMemeData = null;
    let searchResults = [];
    let searchTimeout = null;
    

    
    // For search requests, use JSONP
    function safeSearch(query) {
        return new Promise((resolve, reject) => {
            const callbackName = 'memedb_search_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            window[callbackName] = function(data) {
                delete window[callbackName];
                resolve(data);
            };
            
            const script = document.createElement('script');
            script.src = `${CONFIG.frontendBaseUrl}/api/search-memes?q=${encodeURIComponent(query)}&callback=${callbackName}`;
            script.onerror = () => {
                delete window[callbackName];
                reject(new Error('Search request failed'));
            };
            
            document.head.appendChild(script);
            
            setTimeout(() => {
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
                if (window[callbackName]) {
                    delete window[callbackName];
                    reject(new Error('Search timeout'));
                }
            }, 30000);
        });
    }

    // Main entry point - Smart mode detection and toggle
    function initializeMemeDB() {
        if (document.getElementById(CONFIG.overlayId)) {
            // Overlay already open - close it
            closeMemeDB();
        } else {
            // Detect context and open appropriate mode
            const mode = detectBestMode();
            if (mode === 'save') {
                openSaveMode();
            } else {
                openSearchMode();
            }
        }
    }
    
    // Smart context detection
    function detectBestMode() {
        // Check if page has many images (likely meme source)
        const images = document.querySelectorAll('img[src*="jpg"], img[src*="png"], img[src*="gif"], img[src*="jpeg"], img[src*="webp"]');
        
        // Check if page has text inputs (likely needs memes)
        const textInputs = document.querySelectorAll('textarea, [contenteditable="true"], input[type="text"]');
        
        // Check domain patterns
        const hostname = window.location.hostname.toLowerCase();
        const memeHeavySites = ['reddit.com', 'imgur.com', 'instagram.com', 'twitter.com', 'x.com', '9gag.com', 'ifunny.co'];
        const chatSites = ['discord.com', 'slack.com', 'teams.microsoft.com', 'web.whatsapp.com', 'telegram.org'];
        
        if (memeHeavySites.some(site => hostname.includes(site)) && images.length > 5) {
            return 'save'; // Probably browsing memes
        } else if (chatSites.some(site => hostname.includes(site)) || textInputs.length > 0) {
            return 'search'; // Probably writing/chatting
        } else if (images.length > 10 && textInputs.length < 3) {
            return 'save'; // Image-heavy page
        } else {
            return 'search'; // Default to search
        }
    }
    
    // Create base overlay structure (used for modals like tagging popup)
    function createBaseOverlay() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        document.body.appendChild(overlay);
        
        // Close on background click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
        
        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        return overlay;
    }
    
    // 💾 SAVE MODE - Small floating button
    function openSaveMode() {
        // Remove any existing overlay
        const existing = document.getElementById(CONFIG.overlayId);
        if (existing) {
            existing.remove();
        }
        
        // Create floating button
        const floatingButton = document.createElement('div');
        floatingButton.id = CONFIG.overlayId;
        floatingButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'meme-save-button';
        buttonContainer.style.cssText = `
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            padding: 12px 16px;
            border-radius: 12px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            border: 2px solid rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s ease;
            position: relative;
        `;
        
        buttonContainer.innerHTML = `
            <span style="font-size: 18px;">📤</span>
            <span>Drop Memes Here</span>
            <button id="close-save-button" style="
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                margin-left: 8px;
            ">✕</button>
        `;
        
        // Add event listener for close button
        const closeButton = buttonContainer.querySelector('#close-save-button');
        if (closeButton) {
            closeButton.addEventListener('click', closeMemeDB);
        }
        
        // Search button that appears on hover
        const searchButton = document.createElement('div');
        searchButton.id = 'search-mode-button';
        searchButton.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            text-align: center;
            margin-top: 4px;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            pointer-events: none;
        `;
        searchButton.innerHTML = '🔍 Search Mode';
        searchButton.addEventListener('click', openSearchMode);
        
        buttonContainer.appendChild(searchButton);
        floatingButton.appendChild(buttonContainer);
        document.body.appendChild(floatingButton);
        
        // Setup hover effects
        buttonContainer.addEventListener('mouseenter', () => {
            searchButton.style.opacity = '1';
            searchButton.style.transform = 'translateY(0)';
            searchButton.style.pointerEvents = 'auto';
        });
        
        buttonContainer.addEventListener('mouseleave', () => {
            searchButton.style.opacity = '0';
            searchButton.style.transform = 'translateY(-10px)';
            searchButton.style.pointerEvents = 'none';
        });
        
        setupDropZone();
    }
    
    // Setup drop zone functionality
    function setupDropZone() {
        const dropButton = document.getElementById('meme-save-button');
        if (!dropButton) return;
        
        dropButton.addEventListener('dragover', handleDragOver);
        dropButton.addEventListener('dragenter', handleDragEnter);
        dropButton.addEventListener('dragleave', handleDragLeave);
        dropButton.addEventListener('drop', handleDrop);
        
        // Also handle clicks to open file picker
        dropButton.addEventListener('click', (e) => {
            // Don't trigger on close button or search button clicks
            if (e.target.tagName === 'BUTTON' || e.target.id === 'search-mode-button') return;
            
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    handleFileUpload(file);
                }
            };
            input.click();
        });
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }
    
    function handleDragEnter(e) {
        e.preventDefault();
        const dropButton = document.getElementById('meme-save-button');
        if (dropButton) {
            dropButton.style.background = 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)';
            dropButton.style.transform = 'scale(1.05)';
            dropButton.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
            const textSpan = dropButton.querySelector('span:nth-child(2)');
            if (textSpan) textSpan.textContent = 'Drop to Save!';
        }
    }
    
    function handleDragLeave(e) {
        // Only handle if leaving the button entirely
        if (!e.relatedTarget || !document.getElementById('meme-save-button').contains(e.relatedTarget)) {
            const dropButton = document.getElementById('meme-save-button');
            if (dropButton) {
                dropButton.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
                dropButton.style.transform = 'scale(1)';
                dropButton.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                const textSpan = dropButton.querySelector('span:nth-child(2)');
                if (textSpan) textSpan.textContent = 'Drop Memes Here';
            }
        }
    }
    
    function handleDrop(e) {
        e.preventDefault();
        
        const dropButton = document.getElementById('meme-save-button');
        if (dropButton) {
            dropButton.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
            dropButton.style.transform = 'scale(1)';
            dropButton.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            const textSpan = dropButton.querySelector('span:nth-child(2)');
            if (textSpan) textSpan.textContent = 'Drop Memes Here';
        }
        
        const items = e.dataTransfer.items;
        const files = e.dataTransfer.files;
        
        // Handle different drop types
        if (files.length > 0) {
            // File dropped from computer
            handleFileUpload(files[0]);
        } else if (items.length > 0) {
            // Try multiple approaches for web page drops
            let handled = false;
            
            for (let item of items) {
                if (item.type === 'text/uri-list') {
                    item.getAsString((imageUrl) => {
                        if (imageUrl && imageUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)) {
                            handleImageUrl(imageUrl);
                            handled = true;
                        }
                    });
                } else if (item.type === 'text/html') {
                    // Extract image URL from HTML
                    item.getAsString((html) => {
                        const match = html.match(/<img[^>]+src="([^"]+)"/i);
                        if (match && match[1]) {
                            handleImageUrl(match[1]);
                            handled = true;
                        }
                    });
                } else if (item.type === 'text/plain') {
                    // Check if plain text is an image URL
                    item.getAsString((text) => {
                        if (text && text.match(/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)(\?|$)/i)) {
                            handleImageUrl(text);
                            handled = true;
                        }
                    });
                }
                
                if (handled) break;
            }
            
            if (!handled) {
                showNotification('Could not extract image from drop. Try dragging the image directly.', '#EF4444');
            }
        }
    }
    
    function handleFileUpload(file) {
        if (!file.type.startsWith('image/')) {
            showNotification('Please select an image file', '#EF4444');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            showNotification('Image too large. Please use images under 10MB', '#EF4444');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            currentMemeData = {
                file: file,
                url: e.target.result,
                source: 'file'
            };
            showTaggingPopup();
        };
        reader.readAsDataURL(file);
    }
    
    function handleImageUrl(imageUrl) {
        if (!imageUrl || !imageUrl.startsWith('http')) {
            showNotification('Invalid image URL', '#EF4444');
            return;
        }
        
        currentMemeData = {
            url: imageUrl,
            source: 'url'
        };
        showTaggingPopup();
    }
    
    // Show tagging popup
    function showTaggingPopup() {
        if (!currentMemeData) return;
        
        // Create popup overlay using base overlay
        const popup = createBaseOverlay();
        popup.id = 'tagging-popup';
        popup.style.background = 'rgba(0,0,0,0.9)';
        popup.style.zIndex = '9999999';
        
        const container = document.createElement('div');
        container.style.cssText = `
            background: white;
            border-radius: 16px;
            width: 90%;
            max-width: 450px;
            padding: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        `;
        
        container.innerHTML = `
            <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1F2937;">🏷️ Tag This Meme</h3>
            
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="${currentMemeData.url}" style="width: 120px; height: 100px; object-fit: cover; border-radius: 8px; border: 2px solid #E5E7EB;">
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 6px;">Title (optional):</label>
                <input type="text" id="meme-title" placeholder="Give this meme a name..." style="
                    width: 100%;
                    padding: 10px;
                    border: 2px solid #E5E7EB;
                    border-radius: 8px;
                    font-size: 14px;
                    box-sizing: border-box;
                ">
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 12px;">Tagging method:</label>
                <label style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;">
                    <input type="radio" name="tag-method" value="auto" checked style="margin-right: 8px;">
                    <span>🤖 Auto-tag with AI (recommended)</span>
                </label>
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="radio" name="tag-method" value="manual" style="margin-right: 8px;">
                    <span>✍️ I'll add tags manually</span>
                </label>
            </div>
            
            <div id="manual-tags" style="display: none; margin-bottom: 20px;">
                <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 6px;">Tags (comma-separated):</label>
                <input type="text" id="tag-input" placeholder="funny, cat, reaction, meme" style="
                    width: 100%;
                    padding: 10px;
                    border: 2px solid #E5E7EB;
                    border-radius: 8px;
                    font-size: 14px;
                    margin-bottom: 8px;
                    box-sizing: border-box;
                ">
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <span class="tag-add-btn" data-tag="reaction" style="
                        background: #EBF8FF;
                        color: #1E40AF;
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 12px;
                        cursor: pointer;
                        border: 1px solid #3B82F6;
                    ">+reaction</span>
                    <span class="tag-add-btn" data-tag="funny" style="
                        background: #FEF3C7;
                        color: #92400E;
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 12px;
                        cursor: pointer;
                        border: 1px solid #F59E0B;
                    ">+funny</span>
                    <span class="tag-add-btn" data-tag="classic" style="
                        background: #F3E8FF;
                        color: #7C3AED;
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 12px;
                        cursor: pointer;
                        border: 1px solid #8B5CF6;
                    ">+classic</span>
                </div>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button id="cancel-save-btn" style="
                    background: #F3F4F6;
                    color: #374151;
                    border: 1px solid #D1D5DB;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                ">Cancel</button>
                <button id="save-meme-btn" style="
                    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                ">💾 Save to Database</button>
            </div>
        `;
        
        popup.appendChild(container);
        
        // Add event listeners for tag buttons
        const tagButtons = container.querySelectorAll('.tag-add-btn');
        tagButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tag = e.target.getAttribute('data-tag');
                addTag(tag);
            });
        });
        
        // Add event listeners for save/cancel buttons
        const cancelBtn = container.querySelector('#cancel-save-btn');
        const saveBtn = container.querySelector('#save-meme-btn');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', cancelSave);
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', saveMeme);
        }
        
        // Handle radio button changes
        const radios = container.querySelectorAll('input[name="tag-method"]');
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const manualSection = document.getElementById('manual-tags');
                if (e.target.value === 'manual') {
                    manualSection.style.display = 'block';
                    document.getElementById('tag-input').focus();
                } else {
                    manualSection.style.display = 'none';
                }
            });
        });
        

    }
    
    // Add tag to manual input
    window.addTag = function(tag) {
        const input = document.getElementById('tag-input');
        if (input) {
            const currentTags = input.value.trim();
            if (currentTags) {
                input.value = currentTags + ', ' + tag;
            } else {
                input.value = tag;
            }
        }
    };
    
    // Cancel save operation
    window.cancelSave = function() {
        const popup = document.getElementById('tagging-popup');
        if (popup) {
            popup.remove();
        }
        currentMemeData = null;
    };
    
    // Save meme to database
    window.saveMeme = async function() {
        const title = document.getElementById('meme-title').value.trim();
        const tagMethod = document.querySelector('input[name="tag-method"]:checked').value;
        let tags = [];
        
        // Show loading state
        const saveButton = document.querySelector('#save-meme-btn');
        const originalText = saveButton.textContent;
        saveButton.textContent = '🔄 Saving...';
        saveButton.disabled = true;
        
        try {
            if (tagMethod === 'auto') {
                // Use AI tagging
                showNotification('🤖 AI is analyzing meme...', '#3B82F6');
                
                try {
                    let imageBase64;
                    let mimeType;
                    
                    if (currentMemeData.file) {
                        // Convert file to base64
                        const reader = new FileReader();
                        imageBase64 = await new Promise((resolve, reject) => {
                            reader.onload = (e) => resolve(e.target.result);
                            reader.onerror = reject;
                            reader.readAsDataURL(currentMemeData.file);
                        });
                        mimeType = currentMemeData.file.type;
                    } else {
                        // For URL images, we need to fetch and convert
                        try {
                            const response = await fetch(currentMemeData.url);
                            const blob = await response.blob();
                            const reader = new FileReader();
                            imageBase64 = await new Promise((resolve, reject) => {
                                reader.onload = (e) => resolve(e.target.result);
                                reader.onerror = reject;
                                reader.readAsDataURL(blob);
                            });
                            mimeType = blob.type;
                        } catch (urlError) {
                            console.warn('Failed to fetch image from URL, using fallback tags');
                            throw urlError;
                        }
                    }
                    
                    // Try AI tagging, but fail gracefully if CSP blocks it
                    const response = await fetch(`${CONFIG.frontendBaseUrl}/api/analyze-meme`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            image: imageBase64,
                            mimeType: mimeType
                        })
                    });
                    
                    if (response.ok) {
                        const aiData = await response.json();
                        tags = aiData.tags || ['meme', 'bookmarklet'];
                    } else {
                        throw new Error('AI analysis failed');
                    }
                } catch (aiError) {
                    console.warn('AI tagging failed (likely due to CSP), using smart fallback tags:', aiError);
                    
                    // Generate smarter fallback tags based on context
                    const smartTags = ['meme'];
                    
                    // Add context-based tags
                    const hostname = window.location.hostname.toLowerCase();
                    if (hostname.includes('reddit')) smartTags.push('reddit');
                    else if (hostname.includes('twitter') || hostname.includes('x.com')) smartTags.push('twitter');
                    else if (hostname.includes('discord')) smartTags.push('discord');
                    else if (hostname.includes('instagram')) smartTags.push('instagram');
                    else smartTags.push('web');
                    
                    // Add time-based tags
                    const hour = new Date().getHours();
                    if (hour >= 9 && hour <= 17) smartTags.push('work-hours');
                    else if (hour >= 18 && hour <= 23) smartTags.push('evening');
                    
                    tags = smartTags;
                }
            } else {
                // Manual tags
                const tagInput = document.getElementById('tag-input').value.trim();
                tags = tagInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                if (tags.length === 0) {
                    tags = ['meme', 'bookmarklet'];
                }
            }
            
            // Try direct upload first, fall back to redirect if CSP blocks it
            try {
                if (currentMemeData.file) {
                    // Upload file
                    const formData = new FormData();
                    formData.append('image', currentMemeData.file);
                    formData.append('title', title || '');
                    formData.append('tags', tags.join(','));
                    formData.append('uploaded_by', 'Bookmarklet User');
                    formData.append('source', 'bookmarklet');
                    
                    const response = await fetch(`${CONFIG.frontendBaseUrl}/api/upload-bookmarklet`, {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Upload failed: ${response.status}`);
                    }
                } else {
                    // Save URL - use frontend API endpoint that proxies to backend
                    const response = await fetch(`${CONFIG.frontendBaseUrl}/api/upload-url-with-tags`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            image_url: currentMemeData.url,
                            manual_tags: tags,
                            source_url: window.location.href
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Save failed: ${response.status}`);
                    }
                }
            } catch (uploadError) {
                // If CSP blocks the upload, redirect to upload page
                console.warn('Direct upload blocked by CSP, redirecting to upload page:', uploadError);
                
                const uploadUrl = new URL(`${CONFIG.frontendBaseUrl}/upload`);
                
                // Add parameters for pre-filling the form
                if (currentMemeData.url) {
                    uploadUrl.searchParams.set('imageUrl', currentMemeData.url);
                }
                if (title) {
                    uploadUrl.searchParams.set('title', title);
                }
                if (tags.length > 0) {
                    uploadUrl.searchParams.set('tags', tags.join(','));
                }
                uploadUrl.searchParams.set('source', window.location.href);
                
                // Open in new tab
                window.open(uploadUrl.toString(), '_blank');
                
                // Show notification about redirect
                showNotification('🚀 Opening upload page in new tab...', '#3B82F6');
                
                // Close the popup after redirect
                const popup = document.getElementById('tagging-popup');
                if (popup) {
                    popup.remove();
                }
                currentMemeData = null;
                return; // Exit the function early
            }
            
            showNotification('✅ Meme saved to database!', '#10B981');
            
            // Close the tagging popup immediately after successful save
            console.log('Attempting to close tagging popup...');
            const popup = document.getElementById('tagging-popup');
            if (popup) {
                console.log('Popup found, removing...');
                popup.remove();
                console.log('Popup removed successfully');
            } else {
                console.log('No popup found with id "tagging-popup"');
                // Try to find any modal or overlay elements as fallback
                const overlays = document.querySelectorAll('[style*="position: fixed"][style*="z-index"]');
                console.log('Found overlays:', overlays.length);
                overlays.forEach((overlay, index) => {
                    if (overlay.textContent && overlay.textContent.includes('Tag This Meme')) {
                        console.log(`Removing tagging overlay ${index}`);
                        overlay.remove();
                    }
                });
            }
            currentMemeData = null;
            // Keep the main bookmarklet button open for more saves
            
        } catch (error) {
            console.error('Save error:', error);
            showNotification('❌ Failed to save meme. Try again.', '#EF4444');
            
            // Restore button
            saveButton.textContent = originalText;
            saveButton.disabled = false;
        }
    };
    
    // 🔍 SEARCH MODE - Find & Use Memes (Non-blocking overlay)
    function openSearchMode() {
        // Remove any existing overlay
        const existing = document.getElementById(CONFIG.overlayId);
        if (existing) {
            existing.remove();
        }
        
        // Create non-blocking overlay that allows interactions behind it
        const overlay = document.createElement('div');
        overlay.id = CONFIG.overlayId;
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 999999;
            pointer-events: none;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        const container = document.createElement('div');
        container.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 16px;
            width: 400px;
            max-height: 80vh;
            overflow: hidden;
            padding: 0;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
            pointer-events: auto;
        `;
        
        container.innerHTML = `
            <div class="search-header" style="
                background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
                color: white;
                padding: 20px;
                border-radius: 16px 16px 0 0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-shrink: 0;
            ">
                <h3 style="margin: 0; font-size: 18px; font-weight: 600;">🔍 Find Memes</h3>
                <div style="display: flex; gap: 8px;">
                    <button id="switch-save-mode-btn" style="
                        background: rgba(255,255,255,0.2);
                        border: 1px solid rgba(255,255,255,0.3);
                        color: white;
                        padding: 6px 12px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: 500;
                    ">📤 Save Mode</button>
                    <button id="close-search-btn" style="
                        background: rgba(255,255,255,0.2);
                        border: 1px solid rgba(255,255,255,0.3);
                        color: white;
                        padding: 6px 12px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: 500;
                    ">✕</button>
                </div>
            </div>
            
            <div style="padding: 20px; flex-shrink: 0;">
                <div style="position: relative;">
                    <input type="text" id="meme-search" placeholder="Search for memes... (confused, happy, reaction)" style="
                        width: 100%;
                        padding: 12px 40px 12px 16px;
                        border: 2px solid #E5E7EB;
                        border-radius: 12px;
                        font-size: 16px;
                        box-sizing: border-box;
                        outline: none;
                    ">
                    <div style="
                        position: absolute;
                        right: 12px;
                        top: 50%;
                        transform: translateY(-50%);
                        font-size: 18px;
                    ">🔍</div>
                </div>
            </div>
            
            <div id="search-results" style="
                flex: 1;
                overflow-y: auto;
                padding: 0 20px 20px 20px;
                min-height: 200px;
            ">
                <div style="
                    text-align: center;
                    color: #6B7280;
                    padding: 40px 20px;
                    font-size: 14px;
                ">
                    <div style="font-size: 48px; margin-bottom: 12px;">🎭</div>
                    <div>Type to search for memes...</div>
                    <div style="margin-top: 8px; font-size: 12px;">Try: "confused", "happy", "reaction", "work"</div>
                </div>
            </div>
            
            <div style="
                background: #EBF8FF;
                border-top: 1px solid #E5E7EB;
                padding: 12px 20px;
                border-radius: 0 0 16px 16px;
                font-size: 12px;
                color: #1E40AF;
                text-align: center;
                flex-shrink: 0;
            ">
                💡 Drag memes directly into chat windows below
            </div>
        `;
        
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        
        // Add event listeners for search mode buttons
        const switchSaveModeBtn = container.querySelector('#switch-save-mode-btn');
        const closeSearchBtn = container.querySelector('#close-search-btn');
        
        if (switchSaveModeBtn) {
            switchSaveModeBtn.addEventListener('click', switchToSaveMode);
        }
        
        if (closeSearchBtn) {
            closeSearchBtn.addEventListener('click', closeMemeDB);
        }
        
        setupSearch();
    }
    
    // Setup search functionality
    function setupSearch() {
        const searchInput = document.getElementById('meme-search');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            // Clear previous timeout
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            
            if (query.length === 0) {
                showEmptySearchState();
                return;
            }
            
            // Debounce search
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        });
        
        // Focus search input
        searchInput.focus();
    }
    
    function showEmptySearchState() {
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div style="
                    text-align: center;
                    color: #6B7280;
                    padding: 40px 20px;
                    font-size: 14px;
                ">
                    <div style="font-size: 48px; margin-bottom: 12px;">🎭</div>
                    <div>Type to search for memes...</div>
                    <div style="margin-top: 8px; font-size: 12px;">Try: "confused", "happy", "reaction", "work"</div>
                </div>
            `;
        }
    }
    
    async function performSearch(query) {
        const resultsContainer = document.getElementById('search-results');
        if (!resultsContainer) return;
        
        // Show loading state
        resultsContainer.innerHTML = `
            <div style="
                text-align: center;
                color: #6B7280;
                padding: 40px 20px;
                font-size: 14px;
            ">
                <div style="font-size: 48px; margin-bottom: 12px;">🔍</div>
                <div>Searching for "${query}"...</div>
            </div>
        `;
        
        try {
            // Try JSONP first, fall back to opening search page
            try {
                const data = await safeSearch(query);
                searchResults = data.data || []; // Frontend API returns data in consistent format
            } catch (searchError) {
                console.warn('Search blocked by CSP, opening search page:', searchError);
                
                // Open search page in new tab with the query
                const searchUrl = `${CONFIG.frontendBaseUrl}/?search=${encodeURIComponent(query)}`;
                window.open(searchUrl, '_blank');
                
                showNotification('🔍 Opening search in new tab...', '#3B82F6');
                
                // Show a helpful message in the results
                resultsContainer.innerHTML = `
                    <div style="
                        text-align: center;
                        color: #3B82F6;
                        padding: 40px 20px;
                        font-size: 14px;
                    ">
                        <div style="font-size: 48px; margin-bottom: 12px;">🔍</div>
                        <div>Search opened in new tab</div>
                        <div style="margin-top: 8px; font-size: 12px;">Due to site restrictions, search results are shown in a new tab</div>
                    </div>
                `;
                return;
            }
            
            if (searchResults.length === 0) {
                resultsContainer.innerHTML = `
                    <div style="
                        text-align: center;
                        color: #6B7280;
                        padding: 40px 20px;
                        font-size: 14px;
                    ">
                        <div style="font-size: 48px; margin-bottom: 12px;">😕</div>
                        <div>No memes found for "${query}"</div>
                        <div style="margin-top: 8px; font-size: 12px;">Try different keywords or add some memes first!</div>
                    </div>
                `;
                return;
            }
            
            displaySearchResults(searchResults);
            
        } catch (error) {
            console.error('Search error:', error);
            resultsContainer.innerHTML = `
                <div style="
                    text-align: center;
                    color: #EF4444;
                    padding: 40px 20px;
                    font-size: 14px;
                ">
                    <div style="font-size: 48px; margin-bottom: 12px;">❌</div>
                    <div>Search failed</div>
                    <div style="margin-top: 8px; font-size: 12px;">Check your connection and try again</div>
                </div>
            `;
        }
    }
    
    function displaySearchResults(memes) {
        const resultsContainer = document.getElementById('search-results');
        if (!resultsContainer) return;
        
        const grid = document.createElement('div');
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 12px;
            padding: 10px 0;
        `;
        
        memes.forEach((meme) => {
            const memeItem = document.createElement('div');
            memeItem.style.cssText = `
                background: white;
                border: 2px solid #E5E7EB;
                border-radius: 12px;
                overflow: hidden;
                cursor: grab;
                transition: all 0.2s ease;
                position: relative;
            `;
            
            memeItem.innerHTML = `
                <img src="${meme.image_url || meme.url}" style="
                    width: 100%;
                    height: 120px;
                    object-fit: cover;
                    display: block;
                " draggable="true">
                <div style="
                    padding: 8px;
                    font-size: 11px;
                    color: #6B7280;
                    background: white;
                    border-top: 1px solid #E5E7EB;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                ">
                    ${meme.tags.slice(0, 3).join(', ') || 'Meme'}
                </div>
            `;
            
            // Make draggable with enhanced data transfer
            const img = memeItem.querySelector('img');
            img.addEventListener('dragstart', (e) => {
                const imageUrl = meme.image_url || meme.url;
                
                // Set multiple data formats for maximum compatibility
                e.dataTransfer.setData('text/uri-list', imageUrl);
                e.dataTransfer.setData('text/plain', imageUrl);
                e.dataTransfer.setData('text/html', `<img src="${imageUrl}" alt="Meme">`);
                e.dataTransfer.setData('application/x-moz-file-promise-url', imageUrl);
                e.dataTransfer.effectAllowed = 'copy';
                
                // Create a drag image for better visual feedback
                const dragImage = new Image();
                dragImage.src = imageUrl;
                dragImage.style.cssText = `
                    width: 100px;
                    height: 80px;
                    object-fit: cover;
                    border-radius: 8px;
                    opacity: 0.8;
                `;
                
                // Use the drag image if supported
                try {
                    e.dataTransfer.setDragImage(dragImage, 50, 40);
                } catch {
                    // Fallback if setDragImage is not supported
                    console.log('setDragImage not supported');
                }
                
                // Visual feedback
                memeItem.style.transform = 'scale(0.95)';
                memeItem.style.opacity = '0.7';
                
                // Show helpful notification
                showNotification('🎯 Drag to any text field or chat app!', '#3B82F6');
            });
            
            img.addEventListener('dragend', () => {
                memeItem.style.transform = 'scale(1)';
                memeItem.style.opacity = '1';
            });
            
            // Hover effects
            memeItem.addEventListener('mouseenter', () => {
                memeItem.style.borderColor = '#3B82F6';
                memeItem.style.transform = 'translateY(-2px)';
                memeItem.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)';
            });
            
            memeItem.addEventListener('mouseleave', () => {
                memeItem.style.borderColor = '#E5E7EB';
                memeItem.style.transform = 'translateY(0)';
                memeItem.style.boxShadow = 'none';
            });
            
            grid.appendChild(memeItem);
        });
        
        resultsContainer.innerHTML = '';
        resultsContainer.appendChild(grid);
    }
    
    // Mode switching functions
    window.switchToSearchMode = function() {
        const existing = document.getElementById(CONFIG.overlayId);
        if (existing) {
            existing.remove();
        }
        openSearchMode();
    };
    
    window.switchToSaveMode = function() {
        const existing = document.getElementById(CONFIG.overlayId);
        if (existing) {
            existing.remove();
        }
        openSaveMode();
    };
    
    // Close overlay
    window.closeMemeDB = function() {
        const overlay = document.getElementById(CONFIG.overlayId);
        if (overlay) {
            overlay.remove();
        }
        
        const popup = document.getElementById('tagging-popup');
        if (popup) {
            popup.remove();
        }
        
        // Clean up global variables
        currentMemeData = null;
        searchResults = [];
        if (searchTimeout) {
            clearTimeout(searchTimeout);
            searchTimeout = null;
        }
    };
    
    // Notification system
    function showNotification(message, color = '#3B82F6') {
        // Remove existing notification
        const existing = document.getElementById('memedb-notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.id = 'memedb-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in forwards';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
    }
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize the bookmarklet
    initializeMemeDB();
    
})();
