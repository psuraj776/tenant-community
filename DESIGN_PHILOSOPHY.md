# Tenant Community App - Design Philosophy & Architecture

## Table of Contents
1. [Overview](#overview)
2. [Design Philosophy](#design-philosophy)
3. [Architecture](#architecture)
4. [Module Structure](#module-structure)
5. [Backend Abstraction](#backend-abstraction)
6. [State Management](#state-management)
7. [Navigation](#navigation)
8. [Security](#security)
9. [Performance](#performance)
10. [Testing Strategy](#testing-strategy)

---

## Overview

Tenant Community is a cross-platform mobile application (Android & iOS) built with React Native. It provides a map-first experience for users to discover rental properties, find flatmates, review properties, buy/sell household items, and connect with other tenants.

### Key Features
- **Map-First Interface**: Real-time geolocation with color-coded pins (VIBGYOR scheme)
- **4 Post Types**: Reviews, Flats, Flatmates, Sell
- **7 Bottom Tabs**: Profile, Chat, Saved, Posting, Contribution, Flag, Go Pro + About
- **Dual Backend Support**: Modular architecture supporting both Firebase and custom backend
- **Real-time Chat**: WebSocket-based messaging with offline support
- **Verification System**: User (phone) and Property (document) verification

---

## Design Philosophy

### 1. **Modularity First**
Every feature is encapsulated in its own module with:
- **Clear boundaries**: Each module has its own types, services, components, and state
- **Self-contained**: Modules can function independently
- **Dependency injection**: Services are injected, not imported directly
- **Easy testing**: Modules can be tested in isolation

### 2. **Backend Agnostic**
The app is designed to work with either:
- **Custom Backend**: REST APIs + WebSocket
- **Firebase**: Firestore, Auth, Storage, Realtime Database

This is achieved through:
```typescript
// Backend abstraction layer
interface IBackendService {
  auth: IAuthService;
  database: IDatabaseService;
  storage: IStorageService;
  realtime: IRealtimeService;
}

// Implementations
class CustomBackendService implements IBackendService { ... }
class FirebaseBackendService implements IBackendService { ... }

// Runtime selection
const backend = config.BACKEND_TYPE === 'firebase' 
  ? new FirebaseBackendService() 
  : new CustomBackendService();
```

### 3. **Cross-Platform Consistency**
- **Shared Codebase**: 95%+ code sharing between iOS and Android
- **Platform-Specific UI**: Native look & feel where appropriate
- **Conditional Rendering**: Platform-specific components when needed
- **Consistent UX**: Same user experience across platforms

### 4. **Offline-First**
- **Local Persistence**: AsyncStorage + Redux persist
- **Queue Management**: Offline actions queued and synced when online
- **Optimistic Updates**: Immediate UI feedback with rollback on failure
- **Draft Support**: Save incomplete posts/reviews locally

### 5. **Security by Design**
- **No Sensitive Data in Code**: All secrets in environment variables
- **Token Management**: Secure storage with refresh token rotation
- **Input Validation**: All user inputs validated before API calls
- **EXIF Stripping**: Remove metadata from images before upload
- **Rate Limiting**: Client-side throttling to prevent abuse

### 6. **Performance Optimized**
- **Lazy Loading**: Code splitting and dynamic imports
- **Memoization**: React.memo, useMemo, useCallback extensively
- **Virtualized Lists**: FlatList for large datasets
- **Image Optimization**: WebP, thumbnails, progressive loading
- **Map Clustering**: Efficient pin rendering for large datasets

### 7. **Observability**
- **Structured Logging**: JSON logs with correlation IDs
- **Error Tracking**: Sentry integration for crash reporting
- **Analytics**: User behavior tracking (privacy-compliant)
- **Performance Monitoring**: React Native Performance monitor

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Native App                      │
├─────────────────────────────────────────────────────────┤
│  Navigation Layer (React Navigation)                    │
│  ├── Bottom Tabs (7 + About)                           │
│  └── Stack Navigators (per module)                     │
├─────────────────────────────────────────────────────────┤
│  Presentation Layer                                      │
│  ├── Screens (module-specific)                         │
│  └── Components (shared + module-specific)             │
├─────────────────────────────────────────────────────────┤
│  State Management (Redux Toolkit)                       │
│  ├── Slices (per module)                               │
│  ├── RTK Query (API caching)                           │
│  └── Middleware (logging, offline queue)               │
├─────────────────────────────────────────────────────────┤
│  Business Logic Layer                                   │
│  ├── Modules (Profile, Chat, Posting, etc.)           │
│  └── Utils (helpers, validators, formatters)           │
├─────────────────────────────────────────────────────────┤
│  Service Layer (Backend Abstraction)                    │
│  ├── Backend Factory (Firebase / Custom)               │
│  ├── Auth Service                                       │
│  ├── Database Service                                   │
│  ├── Storage Service                                    │
│  └── Realtime Service (WebSocket/Firebase)             │
├─────────────────────────────────────────────────────────┤
│  Infrastructure Layer                                    │
│  ├── API Client (Axios with interceptors)              │
│  ├── WebSocket Client                                   │
│  ├── Firebase SDK                                       │
│  └── Local Storage (AsyncStorage)                      │
└─────────────────────────────────────────────────────────┘
         │                                  │
         ▼                                  ▼
   ┌──────────┐                      ┌──────────┐
   │ Firebase │                      │  Custom  │
   │ Services │                      │  Backend │
   └──────────┘                      └──────────┘
```

### Data Flow

```
User Action → Screen Component → Redux Action → 
Service Layer → Backend (Firebase/Custom) → 
Response → Redux State → Component Re-render
```

---

## Module Structure

Each module follows a consistent structure:

```
src/modules/[module-name]/
├── index.ts                 # Public API exports
├── types.ts                 # TypeScript interfaces/types
├── services/                # Business logic services
│   ├── [module].service.ts
│   └── [module].firebase.service.ts (if Firebase-specific)
├── store/                   # Redux state management
│   ├── slice.ts            # Redux Toolkit slice
│   └── api.ts              # RTK Query API (if applicable)
├── components/              # Module-specific components
│   ├── [Component].tsx
│   └── index.ts
├── screens/                 # Module screens
│   ├── [Screen].tsx
│   └── index.ts
├── hooks/                   # Module-specific hooks
│   └── use[Hook].ts
└── utils/                   # Module utilities
    └── helpers.ts
```

### Core Modules

#### 1. **Auth Module**
- Phone OTP authentication
- Token management (access + refresh)
- Session persistence
- Supports both Firebase Auth and custom backend

#### 2. **Profile Module**
- User profile management
- Verification status (phone, property)
- Document upload for property verification
- Settings & preferences

#### 3. **Map Module**
- Geolocation & permissions
- Map rendering (Mapbox/Google Maps)
- Pin clustering
- VIBGYOR color coding by age
- Filter management
- Search (text + geo)

#### 4. **Posting Module**
- Create/Edit posts (Flat, Flatmates, Sell)
- Media upload
- Amenities selection
- Post management (active/expired)
- Metrics (views, saves, chats)

#### 5. **Review Module**
- Create/Edit reviews
- Rating system (transport, electricity, locality, owner behavior)
- Property verification linking
- Review permanence

#### 6. **Chat Module**
- Conversation list
- Real-time messaging (WebSocket)
- Typing indicators
- Online/offline status
- Media attachments
- Block/Report

#### 7. **Saved Module**
- Bookmark posts/reviews
- Grouped by type
- Offline availability
- Bulk actions

#### 8. **Flag Module**
- Report content (posts, reviews, users)
- Track report status
- Reason selection

#### 9. **Payments Module**
- Go Pro subscription
- Payment gateway integration (Razorpay/Stripe)
- Purchase history
- Feature gating

#### 10. **About Module**
- App information
- Terms & Privacy
- Contact
- Version info

---

## Backend Abstraction

### Service Interfaces

```typescript
// Core service interface
interface IBackendService {
  auth: IAuthService;
  database: IDatabaseService;
  storage: IStorageService;
  realtime: IRealtimeService;
}

// Auth service
interface IAuthService {
  requestOTP(phone: string): Promise<void>;
  verifyOTP(phone: string, code: string): Promise<AuthResult>;
  refreshToken(refreshToken: string): Promise<TokenPair>;
  logout(): Promise<void>;
}

// Database service
interface IDatabaseService {
  query<T>(collection: string, filters: Filter[]): Promise<T[]>;
  getById<T>(collection: string, id: string): Promise<T>;
  create<T>(collection: string, data: T): Promise<T>;
  update<T>(collection: string, id: string, data: Partial<T>): Promise<T>;
  delete(collection: string, id: string): Promise<void>;
}

// Storage service
interface IStorageService {
  uploadFile(file: File, path: string): Promise<UploadResult>;
  getDownloadURL(path: string): Promise<string>;
  deleteFile(path: string): Promise<void>;
}

// Realtime service (Chat)
interface IRealtimeService {
  connect(token: string): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(channel: string, callback: (data: any) => void): void;
  unsubscribe(channel: string): void;
  send(channel: string, data: any): Promise<void>;
}
```

### Implementation Strategy

#### Custom Backend
```typescript
class CustomBackendService implements IBackendService {
  auth = new CustomAuthService(apiClient);
  database = new CustomDatabaseService(apiClient);
  storage = new CustomStorageService(apiClient);
  realtime = new WebSocketService(wsClient);
}
```

#### Firebase Backend
```typescript
class FirebaseBackendService implements IBackendService {
  auth = new FirebaseAuthService(firebaseApp);
  database = new FirestoreService(firestore);
  storage = new FirebaseStorageService(storage);
  realtime = new FirebaseRealtimeService(database);
}
```

### Configuration-Based Selection

```typescript
// config/backend.ts
export const getBackendService = (): IBackendService => {
  const backendType = process.env.BACKEND_TYPE;
  
  if (backendType === 'firebase') {
    return new FirebaseBackendService({
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      // ... other config
    });
  }
  
  return new CustomBackendService({
    baseURL: process.env.API_BASE_URL,
    wsURL: process.env.WS_URL,
  });
};
```

---

## State Management

### Redux Toolkit Architecture

```typescript
// Root store
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    profile: profileSlice.reducer,
    map: mapSlice.reducer,
    posting: postingSlice.reducer,
    chat: chatSlice.reducer,
    saved: savedSlice.reducer,
    flag: flagSlice.reducer,
    payments: paymentsSlice.reducer,
    // RTK Query APIs
    [mapApi.reducerPath]: mapApi.reducer,
    [postingApi.reducerPath]: postingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(mapApi.middleware)
      .concat(postingApi.middleware)
      .concat(loggingMiddleware)
      .concat(offlineQueueMiddleware),
});
```

### RTK Query for API Caching

```typescript
// Example: Map API
export const mapApi = createApi({
  reducerPath: 'mapApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Posts', 'Reviews'],
  endpoints: (builder) => ({
    searchMap: builder.query({
      query: (params) => ({
        url: '/search/map',
        params,
      }),
      providesTags: ['Posts', 'Reviews'],
    }),
    // ... other endpoints
  }),
});
```

---

## Navigation

### Structure

```typescript
// 7 Bottom Tabs + About
const BottomTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Profile" component={ProfileStack} />
    <Tab.Screen name="Chat" component={ChatStack} />
    <Tab.Screen name="Saved" component={SavedStack} />
    <Tab.Screen name="Posting" component={PostingStack} />
    <Tab.Screen name="Contribution" component={ReviewStack} />
    <Tab.Screen name="Flag" component={FlagStack} />
    <Tab.Screen name="GoPro" component={PaymentsStack} />
  </Tab.Navigator>
);

// Main Navigation
const RootNavigator = () => (
  <Stack.Navigator>
    {!isAuthenticated ? (
      <Stack.Screen name="Auth" component={AuthScreen} />
    ) : (
      <>
        <Stack.Screen name="Home" component={BottomTabs} />
        <Stack.Screen name="PostDetails" component={PostDetailsScreen} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </>
    )}
  </Stack.Navigator>
);
```

---

## Security

### 1. **Token Management**
- Access tokens stored in memory (Redux state)
- Refresh tokens in secure storage (Keychain/Keystore)
- Automatic token refresh on 401
- Token revocation on logout

### 2. **Data Privacy**
- EXIF stripping from images
- PII encryption at rest
- Secure communication (HTTPS/WSS)
- No sensitive data in logs

### 3. **Input Validation**
- Schema validation (Zod/Yup)
- Sanitization before API calls
- File type/size validation
- SQL injection prevention (parameterized queries)

### 4. **Rate Limiting**
- Client-side throttling
- Exponential backoff on retries
- OTP request limits

---

## Performance

### 1. **Code Splitting**
```typescript
// Lazy load heavy screens
const CreatePostScreen = React.lazy(() => import('./screens/CreatePostScreen'));
```

### 2. **Memoization**
```typescript
const MemoizedMapPin = React.memo(MapPin, (prev, next) => 
  prev.id === next.id && prev.position === next.position
);
```

### 3. **Virtualized Lists**
```typescript
<FlatList
  data={posts}
  renderItem={renderPost}
  getItemLayout={getItemLayout}
  removeClippedSubviews
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

### 4. **Image Optimization**
- WebP format
- Multiple sizes (thumbnail, medium, full)
- Progressive loading
- Cached with react-native-fast-image

### 5. **Map Optimization**
- Clustering for large datasets
- Viewport-based queries
- Debounced map movements
- Tile caching

---

## Testing Strategy

### 1. **Unit Tests**
- Business logic functions
- Utilities and helpers
- Redux reducers and selectors
- Service methods

### 2. **Integration Tests**
- API service integration
- Redux store with middleware
- Navigation flows

### 3. **Component Tests**
- React Testing Library
- Component rendering
- User interactions
- Accessibility

### 4. **E2E Tests**
- Detox for mobile
- Critical user flows
- Auth flow
- Post creation
- Chat functionality

---

## Development Workflow

### 1. **Branch Strategy**
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fixes

### 2. **Code Review**
- PR required for all changes
- At least one approval
- CI/CD checks must pass
- Code coverage > 80%

### 3. **CI/CD Pipeline**
- Linting (ESLint, Prettier)
- Type checking (TypeScript)
- Unit & integration tests
- Build verification
- E2E tests on staging

### 4. **Observability**
- Sentry for error tracking
- Analytics for user behavior
- Performance monitoring
- Custom logging with correlation IDs

---

## Deployment

### Android
- Google Play Console
- App bundles (AAB)
- Staged rollouts
- Beta testing track

### iOS
- App Store Connect
- TestFlight for beta
- Staged rollouts
- App Store review process

---

## Future Enhancements

1. **ML/AI Features**
   - Spam detection
   - Duplicate post detection
   - Price prediction

2. **Advanced Features**
   - Video tours
   - Virtual property visits
   - In-app payments for rent
   - Background location for alerts

3. **Scalability**
   - GraphQL for efficient queries
   - Microservices architecture
   - CDN for global reach

---

## Conclusion

This architecture provides:
- **Flexibility**: Easy to switch backends or add new features
- **Maintainability**: Clear module boundaries and responsibilities
- **Scalability**: Designed to handle growth in users and features
- **Quality**: Comprehensive testing and monitoring
- **Security**: Built-in security best practices

The modular approach ensures that teams can work independently on different modules while maintaining a cohesive application.
