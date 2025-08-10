import { NextRequest, NextResponse } from 'next/server';

// Dedicated bookmarklet upload endpoint with auto-tagging
export async function POST(request: NextRequest) {
  console.log('📥 Bookmarklet upload request received');
  
  try {
    const formData = await request.formData();
    console.log('📋 FormData entries:', Array.from(formData.entries()).map(([key, value]) => [key, typeof value === 'object' ? `File(${value.constructor.name})` : value]));
    
    const image = formData.get('image') as File;
    const source = formData.get('source') as string || 'bookmarklet';
    const context = formData.get('context') as string || 'web-saved';

    console.log('📸 Image:', image ? `${image.name} (${image.type}, ${image.size} bytes)` : 'NO IMAGE');
    console.log('🏷️ Source:', source);
    console.log('📍 Context:', context);

    if (!image) {
      console.error('❌ No image provided in request');
      return NextResponse.json(
        { error: 'No image provided', success: false },
        { status: 400 }
      );
    }

    if (!image.type.startsWith('image/')) {
      console.error('❌ Invalid file type:', image.type);
      return NextResponse.json(
        { error: 'File is not an image', success: false },
        { status: 400 }
      );
    }

    // Convert image to base64 for auto-tagging analysis
    const imageBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const dataURL = `data:${image.type};base64,${base64Image}`;

    console.log('🔍 Starting auto-tagging for bookmarklet upload...');
    console.log('📊 Image details:', {
      type: image.type,
      size: image.size,
      dataURLLength: dataURL.length
    });

    // Auto-tag the image using our improved system
    let autoTags: string[] = [];
    let description = '';
    let analysisDetails = '';
    
    try {
      console.log('🤖 Calling AI analysis endpoint...');
      console.log('🔧 Debug - Image details:', {
        dataURLLength: dataURL.length,
        mimeType: image.type,
        origin: request.nextUrl.origin
      });
      
      const analyzeResponse = await fetch(`${request.nextUrl.origin}/api/analyze-meme`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: dataURL,
          mimeType: image.type
        }),
      });

      console.log('📡 AI analysis response status:', analyzeResponse.status, analyzeResponse.statusText);

      if (analyzeResponse.ok) {
        const analysis = await analyzeResponse.json();
        autoTags = analysis.tags || [];
        description = analysis.description || '';
        analysisDetails = `AI analysis successful (confidence: ${analysis.confidence})`;
        console.log('✅ Auto-tagging successful:', {
          tags: autoTags,
          confidence: analysis.confidence,
          category: analysis.category,
          description: description
        });
      } else {
        const errorText = await analyzeResponse.text();
        console.error('❌ AI analysis failed with status:', analyzeResponse.status, errorText);
        console.error('❌ Full error response:', errorText);
        throw new Error(`Auto-tagging failed: ${analyzeResponse.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('⚠️ Auto-tagging failed, using fallback tags:', error);
      console.error('⚠️ Full error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      analysisDetails = `Fallback used: ${error instanceof Error ? error.message : String(error)}`;
      
      // Provide meaningful fallback tags when AI analysis fails
      const meaningfulFallbacks = ['meme', 'funny', 'image'];
      
      // Add time-based context only if relevant
      const now = new Date();
      const dayOfWeek = now.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        meaningfulFallbacks.push('weekend');
      } else if (dayOfWeek === 1) {
        meaningfulFallbacks.push('monday');
      }
      
      autoTags = meaningfulFallbacks.slice(0, 3); // Limit to 3 meaningful tags
    }

    // Only use meaningful tags - skip generic metadata when AI analysis succeeded
    let allTags: string[];
    if (autoTags.length > 0 && !analysisDetails.includes('Fallback used')) {
      // AI analysis was successful - use only the meaningful content tags
      allTags = [...new Set(autoTags)]; // Remove duplicates
      console.log('🎯 Using AI-generated tags only (no generic metadata)');
    } else {
      // AI analysis failed - add minimal context for fallback
      const contextTags = ['bookmarklet'];
      allTags = [...new Set([...autoTags, ...contextTags])]; // Remove duplicates
      console.log('🔄 Using fallback tags with minimal context');
    }
    
    console.log('🏷️ Final tags for bookmarklet upload:', allTags);

    // Upload to backend with the auto-generated tags
    const backendFormData = new FormData();
    backendFormData.append('image', image);
    backendFormData.append('tags', allTags.join(','));
    backendFormData.append('source', source);
    backendFormData.append('context', context);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3001';
    const uploadResponse = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: backendFormData,
    });

    const uploadResult = await uploadResponse.json();

    if (uploadResult.success) {
      console.log('✅ Bookmarklet upload successful with auto-tags');
      return NextResponse.json({
        success: true,
        data: uploadResult.data,
        message: 'Meme saved successfully with auto-generated tags!',
        autoTags: autoTags,
        description: description,
        analysisDetails: analysisDetails,
        allTags: allTags
      });
    } else {
      throw new Error(uploadResult.message || 'Upload failed');
    }

  } catch (error) {
    console.error('❌ Bookmarklet upload error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to upload meme',
        success: false 
      },
      { status: 500 }
    );
  }
}