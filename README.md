# Tenant Community - Cross-Platform Mobile Application

A comprehensive React Native application for tenant communities to find homes, flatmates, reviews, and more. Built with TypeScript, Redux Toolkit, and a modular architecture supporting both Firebase and custom backends.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Backend Configuration](#backend-configuration)
- [Modules](#modules)
- [Development](#development)
- [Design Philosophy](#design-philosophy)

## ✨ Features

### Core Features
- **Map-First Interface**: Real-time geolocation with VIBGYOR color-coded pins
- **4 Post Types**: Reviews, Flats, Flatmates, Household Items (Sell)
- **7 Bottom Tabs**: Profile, Chat, Saved, Posting, Contribution (Reviews), Flag, Go Pro
- **Real-time Chat**: WebSocket-based messaging with typing indicators
- **Verification System**: User (phone OTP) and Property (document-based) verification
- **Offline Support**: Queue management and local persistence
- **Search & Filters**: Location-based search with advanced filtering

### VIBGYOR Pin Colors (by Age)
- ≤ 1 day: **Violet** 🟣
- ≤ 3 days: **Indigo** 🔵
- ≤ 7 days: **Blue** 🔵
- ≤ 14 days: **Green** 🟢
- ≤ 30 days: **Yellow** 🟡
- ≤ 60 days: **Orange** 🟠
- > 60 days: **Red** 🔴

## 🏗️ Architecture

This project follows a **modular architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│              React Native Application                    │
├─────────────────────────────────────────────────────────┤
│  Navigation (React Navigation)                          │
│  ├── Bottom Tabs (7 + About)                           │
│  └── Stack Navigators                                   │
├─────────────────────────────────────────────────────────┤
│  UI Layer (Screens & Components)                       │
├─────────────────────────────────────────────────────────┤
│  State Management (Redux Toolkit)                       │
│  ├── Module Slices                                      │
│  └── RTK Query (API Caching)                           │
├─────────────────────────────────────────────────────────┤
│  Business Logic (Modules)                               │
│  ├── Auth  ├── Map      ├── Posting  ├── Review       │
│  ├── Chat  ├── Saved    ├── Flag     ├── Payments     │
│  └── Profile                                            │
├─────────────────────────────────────────────────────────┤
│  Service Layer (Backend Abstraction)                    │
│  ├── IAuthService    ├── IDatabaseService              │
│  ├── IStorageService ├── IRealtimeService              │
├─────────────────────────────────────────────────────────┤
│  Backend Implementation                                  │
│  ├── Custom Backend (REST + WebSocket)                 │
│  └── Firebase Backend (Auth, Firestore, Storage)       │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Mobile
- **React Native** 0.72.6 - Cross-platform framework
- **TypeScript** - Type safety
- **React Navigation** - Navigation library
- **Redux Toolkit** - State management
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **@rnmapbox/maps** - Map integration (or Google Maps)

### Backend Support
- **Custom Backend**: Node.js/NestJS or Go
- **Firebase**: Auth, Firestore, Storage, Realtime Database

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **TypeScript** - Static typing

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16
- npm >= 8
- React Native development environment set up
- iOS: Xcode, CocoaPods
- Android: Android Studio, Java 11

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/psuraj776/tenant-community.git
   cd tenant-community
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Install iOS pods** (iOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

5. **Run the app**
   ```bash
   # iOS
   npm run ios

   # Android
   npm run android
   ```

## 📁 Project Structure

```
tenant-community/
├── src/
│   ├── modules/              # Feature modules
│   │   ├── auth/            # Authentication
│   │   ├── profile/         # User profile
│   │   ├── map/             # Map & search
│   │   ├── posting/         # Create/manage posts
│   │   ├── review/          # Reviews
│   │   ├── chat/            # Real-time messaging
│   │   ├── saved/           # Bookmarks
│   │   ├── flag/            # Reporting
│   │   ├── payments/        # Go Pro subscriptions
│   │   └── about/           # App info
│   ├── services/            # Backend services
│   │   ├── backend/         # Backend abstraction
│   │   │   ├── interfaces.ts
│   │   │   ├── custom.backend.ts
│   │   │   ├── firebase.backend.ts
│   │   │   └── index.ts
│   │   └── logging/         # Logging service
│   ├── components/          # Shared components
│   │   ├── common/          # Common UI components
│   │   └── map/             # Map components
│   ├── navigation/          # Navigation setup
│   ├── store/               # Redux store
│   ├── theme/               # Design tokens
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration
│   └── App.tsx              # Root component
├── .env.example             # Environment template
├── DESIGN_PHILOSOPHY.md     # Detailed architecture doc
└── package.json
```

## ⚙️ Backend Configuration

The app supports **two backend types**: Custom REST API or Firebase.

### Option 1: Custom Backend

1. Set in `.env`:
   ```env
   BACKEND_TYPE=custom
   API_BASE_URL=https://your-api.com/v1
   WS_URL=wss://your-api.com/ws
   ```

2. Backend must implement:
   - REST endpoints (see DESIGN_PHILOSOPHY.md)
   - WebSocket for real-time chat
   - PostgreSQL + PostGIS
   - Object storage (S3-compatible)

### Option 2: Firebase

1. Set in `.env`:
   ```env
   BACKEND_TYPE=firebase
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=123456789
   FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

2. Firebase services used:
   - Authentication (Phone Auth)
   - Firestore (Database)
   - Storage (Files)
   - Realtime Database (Chat)

## 📦 Modules

Each module is self-contained with its own:
- **Types**: TypeScript interfaces
- **Services**: Business logic
- **Store**: Redux slice
- **Components**: UI components
- **Screens**: Full-page views

### Module List

| Module | Description | Key Features |
|--------|-------------|--------------|
| **Auth** | Authentication | OTP login, token management |
| **Profile** | User profile | Profile editing, verification |
| **Map** | Map & search | Geolocation, clustering, filters |
| **Posting** | Post management | Create/edit posts (Flat, Flatmates, Sell) |
| **Review** | Property reviews | Ratings, permanent reviews |
| **Chat** | Messaging | Real-time chat, typing indicators |
| **Saved** | Bookmarks | Save posts/reviews |
| **Flag** | Reporting | Report content, track status |
| **Payments** | Subscriptions | Go Pro, payment integration |
| **About** | App info | Mission, terms, contact |

## 🧪 Development

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

### Type Check
```bash
npm run type-check
```

### Code Format
```bash
npx prettier --write src/
```

## 📐 Design Philosophy

This project follows key design principles:

1. **Modularity First**: Each feature is self-contained
2. **Backend Agnostic**: Supports both Firebase and custom backends
3. **Cross-Platform**: 95%+ code sharing between iOS and Android
4. **Offline-First**: Queue management and local persistence
5. **Security by Design**: Token rotation, input validation, EXIF stripping
6. **Performance Optimized**: Memoization, virtualization, lazy loading
7. **Observability**: Structured logging with correlation IDs

For detailed architecture documentation, see [DESIGN_PHILOSOPHY.md](./DESIGN_PHILOSOPHY.md).

## 🔐 Security Features

- JWT-based authentication with refresh token rotation
- OTP rate limiting
- Input validation and sanitization
- Secure token storage (Keychain/Keystore)
- EXIF metadata removal from images
- HTTPS/WSS for all communications

## 🎨 UI/UX Features

- Map-first interface
- VIBGYOR color coding for post freshness
- Bottom sheet for list view
- Floating action button for quick post creation
- Badge system for verification
- Dark mode support (coming soon)

## 📱 Screens

### Main Screens
- **Home (Map)**: Map with pins, filters, search
- **Profile**: User info, verifications, settings
- **Chat**: Conversations, real-time messaging
- **Saved**: Bookmarked items
- **Posting**: Active/expired posts management
- **Reviews**: Your property reviews
- **Flag**: Report tracking
- **Go Pro**: Premium features

### Modal Screens
- **Post Details**: Full post information
- **Create Post**: Multi-step post creation
- **Create Review**: Property review form
- **Chat Conversation**: Message thread
- **About**: App information

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Built with ❤️ by a passionate team of developers.

## 📞 Contact

For support or questions:
- Email: support@tenantcommunity.com
- GitHub Issues: [Create an issue](https://github.com/psuraj776/tenant-community/issues)

---

**Version**: 1.0.0  
**Last Updated**: October 2025
