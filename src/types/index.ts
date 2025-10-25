/**
 * Global type definitions for the Tenant Community application
 */

// ============================================================================
// Core Entity Types
// ============================================================================

export type PostType = 'FLAT' | 'FLATMATES' | 'SELL';
export type ItemType = 'POST' | 'REVIEW';
export type VerifyBadge = 'NONE' | 'USER_VERIFIED' | 'PROPERTY_VERIFIED' | 'BOTH';
export type MediaKind = 'IMAGE' | 'DOC' | 'VIDEO';
export type VerificationType = 'PHONE' | 'PROPERTY_DOC';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type FlagStatus = 'OPEN' | 'UNDER_REVIEW' | 'ACTIONED' | 'REJECTED';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'PENDING';
export type BackendType = 'firebase' | 'custom';

// VIBGYOR color buckets for post age
export type AgeBucket = 'VIOLET' | 'INDIGO' | 'BLUE' | 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  phone: string;
  email?: string;
  name?: string;
  city?: string;
  avatarUrl?: string;
  isPhoneVerified: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserVerification {
  id: string;
  userId: string;
  type: VerificationType;
  status: VerificationStatus;
  documentUrl?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  location?: GeoPoint;
  verifiedAt?: string;
  createdAt: string;
}

// ============================================================================
// Geo Types
// ============================================================================

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeoLocation extends GeoPoint {
  accuracy?: number;
}

export interface BoundingBox {
  northEast: GeoPoint;
  southWest: GeoPoint;
}

// ============================================================================
// Post Types
// ============================================================================

export interface Post {
  id: string;
  userId: string;
  type: PostType;
  title: string;
  description?: string;
  rentNumeric?: number; // FLAT, FLATMATES
  depositNumeric?: number; // FLAT, FLATMATES
  priceNumeric?: number; // SELL
  availabilityDate?: string; // FLAT, FLATMATES
  amenities?: string[];
  address?: string;
  location: GeoPoint;
  badge: VerifyBadge;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  media?: Media[];
  // Computed fields
  ageBucket?: AgeBucket;
  distanceKm?: number;
}

export interface Media {
  id: string;
  url: string;
  kind: MediaKind;
  createdAt: string;
}

export interface CreatePostInput {
  type: PostType;
  title: string;
  description?: string;
  rentNumeric?: number;
  depositNumeric?: number;
  priceNumeric?: number;
  availabilityDate?: string;
  amenities?: string[];
  address?: string;
  location: GeoPoint;
  media?: string[]; // URLs after upload
}

// ============================================================================
// Review Types
// ============================================================================

export interface Review {
  id: string;
  userId: string;
  address: string;
  location: GeoPoint;
  transportRating?: number; // 1-5
  electricityRating?: number; // 1-5
  localityRating?: number; // 1-5
  ownerBehaviourRating?: number; // 1-5
  summary?: string;
  badge: VerifyBadge;
  createdAt: string;
  media?: Media[];
  // Computed fields
  ageBucket?: AgeBucket;
  distanceKm?: number;
}

export interface CreateReviewInput {
  address: string;
  location: GeoPoint;
  transportRating?: number;
  electricityRating?: number;
  localityRating?: number;
  ownerBehaviourRating?: number;
  summary?: string;
  media?: string[]; // URLs after upload
}

// ============================================================================
// Search & Map Types
// ============================================================================

export interface SearchFilters {
  types?: PostType[];
  minRent?: number;
  maxRent?: number;
  amenities?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface MapSearchParams {
  lat: number;
  lng: number;
  radiusKm?: number;
  bbox?: BoundingBox;
  filters?: SearchFilters;
  page?: number;
  size?: number;
}

export interface MapCluster {
  id: string;
  location: GeoPoint;
  count: number;
  bounds: BoundingBox;
}

export interface MapPin {
  id: string;
  type: PostType | 'REVIEW';
  title: string;
  location: GeoPoint;
  badge: VerifyBadge;
  createdAt: string;
  ageBucket: AgeBucket;
  thumbnail?: string;
  // Type-specific fields
  rent?: number;
  price?: number;
  distanceKm?: number;
}

export interface MapSearchResult {
  clusters: MapCluster[];
  pins: MapPin[];
  nextPageToken?: string;
}

// ============================================================================
// Chat Types
// ============================================================================

export interface Conversation {
  id: string;
  postType: 'POST' | 'REVIEW';
  postOrReviewId: string;
  sellerId: string;
  buyerId: string;
  createdAt: string;
  lastMessage?: Message;
  unreadCount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body?: string;
  mediaUrl?: string;
  createdAt: string;
  readAt?: string;
}

export interface CreateConversationInput {
  postType: 'POST' | 'REVIEW';
  postOrReviewId: string;
  peerId: string;
}

export interface SendMessageInput {
  conversationId: string;
  body?: string;
  mediaUrl?: string;
}

// ============================================================================
// Saved/Bookmark Types
// ============================================================================

export interface SavedItem {
  userId: string;
  itemType: ItemType;
  itemId: string;
  createdAt: string;
  // Populated item details
  item?: Post | Review;
}

// ============================================================================
// Flag Types
// ============================================================================

export interface Flag {
  id: string;
  reporterId: string;
  targetType: 'POST' | 'REVIEW' | 'USER' | 'MESSAGE';
  targetId: string;
  reason: string;
  status: FlagStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlagInput {
  targetType: 'POST' | 'REVIEW' | 'USER' | 'MESSAGE';
  targetId: string;
  reason: string;
}

// ============================================================================
// Payment Types
// ============================================================================

export interface Subscription {
  id: string;
  userId: string;
  plan: string; // 'PRO_MONTHLY', 'PRO_YEARLY'
  provider: string; // 'RAZORPAY', 'STRIPE'
  status: SubscriptionStatus;
  startAt?: string;
  endAt?: string;
  createdAt: string;
}

export interface CheckoutInput {
  plan: string;
}

export interface PaymentResult {
  orderId: string;
  amount: number;
  currency: string;
  paymentUrl?: string;
}

// ============================================================================
// Auth Types
// ============================================================================

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface OTPRequestInput {
  phone: string;
}

export interface OTPVerifyInput {
  phone: string;
  code: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  nextPageToken?: string;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: any;
}

// ============================================================================
// WebSocket Event Types
// ============================================================================

export interface WSEvent {
  type: string;
  payload: any;
  timestamp: string;
}

export interface WSMessageEvent extends WSEvent {
  type: 'message.new' | 'message.read' | 'message.send';
  payload: Message;
}

export interface WSTypingEvent extends WSEvent {
  type: 'typing.start' | 'typing.stop';
  payload: {
    conversationId: string;
    userId: string;
  };
}

export interface WSPresenceEvent extends WSEvent {
  type: 'presence.online' | 'presence.offline';
  payload: {
    userId: string;
  };
}

// ============================================================================
// Upload Types
// ============================================================================

export interface UploadResult {
  url: string;
  path: string;
  size: number;
  contentType: string;
}

export interface PresignedUploadUrl {
  url: string;
  fields?: Record<string, string>;
  path: string;
}

// ============================================================================
// Config Types
// ============================================================================

export interface AppConfig {
  backendType: BackendType;
  apiBaseUrl: string;
  wsUrl: string;
  mapProvider: 'mapbox' | 'google';
  mapAccessToken: string;
  sentryDsn?: string;
  firebase?: FirebaseConfig;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// ============================================================================
// Navigation Types
// ============================================================================

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  PostDetails: {postId: string};
  ReviewDetails: {reviewId: string};
  CreatePost: {type?: PostType};
  CreateReview: undefined;
  ChatConversation: {conversationId: string};
  About: undefined;
};

export type BottomTabParamList = {
  Profile: undefined;
  Chat: undefined;
  Saved: undefined;
  Posting: undefined;
  Contribution: undefined;
  Flag: undefined;
  GoPro: undefined;
};
