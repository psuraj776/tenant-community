/**
 * Utility functions for the application
 */

import {AgeBucket, GeoPoint} from '@types';
import {ageBucketColors} from '@theme';

/**
 * Calculate age bucket based on post/review creation date
 * VIBGYOR scheme:
 * ≤ 1 day: Violet
 * ≤ 3 days: Indigo
 * ≤ 7 days: Blue
 * ≤ 14 days: Green
 * ≤ 30 days: Yellow
 * ≤ 60 days: Orange
 * > 60 days: Red
 */
export const getAgeBucket = (createdAt: string): AgeBucket => {
  const now = new Date();
  const created = new Date(createdAt);
  const ageInDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

  if (ageInDays <= 1) return 'VIOLET';
  if (ageInDays <= 3) return 'INDIGO';
  if (ageInDays <= 7) return 'BLUE';
  if (ageInDays <= 14) return 'GREEN';
  if (ageInDays <= 30) return 'YELLOW';
  if (ageInDays <= 60) return 'ORANGE';
  return 'RED';
};

/**
 * Get color for age bucket
 */
export const getColorForAgeBucket = (bucket: AgeBucket): string => {
  return ageBucketColors[bucket];
};

/**
 * Get color for post/review based on creation date
 */
export const getColorByAge = (createdAt: string): string => {
  const bucket = getAgeBucket(createdAt);
  return getColorForAgeBucket(bucket);
};

/**
 * Calculate distance between two geo points (Haversine formula)
 * Returns distance in kilometers
 */
export const calculateDistance = (point1: GeoPoint, point2: GeoPoint): number => {
  const R = 6371; // Radius of Earth in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
};

/**
 * Format time ago (e.g., "2 hours ago", "3 days ago")
 */
export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
};

/**
 * Format currency (Indian Rupees)
 */
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Format phone number (E.164 to readable format)
 */
export const formatPhoneNumber = (phone: string): string => {
  // Assuming Indian phone numbers
  if (phone.startsWith('+91')) {
    const digits = phone.slice(3);
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
};

/**
 * Validate phone number (basic validation)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Indian phone number validation
  const pattern = /^(\+91)?[6-9]\d{9}$/;
  return pattern.test(phone.replace(/\s/g, ''));
};

/**
 * Validate email
 */
export const isValidEmail = (email: string): boolean => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Sleep function for delays
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> => {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await sleep(delay);
      }
    }
  }

  throw lastError;
};

/**
 * Get file extension from URL or filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

/**
 * Check if file is image
 */
export const isImageFile = (filename: string): boolean => {
  const ext = getFileExtension(filename).toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'].includes(ext);
};

/**
 * Check if file is video
 */
export const isVideoFile = (filename: string): boolean => {
  const ext = getFileExtension(filename).toLowerCase();
  return ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext);
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Capitalize first letter
 */
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Parse error message from various error types
 */
export const parseErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error?.message) return error.error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  return 'An unexpected error occurred';
};
