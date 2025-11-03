# Code Flow Explanation - Tenant Community App

This document explains the complete code flow from start to end for each major functionality in the application.

---

## Table of Contents
1. [Application Startup Flow](#1-application-startup-flow)
2. [Authentication Flow (OTP Login)](#2-authentication-flow-otp-login)
3. [Map & Search Flow](#3-map--search-flow)
4. [Post Creation Flow](#4-post-creation-flow)
5. [Review Creation Flow](#5-review-creation-flow)
6. [Real-time Chat Flow](#6-real-time-chat-flow)
7. [Save/Bookmark Flow](#7-savebookmark-flow)
8. [Flag/Report Flow](#8-flagreport-flow)
9. [Profile & Verification Flow](#9-profile--verification-flow)
10. [Payment/Go Pro Flow](#10-paymentgo-pro-flow)

---

## 1. Application Startup Flow

### Entry Point → Initial Load → Navigation

```
index.js
  ↓
App.tsx (Root Component)
  ↓
Provider Setup (Redux, SafeArea, GestureHandler)
  ↓
AppContent Component
  ↓
useEffect Hook (on mount)
  ↓
Configuration Validation
  ↓
Load Auth from AsyncStorage
  ↓
Navigation (Auth or Home based on isAuthenticated)
```

### Detailed Flow:

**Step 1: Application Entry (`index.js`)**
```javascript
// index.js - React Native entry point
import App from './src/App';
AppRegistry.registerComponent(appName, () => App);
```

**Step 2: Root Component Setup (`src/App.tsx`)**
```typescript
function App() {
  return (
    <GestureHandlerRootView>          // Enables gesture handling
      <SafeAreaProvider>               // Handles safe areas (notch, etc.)
        <Provider store={store}>       // Redux store provider
          <AppContent />               // Main app content
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

**Step 3: Initialize App (`AppContent` component)**
```typescript
function AppContent() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Validate configuration (check env vars)
    validateConfig();
    
    // 2. Load stored authentication
    dispatch(loadAuthFromStorage())
      .finally(() => setIsReady(true));
  }, []);

  // 3. Render navigation based on auth state
  return <Navigation isAuthenticated={isAuthenticated} />;
}
```

**Step 4: Configuration Loading (`src/config/index.ts`)**
```typescript
// Load environment variables
const config = {
  backendType: 'firebase' or 'custom',  // From .env
  apiBaseUrl: 'http://api.example.com',
  wsUrl: 'ws://api.example.com/ws',
  mapAccessToken: 'token',
  firebase: {...}                        // If using Firebase
};
```

**Step 5: Auth State Restoration (`src/modules/auth/store/slice.ts`)**
```typescript
// Load stored auth data
AsyncStorage.getItem('@auth')
  ↓
Parse JSON
  ↓
Update Redux state: {
  isAuthenticated: true/false,
  user: {...},
  accessToken: 'token',
  refreshToken: 'refresh_token'
}
```

**Step 6: Navigation Decision (`src/navigation/index.tsx`)**
```typescript
if (!isAuthenticated) {
  // Show Auth Screen (OTP login)
  <Stack.Screen name="Auth" />
} else {
  // Show Main App (Bottom Tabs)
  <Stack.Screen name="Home" component={BottomTabNavigator} />
}
```

---

## 2. Authentication Flow (OTP Login)

### User Login → OTP Request → OTP Verify → Token Storage → Home Screen

```
User enters phone number
  ↓
Dispatch: requestOTP(phone)
  ↓
authService.requestOTP()
  ↓
Backend Service (Firebase or Custom)
  ↓
IAuthService.requestOTP()
  ↓
API: POST /auth/otp/request
  ↓
OTP sent to phone
  ↓
User enters OTP code
  ↓
Dispatch: verifyOTP(phone, code)
  ↓
authService.verifyOTP()
  ↓
Backend Service
  ↓
IAuthService.verifyOTP()
  ↓
API: POST /auth/otp/verify
  ↓
Response: {accessToken, refreshToken, user}
  ↓
Store tokens in AsyncStorage
  ↓
Update Redux state (authenticated)
  ↓
Navigation switches to Home
```

### Detailed Flow:

**Step 1: User Interface Action**
```typescript
// User enters phone and clicks "Request OTP"
<Button onPress={() => dispatch(requestOTP(phone))} />
```

**Step 2: Redux Async Thunk (`src/modules/auth/store/slice.ts`)**
```typescript
export const requestOTP = createAsyncThunk(
  'auth/requestOTP',
  async (phone: string) => {
    await authService.requestOTP(phone);
    return phone;
  }
);
```

**Step 3: Auth Service (`src/modules/auth/services/auth.service.ts`)**
```typescript
class AuthService {
  async requestOTP(phone: string) {
    // Log the action
    logger.info('Requesting OTP', {phone: maskPhone(phone)});
    
    // Get backend service (Firebase or Custom)
    const backend = getBackendService();
    
    // Call backend
    await backend.auth.requestOTP({phone});
  }
}
```

**Step 4: Backend Selection (`src/services/backend/index.ts`)**
```typescript
export const getBackendService = () => {
  if (config.backendType === 'firebase') {
    return new FirebaseBackendService(config.firebase);
  } else {
    return new CustomBackendService({
      baseURL: config.apiBaseUrl,
      wsURL: config.wsUrl
    });
  }
};
```

**Step 5a: Custom Backend Implementation (`src/services/backend/custom.backend.ts`)**
```typescript
class CustomAuthService implements IAuthService {
  async requestOTP(input: {phone: string}) {
    // Make HTTP request
    await this.apiClient.post('/auth/otp/request', input);
    // OTP is sent by backend via SMS
  }
}
```

**Step 5b: Firebase Backend Implementation (`src/services/backend/firebase.backend.ts`)**
```typescript
class FirebaseAuthService implements IAuthService {
  async requestOTP(input: {phone: string}) {
    // Use Firebase Phone Auth
    const verifier = new RecaptchaVerifier(...);
    const confirmation = await signInWithPhoneNumber(auth, phone, verifier);
    // Store confirmation for later verification
  }
}
```

**Step 6: OTP Verification Flow**
```typescript
// User enters OTP code
dispatch(verifyOTP({phone, code}))
  ↓
authService.verifyOTP(phone, code)
  ↓
backend.auth.verifyOTP({phone, code})
  ↓
// Custom Backend
POST /auth/otp/verify → {accessToken, refreshToken, user}
  ↓
// OR Firebase
PhoneAuthProvider.credential(verificationId, code)
signInWithCredential() → {token, user}
  ↓
// Store in AsyncStorage
AsyncStorage.setItem('@auth', JSON.stringify({
  user, accessToken, refreshToken
}))
  ↓
// Update Redux state
state.isAuthenticated = true
state.user = user
state.accessToken = accessToken
  ↓
// Navigation automatically switches to Home (auth gate)
```

**Step 7: Auto Token Refresh (`src/services/backend/custom.backend.ts`)**
```typescript
// Axios interceptor handles token refresh
client.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token expired, refresh it
      const {accessToken} = await auth.refreshToken(refreshToken);
      // Retry original request with new token
      error.config.headers.Authorization = `Bearer ${accessToken}`;
      return client(error.config);
    }
  }
);
```

---

## 3. Map & Search Flow

### App Launch → Get Location → Search Map → Display Pins → Filter → Select Pin

```
User opens Home tab (Map screen)
  ↓
Dispatch: getCurrentLocation()
  ↓
mapService.getCurrentLocation()
  ↓
Geolocation API (React Native)
  ↓
Get coordinates: {lat, lng}
  ↓
Update Redux: currentLocation
  ↓
Dispatch: searchMap({lat, lng, radiusKm: 5})
  ↓
mapService.searchMap()
  ↓
Backend: GET /search/map?lat=x&lng=y&radius=5
  ↓
Backend queries PostGIS
  ↓
Response: {clusters: [...], pins: [...]}
  ↓
Calculate age bucket for each pin (VIBGYOR)
  ↓
Update Redux: searchResults
  ↓
Map component renders pins with colors
  ↓
User applies filters
  ↓
Dispatch: setFilters({types: ['FLAT'], maxRent: 30000})
  ↓
Dispatch: searchMap with filters
  ↓
Updated results displayed
```

### Detailed Flow:

**Step 1: Location Permission & Acquisition**
```typescript
// Map screen component mounts
useEffect(() => {
  dispatch(getCurrentLocation());
}, []);

// Redux thunk
export const getCurrentLocation = createAsyncThunk(
  'map/getCurrentLocation',
  async () => {
    return await mapService.getCurrentLocation();
  }
);

// Map service uses Geolocation API
Geolocation.getCurrentPosition(
  position => {
    resolve({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });
  },
  options: {
    enableHighAccuracy: true,
    timeout: 15000
  }
);
```

**Step 2: Map Search with Location**
```typescript
// Once location is obtained
useEffect(() => {
  if (currentLocation) {
    dispatch(searchMap({
      lat: currentLocation.lat,
      lng: currentLocation.lng,
      radiusKm: 5,
      filters: currentFilters
    }));
  }
}, [currentLocation, currentFilters]);
```

**Step 3: Backend Query (`src/modules/map/services/map.service.ts`)**
```typescript
async searchMap(params: MapSearchParams) {
  const backend = getBackendService();
  
  // Query database with geo filters
  const results = await backend.database.query<MapSearchResult>(
    'search/map',
    [
      {field: 'location', operator: 'within', value: {lat, lng, radius}},
      {field: 'type', operator: 'in', value: params.filters.types}
    ]
  );
  
  return results;
}
```

**Step 4: Backend Processes Query**
```
Custom Backend:
  GET /v1/search/map?lat=12.97&lng=77.59&radius_km=5
    ↓
  Query PostgreSQL + PostGIS:
    SELECT * FROM posts 
    WHERE ST_DWithin(
      location, 
      ST_MakePoint(lng, lat)::geography,
      radius_meters
    )
    AND is_active = true
    ↓
  Calculate clusters for large result sets
    ↓
  Return: {clusters: [...], pins: [...]}
```

**Step 5: VIBGYOR Color Calculation (`src/utils/index.ts`)**
```typescript
// For each pin, calculate age bucket
export const getAgeBucket = (createdAt: string): AgeBucket => {
  const now = new Date();
  const created = new Date(createdAt);
  const ageInDays = (now - created) / (1000 * 60 * 60 * 24);

  if (ageInDays <= 1) return 'VIOLET';    // Fresh posts
  if (ageInDays <= 3) return 'INDIGO';
  if (ageInDays <= 7) return 'BLUE';
  if (ageInDays <= 14) return 'GREEN';
  if (ageInDays <= 30) return 'YELLOW';
  if (ageInDays <= 60) return 'ORANGE';
  return 'RED';                            // Old posts
};

// Get corresponding color
export const getColorByAge = (createdAt: string): string => {
  const bucket = getAgeBucket(createdAt);
  return ageBucketColors[bucket];  // '#8B00FF' for VIOLET, etc.
};
```

**Step 6: Map Rendering**
```typescript
// Map component
{searchResults.pins.map(pin => (
  <MapPinComponent 
    key={pin.id}
    pin={pin}
    color={getColorByAge(pin.createdAt)}
    onPress={() => dispatch(selectPin(pin.id))}
  />
))}
```

**Step 7: Filter Application**
```typescript
// User selects filters
<FilterModal 
  onApply={(filters) => {
    dispatch(setFilters(filters));
    // This triggers new search via useEffect
  }}
/>

// Redux state update
state.filters = {
  types: ['FLAT', 'FLATMATES'],
  minRent: 20000,
  maxRent: 35000,
  amenities: ['Parking', 'Lift']
}

// Triggers new search with filters
```

---

## 4. Post Creation Flow

### Create Button → Form Fill → Media Upload → Submit → Display on Map

```
User clicks floating "+" button
  ↓
Navigate to CreatePost screen
  ↓
Select post type (FLAT/FLATMATES/SELL)
  ↓
Fill form fields
  ↓
Select location (current or custom)
  ↓
Add photos (camera/gallery)
  ↓
Photos upload to storage
  ↓
Get presigned URLs (Custom) or direct upload (Firebase)
  ↓
Upload files to S3/Firebase Storage
  ↓
Get download URLs
  ↓
User clicks Submit
  ↓
Dispatch: createPost(postData)
  ↓
postingService.createPost()
  ↓
Backend: POST /posts
  ↓
Database: INSERT into posts table
  ↓
Update PostGIS location
  ↓
Response: created post with ID
  ↓
Update Redux: add to myPosts
  ↓
Clear draft
  ↓
Navigate back to Home
  ↓
New post appears on map
```

### Detailed Flow:

**Step 1: Draft Management**
```typescript
// User fills form
<TextInput 
  value={draft.title}
  onChangeText={(text) => {
    dispatch(saveDraft({...draft, title: text}));
  }}
/>

// Draft is saved in Redux
state.posting.currentDraft = {
  type: 'FLAT',
  title: '2BHK near MG Road',
  description: '...',
  rentNumeric: 28000,
  depositNumeric: 60000,
  amenities: ['Parking', 'Lift']
}
```

**Step 2: Media Upload (`src/services/backend/custom.backend.ts`)**
```typescript
// Step 2a: Get presigned upload URL (Custom Backend)
const presigned = await backend.storage.getPresignedUploadUrl(path);
// Response: {url: 's3.amazonaws.com/...', fields: {...}}

// Step 2b: Upload file
const formData = new FormData();
formData.append('file', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'photo.jpg'
});

await axios.post(presigned.url, formData, {
  onUploadProgress: (progress) => {
    const percent = (progress.loaded / progress.total) * 100;
    updateUploadProgress(percent);
  }
});

// Step 2c: Get download URL
const downloadUrl = await backend.storage.getDownloadURL(path);
```

**Step 3: Location Selection**
```typescript
// Use current location
const location = await mapService.getCurrentLocation();
// OR let user pick on map

draft.location = {lat: 12.973, lng: 77.610};
draft.address = "MG Road, Bengaluru";
```

**Step 4: Submit Post**
```typescript
dispatch(createPost({
  type: 'FLAT',
  title: '2BHK near MG Road',
  description: 'Bright, 5th floor...',
  rentNumeric: 28000,
  depositNumeric: 60000,
  availabilityDate: '2025-11-15',
  amenities: ['Lift', 'Parking'],
  address: 'MG Road, Bengaluru',
  location: {lat: 12.973, lng: 77.610},
  media: ['https://cdn.../img1.jpg', 'https://cdn.../img2.jpg']
}));
```

**Step 5: Backend Processing**
```
POST /v1/posts
Body: {type, title, description, ...}
  ↓
Validate input (DTO validation)
  ↓
Get user ID from JWT token
  ↓
Insert into database:
  INSERT INTO posts (
    user_id, type, title, description,
    rent_numeric, deposit_numeric,
    location, address, created_at
  ) VALUES (...)
  ↓
Insert media:
  INSERT INTO post_media (post_id, url, kind)
  VALUES (...), (...), (...)
  ↓
Index in OpenSearch (async):
  {
    id, type, title, description,
    location: {lat, lon},
    rent, amenities, created_at
  }
  ↓
Return created post with ID
```

**Step 6: State Update**
```typescript
// Redux reducer
builder.addCase(createPost.fulfilled, (state, action) => {
  state.myPosts.unshift(action.payload);  // Add to top
  state.currentDraft = null;              // Clear draft
});

// Navigation
navigation.goBack();  // Return to Home

// Map updates automatically via search
```

---

## 5. Review Creation Flow

### Similar to Post Creation, but for Property Reviews

```
User navigates to Create Review
  ↓
Enter property address
  ↓
Select location on map
  ↓
Rate 4 categories (1-5 stars):
  - Transport connectivity
  - Electricity/Water supply
  - Locality safety
  - Owner behavior
  ↓
Write summary text
  ↓
Add photos (optional)
  ↓
Upload photos (same as post creation)
  ↓
Link property verification (optional)
  ↓
Dispatch: createReview(reviewData)
  ↓
Backend: POST /reviews
  ↓
Database: INSERT into reviews
  ↓
Calculate verification badge
  ↓
Update Redux: add to myReviews
  ↓
Navigate back
  ↓
Review appears on map
```

### Verification Badge Calculation:

```typescript
// Backend calculates badge
const badge = calculateBadge(userId, propertyLocation);

function calculateBadge(userId, location) {
  // Check user phone verification
  const isUserVerified = user.is_phone_verified;
  
  // Check property verification
  const propertyVerification = await db.query(
    'SELECT * FROM user_verifications 
     WHERE user_id = $1 
     AND type = "PROPERTY_DOC" 
     AND status = "VERIFIED"
     AND ST_DWithin(property_point, $2, 100)',  // Within 100m
    [userId, location]
  );
  
  if (isUserVerified && propertyVerification) {
    return 'BOTH';
  } else if (isUserVerified) {
    return 'USER_VERIFIED';
  } else if (propertyVerification) {
    return 'PROPERTY_VERIFIED';
  } else {
    return 'NONE';
  }
}
```

---

## 6. Real-time Chat Flow

### WebSocket Connection → Send Message → Receive Message → Typing Indicators

```
User navigates to Chat tab
  ↓
Dispatch: connectChat(accessToken)
  ↓
chatService.connect(token)
  ↓
Backend: WebSocket connection
  ↓
WS: connect event with JWT
  ↓
Server validates token
  ↓
WS: auth_ok event
  ↓
Update Redux: connected = true
  ↓
Load conversations list
  ↓
User opens conversation
  ↓
Load message history
  ↓
Subscribe to conversation channel
  ↓
User types message
  ↓
Send typing indicator (debounced)
  ↓
User sends message
  ↓
Optimistic update (add to UI immediately)
  ↓
WS: emit message.send
  ↓
Server broadcasts message.new
  ↓
All clients receive message
  ↓
Update UI with server confirmation
```

### Detailed Flow:

**Step 1: WebSocket Connection (`src/modules/chat/services/chat.service.ts`)**
```typescript
async connect(token: string) {
  const backend = getBackendService();
  
  // Connect WebSocket
  await backend.realtime.connect(token);
  
  // Setup message handlers
  backend.realtime.subscribe('message.new', (message) => {
    // Dispatch to Redux
    dispatch(addMessage(message));
  });
  
  backend.realtime.subscribe('typing.start', (data) => {
    dispatch(setTyping({conversationId: data.conversationId, isTyping: true}));
  });
}
```

**Step 2: Custom Backend WebSocket (`src/services/backend/custom.backend.ts`)**
```typescript
class WebSocketService implements IRealtimeService {
  connect(token: string) {
    this.socket = io(wsURL, {
      auth: {token},
      transports: ['websocket']
    });
    
    this.socket.on('connect', () => {
      console.log('Connected to chat');
    });
    
    this.socket.on('message.new', (message) => {
      // Trigger callback
      this.callbacks.get('message.new')?.(message);
    });
  }
  
  send(event: string, data: any) {
    this.socket.emit(event, data);
  }
}
```

**Step 3: Send Message Flow**
```typescript
// User types and sends
<TextInput onChangeText={handleTyping} />
<Button onPress={() => sendMessage(text)} />

// Typing indicator (debounced)
const handleTyping = debounce((text) => {
  backend.realtime.send('typing.start', {conversationId});
}, 300);

// Send message
async function sendMessage(text: string) {
  const tempId = generateId();
  
  // Optimistic update
  dispatch(addMessage({
    id: tempId,
    conversationId,
    senderId: currentUserId,
    body: text,
    createdAt: new Date().toISOString(),
    _pending: true
  }));
  
  // Send via WebSocket
  await backend.realtime.send('message.send', {
    conversationId,
    body: text
  });
}
```

**Step 4: Receive Message**
```
Server broadcasts:
  ↓
WS event: message.new
  {
    id: '12345',
    conversationId: 'conv-1',
    senderId: 'user-2',
    body: 'Hello!',
    createdAt: '2025-10-25T10:00:00Z'
  }
  ↓
WebSocket callback triggers
  ↓
Dispatch: addMessage(message)
  ↓
Redux reducer adds to messages array
  ↓
Component re-renders with new message
  ↓
Scroll to bottom
```

**Step 5: Message Persistence**
```
Backend stores all messages:
  INSERT INTO messages (
    conversation_id, sender_id, body, created_at
  ) VALUES (...)
  ↓
Messages are also retrieved via REST:
  GET /conversations/:id/messages
  ↓
Used for loading history when opening chat
```

---

## 7. Save/Bookmark Flow

### Quick Action → Save → Update UI → Persist

```
User sees post/review on map or list
  ↓
Clicks bookmark icon
  ↓
Dispatch: saveItem({itemType: 'POST', itemId: '123'})
  ↓
savedService.saveItem()
  ↓
Backend: POST /saved
  ↓
Database: INSERT into saved_items
  ↓
Update Redux: add to items array
  ↓
UI updates (bookmark icon filled)
  ↓
User navigates to Saved tab
  ↓
Dispatch: getSavedItems()
  ↓
Backend: GET /saved
  ↓
Database: SELECT with JOIN to get item details
  ↓
Display saved items grouped by type
```

### Optimistic Updates:

```typescript
// Immediately update UI
dispatch(saveItem({itemType: 'POST', itemId: postId}));

// Redux reducer
builder.addCase(saveItem.fulfilled, (state, action) => {
  // Add immediately to list
  state.items.unshift({
    itemType: action.payload.itemType,
    itemId: action.payload.itemId,
    createdAt: new Date().toISOString()
  });
});

// If fails, rollback
builder.addCase(saveItem.rejected, (state, action) => {
  // Remove from list
  state.items = state.items.filter(item => 
    item.itemId !== action.meta.arg.itemId
  );
  state.error = action.payload;
});
```

---

## 8. Flag/Report Flow

### Report Action → Reason Selection → Submit → Track Status

```
User clicks report button on post/review/message
  ↓
Open report modal
  ↓
Select reason:
  - Spam
  - Scam
  - Offensive content
  - Incorrect information
  - Duplicate
  - Other
  ↓
Add optional description
  ↓
Dispatch: createFlag({
    targetType: 'POST',
    targetId: '123',
    reason: 'Spam - Duplicate posting'
  })
  ↓
Backend: POST /flags
  ↓
Database: INSERT into flags
  ↓
Trigger moderation queue
  ↓
Update Redux: add to myFlags
  ↓
Show confirmation
  ↓
User can track in Flag tab
  ↓
Status updates: OPEN → UNDER_REVIEW → ACTIONED/REJECTED
```

### Moderation Workflow (Backend):

```
New flag created
  ↓
Auto-check heuristics:
  - Keyword scan for banned words
  - Check user reputation
  - Count flags on same content
  ↓
If suspicious:
  - Auto-hide content (shadow ban)
  - Add to moderator queue
  ↓
Moderator reviews:
  - View content
  - View reporter history
  - View reported user history
  ↓
Decision:
  - Reject flag (content OK)
  - Action flag (remove content, warn/ban user)
  ↓
Update flag status
  ↓
Notify reporter
```

---

## 9. Profile & Verification Flow

### Profile View → Edit → Verification → Badge Update

```
User opens Profile tab
  ↓
Dispatch: getProfile()
  ↓
Backend: GET /me
  ↓
Display user info + verification status
  ↓
User clicks Edit Profile
  ↓
Update fields (name, city, avatar)
  ↓
Upload avatar (if changed)
  ↓
Dispatch: updateProfile(data)
  ↓
Backend: PATCH /me
  ↓
Update Redux state
  ↓
UI updates
```

### Property Verification Flow:

```
User clicks "Verify Property"
  ↓
Upload rent agreement (PDF/image)
  ↓
EXIF stripping (remove metadata)
  ↓
Upload to storage (presigned URL)
  ↓
Enter property address
  ↓
Select location on map
  ↓
Dispatch: submitVerification({
    type: 'PROPERTY_DOC',
    documentUrl: '...',
    address: {...},
    location: {lat, lng}
  })
  ↓
Backend: POST /me/verification/property
  ↓
Database: INSERT into user_verifications
  Status: PENDING
  ↓
Moderator reviews document
  ↓
Verify:
  - Document is rent agreement
  - Address matches property
  - User name on document
  ↓
Update status: VERIFIED or REJECTED
  ↓
User notified
  ↓
Future posts/reviews at this address get badge
```

---

## 10. Payment/Go Pro Flow

### View Features → Select Plan → Checkout → Payment → Activation

```
User clicks Go Pro tab
  ↓
Display premium features:
  - Boosted visibility
  - Unlimited chats
  - Advanced filters
  - Early alerts
  ↓
Select plan (Monthly/Yearly)
  ↓
Dispatch: createCheckout({plan: 'PRO_MONTHLY'})
  ↓
Backend: POST /payments/checkout
  ↓
Create order in payment gateway (Razorpay/Stripe)
  ↓
Response: {orderId, amount, paymentUrl}
  ↓
Open payment gateway (WebView/native)
  ↓
User completes payment
  ↓
Payment gateway webhook → Backend
  ↓
Verify payment signature
  ↓
Update subscription:
  INSERT INTO subscriptions
  Status: ACTIVE
  Start: now()
  End: now() + 30 days
  ↓
User receives confirmation
  ↓
Dispatch: getSubscription()
  ↓
Update Redux: isPro = true
  ↓
Unlock premium features
```

### Feature Gating:

```typescript
// Check if user is Pro
const isPro = useAppSelector(state => state.payments.isPro);

// Show/hide features
{isPro && <AdvancedFilters />}
{!isPro && <ProBadge text="Go Pro to unlock" />}

// Backend enforcement
if (!user.isPro && action === 'advanced_filter') {
  throw new Error('Premium feature');
}
```

---

## Cross-Cutting Concerns

### Logging Flow:

```
Every action logs:
  ↓
logger.info('Action description', {context})
  ↓
Create log entry: {
    level: 'INFO',
    message: '...',
    timestamp: '2025-10-25T10:00:00Z',
    correlationId: 'abc-123',
    userId: 'user-456',
    context: {...}
  }
  ↓
Console log (development)
  ↓
Remote logging service (production)
```

### Error Handling:

```
API call fails
  ↓
Catch error in try-catch
  ↓
logger.error('Failed to...', error, {context})
  ↓
parseErrorMessage(error)
  ↓
Display to user via ErrorMessage component
  ↓
Optional: Retry with exponential backoff
```

### Offline Queue:

```
Action dispatched while offline
  ↓
NetInfo detects no connection
  ↓
Queue action in AsyncStorage
  ↓
Show "Queued" indicator
  ↓
Connection restored
  ↓
Process queue (FIFO)
  ↓
Retry actions
  ↓
Update UI with results
```

---

## Summary

The application follows a consistent pattern across all features:

1. **User Action** → UI component event
2. **Redux Dispatch** → Async thunk
3. **Service Layer** → Business logic
4. **Backend Abstraction** → Interface call
5. **Backend Implementation** → Firebase or Custom
6. **API Call** → HTTP/WebSocket
7. **Response** → Data processing
8. **State Update** → Redux reducer
9. **UI Update** → Component re-render

This architecture ensures:
- **Modularity**: Each feature is independent
- **Testability**: Services can be mocked
- **Flexibility**: Backend can be swapped
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add new features
