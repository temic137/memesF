import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Base URL for API (backend server) - use environment variable with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3001";

/**
 * Constructs a full URL for an image path returned by the backend.
 * Handles both absolute URLs (like Cloudinary) and relative paths.
 * Since the backend uses Cloudinary for image storage, most URLs will be absolute.
 */
export function getImageUrl(imagePath: string): string {
  if (!imagePath) {
    return '/placeholder-meme.svg'; // Return a placeholder if path is empty
  }

  // If it's already a full URL (Cloudinary, etc.), return as-is
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // For relative paths (fallback), construct local URL
  let sanitizedPath = imagePath;
  
  // Remove any leading /uploads/ to prevent duplication
  if (sanitizedPath.startsWith("/uploads/")) {
    sanitizedPath = sanitizedPath.substring(9);
  }
  
  // Ensure the path starts with /
  if (!sanitizedPath.startsWith('/')) {
    sanitizedPath = `/${sanitizedPath}`;
  }
  
  return `${API_BASE_URL}/uploads${sanitizedPath}`;
}

/**
 * Formats an ISO date string into a human-readable form.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
