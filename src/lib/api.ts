import { Meme, SearchQuery, ApiResponse, UploadMemeFormData } from '@/types/meme';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3001';

// Generic API function with error handling
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Health check
export async function healthCheck(): Promise<ApiResponse<string>> {
  return apiCall<string>('/');
}

// Get all memes
export async function getMemes(): Promise<ApiResponse<Meme[]>> {
  return apiCall<Meme[]>('/api/memes');
}

// Get meme by ID
export async function getMemeById(id: string): Promise<ApiResponse<Meme>> {
  return apiCall<Meme>(`/api/memes/${id}`);
}

// Create meme with JSON
export interface CreateMemeInput {
  image_url: string;
  tags: string[];
}

export async function createMeme(meme: CreateMemeInput): Promise<ApiResponse<Meme>> {
  return apiCall<Meme>('/api/memes', {
    method: 'POST',
    body: JSON.stringify(meme),
  });
}

// Upload meme with file
export async function uploadMeme(formData: UploadMemeFormData): Promise<ApiResponse<Meme>> {
  const form = new FormData();

  form.append('tags', formData.tags);
  form.append('image', formData.image);

  try {
    const response = await fetch(`${API_BASE_URL}/api/memes/upload`, {
      method: 'POST',
      body: form,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// Delete meme
export async function deleteMeme(id: string): Promise<ApiResponse<string>> {
  return apiCall<string>(`/api/memes/${id}`, {
    method: 'DELETE',
  });
}

// Search memes
export async function searchMemes(query: SearchQuery): Promise<ApiResponse<Meme[]>> {
  const params = new URLSearchParams();

  if (query.q) params.append('q', query.q);
  if (query.tag) params.append('tag', query.tag);
  if (query.limit) params.append('limit', query.limit.toString());
  if (query.category) params.append('category', query.category);
  if (query.template) params.append('template', query.template);
  if (query.emotion) params.append('emotion', query.emotion);
  if (query.topic) params.append('topic', query.topic);
  if (query.sort) params.append('sort', query.sort);

  return apiCall<Meme[]>(`/api/memes/search?${params.toString()}`);
}

// Get all tags
export async function getAllTags(): Promise<ApiResponse<string[]>> {
  return apiCall<string[]>('/api/tags');
}
