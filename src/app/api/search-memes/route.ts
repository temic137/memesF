import { NextRequest, NextResponse } from 'next/server';

// Proxy search endpoint for bookmarklet
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = searchParams.get('limit') || '20';
    const callback = searchParams.get('callback'); // JSONP callback

    if (!query.trim()) {
      const errorResponse = {
        success: false,
        error: 'Query parameter is required',
        data: []
      };
      
      if (callback) {
        return new NextResponse(`${callback}(${JSON.stringify(errorResponse)});`, {
          headers: { 'Content-Type': 'application/javascript' }
        });
      }
      
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Forward the search request to the backend
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3001';
    const backendUrl = `${API_BASE_URL}/api/memes/search?q=${encodeURIComponent(query)}&limit=${encodeURIComponent(limit)}`;
    
    console.log('🔍 Proxying search request to backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend search failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // Return the result in a consistent format
    const responseData = {
      success: true,
      data: result.data || result, // Handle different response formats
      message: `Found ${(result.data || result).length} memes`
    };
    
    // Support JSONP for cross-origin requests
    if (callback) {
      return new NextResponse(`${callback}(${JSON.stringify(responseData)});`, {
        headers: { 'Content-Type': 'application/javascript' }
      });
    }
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Search proxy error:', error);
    
    const { searchParams } = new URL(request.url);
    const callback = searchParams.get('callback'); // Get callback again for error handling
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
      data: []
    };
    
    // Support JSONP for error responses too
    if (callback) {
      return new NextResponse(`${callback}(${JSON.stringify(errorResponse)});`, {
        headers: { 'Content-Type': 'application/javascript' }
      });
    }
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
