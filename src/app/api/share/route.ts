import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract shared data
    const title = formData.get('title') as string || '';
    const text = formData.get('text') as string || '';
    const url = formData.get('url') as string || '';
    const image = formData.get('image') as File | null;

    // Create a response that redirects to the upload page with pre-filled data
    const uploadUrl = new URL('/upload', request.url);
    
    // If we have an image file, we need to handle it
    if (image && image.size > 0) {
      // Store the image temporarily and pass the reference
      // For now, we'll redirect with text data and handle the image on the client side
      const shareData = {
        title: title || text || 'Shared from ' + (url ? new URL(url).hostname : 'web'),
        text: text,
        url: url,
        hasImage: true
      };
      
      // Store share data in sessionStorage via URL params
      Object.entries(shareData).forEach(([key, value]) => {
        if (value) {
          uploadUrl.searchParams.set(key, value.toString());
        }
      });
    } else if (url) {
      // If no image but we have a URL, try to extract image from the URL
      uploadUrl.searchParams.set('imageUrl', url);
      uploadUrl.searchParams.set('title', title || text || 'Shared from ' + new URL(url).hostname);
    } else {
      // Just text content
      uploadUrl.searchParams.set('title', title || text);
      uploadUrl.searchParams.set('text', text);
    }

    // Redirect to upload page with share data
    return NextResponse.redirect(uploadUrl.toString());
    
  } catch (error) {
    console.error('Share target error:', error);
    
    // Fallback redirect to main page
    return NextResponse.redirect(new URL('/', request.url));
  }
}

// Also handle GET requests in case the share target falls back to GET
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const title = url.searchParams.get('title') || '';
  const text = url.searchParams.get('text') || '';
  const shareUrl = url.searchParams.get('url') || '';
  
  const uploadUrl = new URL('/upload', request.url);
  
  if (shareUrl) {
    uploadUrl.searchParams.set('imageUrl', shareUrl);
  }
  if (title) {
    uploadUrl.searchParams.set('title', title);
  }
  if (text) {
    uploadUrl.searchParams.set('text', text);
  }
  
  return NextResponse.redirect(uploadUrl.toString());
}
