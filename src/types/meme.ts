// Types matching the Rust backend data structures

export interface Meme {
  id: string;
  image_url: string;
  tags: string[];
  created_at: string;
}

export interface SearchQuery {
  q?: string; // Combined search query for tags
  tag?: string; // Keep for backward compatibility
  limit?: number;
  category?: string; // New: filter by tag category (templates, emotions, topics, relatable)
  template?: string; // New: filter by specific meme template
  emotion?: string; // New: filter by emotion
  topic?: string; // New: filter by topic
  sort?: string; // New: sort by relevance, date, date_asc, popularity
}

export interface UploadMemeFormData {
  tags: string;
  image: File;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
}
