import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import routes from './routes';
import errorHandler from './middleware/errorHandler';
import { env } from './config/env';
import { configurePassport } from './config/passportConfig';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Initialize Passport and configure Google OAuth
app.use(passport.initialize());
configurePassport();

// API routes
app.use('/api/v1', routes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'TripMind API Server',
    version: '1.0.0',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
