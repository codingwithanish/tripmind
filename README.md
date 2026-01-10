# TripMind - Intelligent Travel Planning Application

TripMind is a comprehensive travel planning application that acts as your personal digital travel agent. Built with React.js (TypeScript) for the frontend and Node.js (TypeScript) with Express for the backend.

## Features

- 🤖 **AI-Powered Planning**: Interactive chat interface to plan your perfect trip
- 💰 **Budget Management**: Track costs and stay within your budget
- 📅 **Interactive Timeline**: Visualize your entire journey from start to finish
- 🔔 **Real-time Updates**: Get notified about flight changes and weather alerts
- 🔐 **Social Authentication**: Login with Google or Facebook
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

### Frontend
- **Language**: TypeScript
- **Framework**: React.js 18+
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Context API
- **HTTP Client**: Axios
- **Styling**: CSS Modules

### Backend
- **Language**: TypeScript
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Authentication**: JWT
- **Database**: MongoDB (or in-memory for demo)

## Project Structure

```
tripmind/
├── frontend/          # React TypeScript frontend
├── backend/           # Node.js TypeScript backend
├── docs/              # Project documentation
└── .vscode/           # VS Code configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tripmind
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Set up environment variables**

   **Frontend** (`frontend/.env.development`):
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   VITE_SOCKET_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_FACEBOOK_APP_ID=your_facebook_app_id
   ```

   **Backend** (`backend/.env.development`):
   ```env
   NODE_ENV=development
   PORT=5000
   JWT_SECRET=your_jwt_secret_key_change_in_production
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173
   ```

### Running the Application

#### Option 1: Run Both Frontend and Backend Together

From the root directory:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend dev server on `http://localhost:5173`

#### Option 2: Run Separately

**Backend**:
```bash
cd backend
npm run dev
```

**Frontend**:
```bash
cd frontend
npm run dev
```

### Building for Production

**Frontend**:
```bash
cd frontend
npm run build
```

**Backend**:
```bash
cd backend
npm run build
npm start
```

## API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user

### Travel Endpoints (Protected)

- `GET /api/v1/travels` - Get all travels
- `GET /api/v1/travels/:id` - Get travel by ID
- `POST /api/v1/travels` - Create new travel
- `PUT /api/v1/travels/:id` - Update travel
- `DELETE /api/v1/travels/:id` - Delete travel
- `POST /api/v1/travels/:id/confirm` - Confirm travel

### Health Check

- `GET /api/v1/health` - Check server status

## Development

### Debugging

The project includes VS Code launch configurations for debugging:

1. **Backend Debug**: Debug the backend server
2. **Frontend Chrome Debug**: Debug frontend in Chrome
3. **Full Stack Debug**: Debug both frontend and backend simultaneously

Press `F5` in VS Code and select the desired configuration.

### Code Structure

#### Frontend

```
frontend/src/
├── assets/          # Images, styles, static files
├── components/      # Reusable React components
├── context/         # React Context providers
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── routes/          # Routing configuration
├── services/        # API service layer
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── App.tsx          # Main App component
```

#### Backend

```
backend/src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic (currently with dummy data)
├── types/           # TypeScript types
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## Dummy Data

The backend currently uses in-memory dummy data for development. To test the application:

**Demo Login Credentials**:
- Email: `demo@tripmind.com`
- Password: `password123`

Or register a new account through the `/api/v1/auth/register` endpoint.

## Future Enhancements

- [ ] Connect to actual database (MongoDB/PostgreSQL)
- [ ] Implement chat functionality with AI integration
- [ ] Add timeline generation
- [ ] Integrate real travel APIs (flights, hotels, weather)
- [ ] Implement real-time notifications with Socket.IO
- [ ] Add OAuth social login (Google, Facebook)
- [ ] Implement payment processing
- [ ] Add email notifications
- [ ] Create admin dashboard

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, email support@tripmind.com or open an issue in the repository.

---

**Happy Travels! ✈️**
