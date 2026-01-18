# API Service

The main backend API service for TripMind.

## Overview

The API Service is the central orchestration layer that:
- Handles HTTP REST requests
- Manages WebSocket connections for real-time features
- Authenticates and authorizes users
- Coordinates with AI and Integration services

## Location

`services/api-service/`

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Auth**: Passport.js, JWT
- **Real-time**: Socket.IO

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/google` - Google OAuth
- `POST /auth/refresh` - Refresh token

### Users
- `GET /users/me` - Get current user
- `PUT /users/me` - Update profile

### Trips
- `GET /trips` - List user's trips
- `POST /trips` - Create trip
- `GET /trips/:id` - Get trip details
- `PUT /trips/:id` - Update trip
- `DELETE /trips/:id` - Delete trip

### Chat
- WebSocket connection for real-time messaging

## Development

```bash
cd services/api-service
npm install
npm run dev
```

## Environment Variables

See `.env.development` for required variables.
