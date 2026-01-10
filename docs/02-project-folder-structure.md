# TripMind – Project Folder Structure

## Overview

This document outlines the complete folder structure for the TripMind application, which follows a **monorepo architecture** with separate frontend (React.js + TypeScript) and backend (Node.js + TypeScript) applications.

---

## Project Root Structure

```
tripmind/
├── frontend/                 # React.js application
├── backend/                  # Node.js API server
├── docs/                     # Project documentation
├── .gitignore               # Git ignore rules
├── README.md                # Project overview
└── package.json             # Root package.json for monorepo scripts
```

---

## Frontend Structure (React.js + TypeScript)

```
frontend/
├── public/
│   ├── index.html           # Main HTML file
│   ├── favicon.ico          # App icon
│   ├── manifest.json        # PWA manifest
│   └── robots.txt           # SEO robots file
│
├── src/
│   ├── assets/              # Static assets
│   │   ├── images/          # Image files
│   │   ├── icons/           # Icon files
│   │   └── styles/          # Global styles
│   │       ├── variables.css    # CSS variables
│   │       ├── global.css       # Global CSS
│   │       └── themes.css       # Theme configurations
│   │
│   ├── types/               # TypeScript type definitions
│   │   ├── api.types.ts     # API response types
│   │   ├── user.types.ts    # User-related types
│   │   ├── travel.types.ts  # Travel-related types
│   │   ├── timeline.types.ts # Timeline-related types
│   │   ├── chat.types.ts    # Chat-related types
│   │   ├── notification.types.ts
│   │   └── index.ts         # Export all types
│   │
│   ├── interfaces/          # TypeScript interfaces
│   │   ├── IUser.ts
│   │   ├── ITravel.ts
│   │   ├── ITimeline.ts
│   │   ├── IMessage.ts
│   │   └── index.ts
│   │
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Common components
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.types.ts
│   │   │   │   ├── Button.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Loader/
│   │   │   └── Card/
│   │   │
│   │   ├── layout/          # Layout components
│   │   │   ├── Header/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Header.types.ts
│   │   │   │   ├── Header.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Sidebar/
│   │   │   ├── Footer/
│   │   │   └── MainLayout/
│   │   │
│   │   ├── timeline/        # Timeline-specific components
│   │   │   ├── TimelineView/
│   │   │   ├── TimelineItem/
│   │   │   ├── TimelineDetails/
│   │   │   └── TimelineEditor/
│   │   │
│   │   ├── chat/            # Chat interface components
│   │   │   ├── ChatWindow/
│   │   │   ├── ChatMessage/
│   │   │   ├── ChatInput/
│   │   │   └── QuestionCard/
│   │   │
│   │   └── travel/          # Travel-related components
│   │       ├── HotelCard/
│   │       ├── FlightCard/
│   │       ├── ActivityCard/
│   │       └── CostBreakdown/
│   │
│   ├── pages/               # Page-level components
│   │   ├── Home/
│   │   │   ├── Home.tsx
│   │   │   ├── Home.types.ts
│   │   │   ├── Home.module.css
│   │   │   └── index.ts
│   │   ├── Chat/
│   │   ├── Timeline/
│   │   ├── MyTravels/
│   │   ├── Notifications/
│   │   ├── TravelDetails/
│   │   ├── Auth/
│   │   │   ├── Login.tsx
│   │   │   └── Callback.tsx
│   │   └── NotFound/
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useChat.ts
│   │   ├── useTimeline.ts
│   │   ├── useNotifications.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── context/             # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── TravelContext.tsx
│   │   ├── NotificationContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── services/            # API service layer
│   │   ├── api.ts           # Axios instance configuration
│   │   ├── authService.ts
│   │   ├── travelService.ts
│   │   ├── chatService.ts
│   │   ├── timelineService.ts
│   │   └── notificationService.ts
│   │
│   ├── utils/               # Utility functions
│   │   ├── formatters.ts    # Date, currency formatters
│   │   ├── validators.ts    # Form validators
│   │   ├── constants.ts     # App constants
│   │   └── helpers.ts       # Helper functions
│   │
│   ├── routes/              # Routing configuration
│   │   ├── AppRoutes.tsx    # Main routes
│   │   ├── PrivateRoute.tsx # Protected route wrapper
│   │   └── PublicRoute.tsx  # Public route wrapper
│   │
│   ├── store/               # State management (if using Redux/Zustand)
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── travelSlice.ts
│   │   │   └── notificationSlice.ts
│   │   ├── store.ts
│   │   └── index.ts
│   │
│   ├── config/              # Frontend configuration
│   │   ├── app.config.ts    # App configuration
│   │   └── env.ts           # Environment variables
│   │
│   ├── App.tsx              # Main App component
│   ├── index.tsx            # Entry point
│   ├── react-app-env.d.ts   # React TypeScript declarations
│   ├── setupTests.ts        # Test configuration
│   └── vite-env.d.ts        # Vite environment declarations (if using Vite)
│
├── .env.development         # Development environment variables
├── .env.production          # Production environment variables
├── .eslintrc.json           # ESLint configuration
├── .prettierrc              # Prettier configuration
├── tsconfig.json            # TypeScript configuration
├── tsconfig.node.json       # TypeScript config for Node (Vite)
├── package.json             # Frontend dependencies
└── README.md                # Frontend documentation
```

---

## Backend Structure (Node.js + TypeScript)

```
backend/
├── src/
│   ├── types/               # TypeScript type definitions
│   │   ├── express.d.ts     # Express type extensions
│   │   ├── api.types.ts     # API-related types
│   │   ├── user.types.ts    # User-related types
│   │   ├── travel.types.ts  # Travel-related types
│   │   ├── timeline.types.ts
│   │   ├── chat.types.ts
│   │   ├── notification.types.ts
│   │   └── index.ts         # Export all types
│   │
│   ├── interfaces/          # TypeScript interfaces
│   │   ├── IUser.ts
│   │   ├── ITravel.ts
│   │   ├── ITimeline.ts
│   │   ├── ITimelineItem.ts
│   │   ├── IMessage.ts
│   │   ├── INotification.ts
│   │   └── index.ts
│   │
│   ├── config/              # Configuration files
│   │   ├── database.ts      # Database configuration
│   │   ├── auth.ts          # Auth configuration (OAuth, JWT)
│   │   ├── app.ts           # App-level configuration
│   │   └── env.ts           # Environment variables handler
│   │
│   ├── models/              # Database models (Mongoose/Sequelize)
│   │   ├── User.model.ts
│   │   ├── Travel.model.ts
│   │   ├── Timeline.model.ts
│   │   ├── TimelineItem.model.ts
│   │   ├── Notification.model.ts
│   │   ├── Chat.model.ts
│   │   └── Message.model.ts
│   │
│   ├── controllers/         # Request handlers
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── travelController.ts
│   │   ├── timelineController.ts
│   │   ├── chatController.ts
│   │   └── notificationController.ts
│   │
│   ├── routes/              # API route definitions
│   │   ├── index.ts         # Main router
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── travelRoutes.ts
│   │   ├── timelineRoutes.ts
│   │   ├── chatRoutes.ts
│   │   └── notificationRoutes.ts
│   │
│   ├── middleware/          # Custom middleware
│   │   ├── authMiddleware.ts      # JWT verification
│   │   ├── errorHandler.ts        # Error handling
│   │   ├── validation.ts          # Request validation
│   │   ├── rateLimiter.ts         # Rate limiting
│   │   └── logger.ts              # Request logging
│   │
│   ├── services/            # Business logic layer
│   │   ├── authService.ts
│   │   ├── travelService.ts
│   │   ├── aiService.ts           # AI/ML integration for recommendations
│   │   ├── timelineService.ts
│   │   ├── bookingService.ts      # External booking APIs
│   │   ├── weatherService.ts      # Weather API integration
│   │   ├── flightService.ts       # Flight tracking API
│   │   ├── notificationService.ts
│   │   └── emailService.ts        # Email notifications
│   │
│   ├── utils/               # Utility functions
│   │   ├── apiResponse.ts   # Standardized API responses
│   │   ├── validators.ts    # Data validators
│   │   ├── helpers.ts       # Helper functions
│   │   ├── constants.ts     # App constants
│   │   └── logger.ts        # Winston logger setup
│   │
│   ├── jobs/                # Background jobs (cron jobs)
│   │   ├── flightMonitor.ts       # Monitor flight status
│   │   ├── weatherMonitor.ts      # Monitor weather updates
│   │   ├── notificationSender.ts  # Send scheduled notifications
│   │   └── index.ts               # Job scheduler
│   │
│   ├── sockets/             # WebSocket handlers (for real-time updates)
│   │   ├── socketHandler.ts
│   │   ├── chatSocket.ts
│   │   └── notificationSocket.ts
│   │
│   ├── validators/          # Input validation schemas
│   │   ├── authValidators.ts
│   │   ├── travelValidators.ts
│   │   ├── timelineValidators.ts
│   │   └── chatValidators.ts
│   │
│   ├── database/            # Database-related files
│   │   ├── migrations/      # Database migrations
│   │   ├── seeders/         # Seed data
│   │   └── connection.ts    # Database connection
│   │
│   ├── tests/               # Test files
│   │   ├── unit/            # Unit tests
│   │   ├── integration/     # Integration tests
│   │   └── helpers/         # Test helpers
│   │
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
│
├── dist/                    # Compiled JavaScript output
├── .env.development         # Development environment variables
├── .env.production          # Production environment variables
├── .eslintrc.json           # ESLint configuration
├── .prettierrc              # Prettier configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Backend dependencies
├── nodemon.json             # Nodemon configuration for development
└── README.md                # Backend documentation
```

---

## Key Technology Stack

### Frontend
- **Language**: TypeScript
- **Framework**: React.js 18+
- **State Management**: Context API / Redux Toolkit
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: CSS Modules / Styled Components / Tailwind CSS
- **Build Tool**: Vite (recommended) / Create React App
- **Form Handling**: React Hook Form + Zod (for validation)
- **Testing**: Jest + React Testing Library

### Backend
- **Language**: TypeScript
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose) / PostgreSQL (with Sequelize/TypeORM)
- **Authentication**: Passport.js (OAuth) + JWT
- **Validation**: Zod / Joi / Express Validator
- **Real-time**: Socket.IO
- **Background Jobs**: node-cron / Bull
- **API Documentation**: Swagger / TypeDoc
- **Testing**: Jest + Supertest

---

## Environment Variables

### Frontend (.env)
```
# If using Vite (recommended)
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_FACEBOOK_APP_ID=your_facebook_app_id

# If using Create React App
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id
```

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb://localhost:27017/tripmind
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# External APIs
FLIGHT_API_KEY=your_flight_api_key
WEATHER_API_KEY=your_weather_api_key
BOOKING_API_KEY=your_booking_api_key
AI_SERVICE_API_KEY=your_ai_service_api_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

---

## API Structure

### RESTful API Endpoints

```
/api/v1/
├── /auth
│   ├── POST   /register
│   ├── POST   /login
│   ├── POST   /logout
│   ├── GET    /google
│   ├── GET    /google/callback
│   ├── GET    /facebook
│   └── GET    /facebook/callback
│
├── /users
│   ├── GET    /profile
│   ├── PUT    /profile
│   └── DELETE /account
│
├── /travels
│   ├── GET    /              # Get all user travels
│   ├── GET    /:id           # Get specific travel
│   ├── POST   /              # Create new travel plan
│   ├── PUT    /:id           # Update travel plan
│   ├── DELETE /:id           # Delete travel plan
│   └── POST   /:id/confirm   # Confirm travel plan
│
├── /timelines
│   ├── GET    /:travelId     # Get timeline for a travel
│   ├── POST   /:travelId     # Generate timeline
│   ├── PUT    /:id           # Update timeline item
│   └── DELETE /:id           # Delete timeline item
│
├── /chat
│   ├── POST   /              # Create new chat session
│   ├── GET    /:sessionId    # Get chat history
│   ├── POST   /:sessionId/messages  # Send message
│   └── POST   /:sessionId/complete  # Complete chat and generate timeline
│
└── /notifications
    ├── GET    /              # Get all notifications
    ├── PUT    /:id/read      # Mark as read
    └── DELETE /:id           # Delete notification
```

---

## Database Schema Overview

### Users
- id, email, name, avatar, authProvider, authProviderId, createdAt, updatedAt

### Travels
- id, userId, title, status, budget, travelers, startDate, endDate, isConfirmed, createdAt, updatedAt

### Timelines
- id, travelId, generatedAt, lastModified

### TimelineItems
- id, timelineId, type (visa, flight, hotel, activity, etc.), title, description, date, time, cost, status, details (JSON), order

### Messages
- id, chatSessionId, userId, content, sender (user/bot), timestamp

### Notifications
- id, userId, travelId, type, title, message, isRead, createdAt

---

## Development Workflow

### Initial Setup
1. Clone repository
2. Install dependencies: `npm install` (in root, frontend, and backend)
3. Set up environment variables (.env files)
4. Build TypeScript (if needed): `npm run build`
5. Start development servers:
   - Frontend: `cd frontend && npm run dev` (Vite) or `npm start` (CRA)
   - Backend: `cd backend && npm run dev` (with ts-node-dev or nodemon)

### Running the Application
- Frontend runs on: `http://localhost:5173` (Vite) or `http://localhost:3000` (CRA)
- Backend API runs on: `http://localhost:5000`

### TypeScript Compilation
- **Frontend**: Vite handles TypeScript compilation automatically during development
- **Backend**:
  - Development: Uses `ts-node-dev` or `nodemon` with `ts-node` for hot reload
  - Production: Run `npm run build` to compile TypeScript to JavaScript in `dist/` folder

### Scripts (Package.json)

**Frontend Scripts:**
```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "lint": "eslint src --ext ts,tsx",
  "test": "jest"
}
```

**Backend Scripts:**
```json
{
  "dev": "nodemon --exec ts-node src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "lint": "eslint src --ext ts",
  "test": "jest"
}
```

---

## TypeScript Configuration

### Frontend tsconfig.json (Vite)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@pages/*": ["src/pages/*"],
      "@services/*": ["src/services/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Backend tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@config/*": ["src/config/*"],
      "@models/*": ["src/models/*"],
      "@controllers/*": ["src/controllers/*"],
      "@services/*": ["src/services/*"],
      "@middleware/*": ["src/middleware/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    },
    "types": ["node", "jest"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

---

## Notes

1. **TypeScript Benefits**:
   - Type safety reduces runtime errors
   - Better IDE autocomplete and IntelliSense
   - Easier refactoring and maintenance
   - Self-documenting code with interfaces

2. **Scalability**: Structure supports microservices migration if needed

3. **Testing**: Each module should have corresponding test files (.test.ts or .spec.ts)

4. **Documentation**:
   - API documentation via Swagger at `/api/docs`
   - TypeScript interfaces serve as inline documentation

5. **Security**: Implement CORS, rate limiting, input validation, and SQL injection prevention

6. **Monitoring**: Consider adding logging and monitoring tools (Winston, Morgan)

7. **Deployment**:
   - Frontend: Vercel, Netlify, AWS Amplify
   - Backend: Heroku, AWS EC2/ECS, DigitalOcean, Railway
   - Ensure TypeScript is compiled before deployment

8. **Path Aliases**: Use TypeScript path aliases (@/) for cleaner imports:
   ```typescript
   // Instead of: import { User } from '../../../models/User'
   // Use: import { User } from '@models/User'
   ```

---

This structure provides a solid foundation for building a scalable, maintainable travel planning application with clear separation of concerns, type safety, and organized code architecture.
