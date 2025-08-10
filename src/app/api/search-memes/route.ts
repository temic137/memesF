import { NextRequest, NextResponse } from 'next/server';

// Proxy search endpoint for bookmarklet
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = searchParams.get('limit') || '20';

    if (!query.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Query parameter is required'
      }, { status: 400 });
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
    return NextResponse.json({
      success: true,
      data: result.data || result, // Handle different response formats
      message: `Found ${(result.data || result).length} memes`
    });

  } catch (error) {
    console.error('❌ Search proxy error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
        data: []
      },
      { status: 500 }
    );
  }
}
