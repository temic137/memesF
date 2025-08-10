import { NextRequest, NextResponse } from 'next/server';

// This endpoint serves as a proxy HTML page for CSP-safe communication
export async function GET(request: NextRequest) {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>MemeDB Proxy</title>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            width: 1px; 
            height: 1px; 
            overflow: hidden; 
        }
    </style>
</head>
<body>
    <script>
        (function() {
            'use strict';
            
            // Listen for requests from the parent bookmarklet
            window.addEventListener('message', async function(event) {
                // Security: Only accept messages from the same origin
                if (event.origin !== window.location.origin) {
                    return;
                }
                
                const { requestId, url, options } = event.data;
                
                if (!requestId || !url) {
                    return;
                }
                
                try {
                    // Make the API call from within our domain (no CSP issues)
                    const response = await fetch(url, {
                        ...options,
                        headers: {
                            'Content-Type': 'application/json',
                            ...options.headers
                        }
                    });
                    
                    let data;
                    const contentType = response.headers.get('content-type');
                    
                    if (contentType && contentType.includes('application/json')) {
                        data = await response.json();
                    } else {
                        data = await response.text();
                    }
                    
                    // Send success response back to parent
                    event.source.postMessage({
                        requestId,
                        success: true,
                        data: data
                    }, event.origin);
                    
                } catch (error) {
                    // Send error response back to parent
                    event.source.postMessage({
                        requestId,
                        success: false,
                        error: error.message || 'Request failed'
                    }, event.origin);
                }
            });
            
            // Signal that the proxy is ready
            if (window.parent !== window) {
                window.parent.postMessage({
                    type: 'memedb-proxy-ready'
                }, '*');
            }
        })();
    </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'X-Frame-Options': 'SAMEORIGIN', // Allow framing from same origin
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
