# Local Development Setup

This guide walks you through setting up TripMind for local development.

## Prerequisites

- **Node.js** 18+ 
- **npm** 9+
- **Python** 3.11+ (for AI and Integration services)
- **MongoDB** (local or Atlas)
- **Git**

## Clone Repository

```bash
git clone https://github.com/your-org/tripmind.git
cd tripmind
```

## Install Dependencies

### Option 1: All at once (recommended)

```bash
npm run install:all
```

### Option 2: Individual services

```bash
# Root
npm install

# Web UI
cd apps/web-ui && npm install

# API Service
cd services/api-service && npm install
```

## Environment Setup

1. Copy environment templates:

```bash
cp .env.example .env
cp apps/web-ui/.env.development.example apps/web-ui/.env.development
cp services/api-service/.env.development.example services/api-service/.env.development
```

2. Update the `.env` files with your values:
   - MongoDB connection string
   - JWT secret
   - Google OAuth credentials (optional)

## Start Development Servers

### All services at once

```bash
npm run dev
```

This starts:
- Frontend on `http://localhost:5173`
- Backend on `http://localhost:3000`

### Individual services

```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

## Verify Setup

1. Open `http://localhost:5173` in your browser
2. You should see the TripMind landing page
3. Check the terminal for any errors

## Common Issues

### Port already in use

Kill the process using the port:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <pid> /F
```

### MongoDB connection failed

- Ensure MongoDB is running
- Check connection string in `.env`

### npm install fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
rm -rf node_modules
npm install
```
