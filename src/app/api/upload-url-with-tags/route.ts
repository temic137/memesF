import { NextRequest, NextResponse } from 'next/server';

// URL-based upload with auto-tagging for browser extension
export async function POST(request: NextRequest) {
  try {
    const { image_url, source_url, manual_tags } = await request.json();

    if (!image_url) {
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      );
    }

    console.log('🔍 Starting auto-tagging for URL upload:', image_url);

    // Download the image to analyze it
    let imageBuffer: ArrayBuffer;
    let contentType: string;
    
    try {
      const imageResponse = await fetch(image_url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MemeDB Bot)'
        }
      });
      
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
      }
      
      contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
      imageBuffer = await imageResponse.arrayBuffer();
    } catch (error) {
      console.error('Failed to download image for analysis:', error);
      // Fall back to backend upload without auto-tagging
      return uploadToBackendWithFallback(image_url, source_url, manual_tags);
    }

    // Convert to base64 for auto-tagging analysis
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const dataURL = `data:${contentType};base64,${base64Image}`;

    // Auto-tag the image using our improved system
    let autoTags: string[] = [];
    let description = '';
    
    try {
      const analyzeResponse = await fetch(`${request.nextUrl.origin}/api/analyze-meme`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: dataURL,
          mimeType: contentType
        }),
      });

      if (analyzeResponse.ok) {
        const analysis = await analyzeResponse.json();
        autoTags = analysis.tags || [];
        description = analysis.description || '';
        console.log('✅ Auto-tagging successful:', autoTags);
      } else {
        throw new Error('Auto-tagging failed');
      }
    } catch (error) {
      console.warn('⚠️ Auto-tagging failed, using fallback tags:', error);
      autoTags = ['browser-extension', 'web-saved'];
    }

    // Only use meaningful tags - skip generic metadata when AI analysis succeeded
    let allTags: string[];
    if (autoTags.length > 0 && !autoTags.includes('browser-extension')) {
      // AI analysis was successful - use only the meaningful content tags
      allTags = [...new Set([
        ...autoTags,
        ...(manual_tags || []).filter((tag: string) => 
          tag !== 'bookmarklet' && 
          tag !== 'web-saved' && 
          tag !== 'browser-extension'
        )
      ])]; // Remove duplicates
      console.log('🎯 Using AI-generated tags only (no generic metadata)');
    } else {
      // AI analysis failed - extract domain for minimal context
      if (source_url) {
        try {
          new URL(source_url).hostname.replace('www.', '');
        } catch {
          // Invalid URL, keep default
        }
      }
      const contextTags = ['browser-extension'];
      allTags = [...new Set([
        ...autoTags,
        ...(manual_tags || []),
        ...contextTags
      ])]; // Remove duplicates
      console.log('🔄 Using fallback tags with minimal context');
    }
    
    console.log('🏷️ Final tags for URL upload:', allTags);

    // Upload to backend with the auto-generated tags
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3001';
    const uploadResponse = await fetch(`${API_BASE_URL}/api/memes/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: image_url,
        tags: allTags,
        source_url: source_url
      }),
    });

    const uploadResult = await uploadResponse.json();

    if (uploadResult.success) {
      console.log('✅ URL upload successful with auto-tags');
      return NextResponse.json({
        success: true,
        data: uploadResult.data,
        message: 'Meme saved successfully with auto-generated tags!',
        autoTags: autoTags,
        description: description
      });
    } else {
      throw new Error(uploadResult.message || 'Upload failed');
    }

  } catch (error) {
    console.error('❌ URL upload error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to upload meme',
        success: false 
      },
      { status: 500 }
    );
  }
}

// Fallback function for when auto-tagging fails
async function uploadToBackendWithFallback(image_url: string, source_url?: string, manual_tags?: string[]) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3001';
  
  let domain = 'web';
  if (source_url) {
    try {
      domain = new URL(source_url).hostname.replace('www.', '');
    } catch {
      // Invalid URL, keep default
    }
  }

  const fallbackTags = [
    ...(manual_tags || []),
    'browser-extension',
    domain,
    'auto-tag-failed'
  ];

  const uploadResponse = await fetch(`${API_BASE_URL}/api/memes/upload-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: image_url,
      tags: fallbackTags,
      source_url: source_url
    }),
  });

  const result = await uploadResponse.json();
  
  return NextResponse.json({
    success: result.success,
    data: result.data,
    message: result.success ? 'Meme saved with fallback tags' : result.message,
    autoTags: [],
    description: 'Auto-tagging unavailable, used fallback tags'
  });
}