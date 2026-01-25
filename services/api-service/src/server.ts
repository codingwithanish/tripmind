import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app';
import { env } from './config/env';
import { setupTimelineSocket } from './sockets/timelineSocket';
import { connectDatabase, disconnectDatabase } from './database/prismaClient';

const PORT = env.PORT;

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Setup socket handlers
setupTimelineSocket(io);

// Start server with database connection
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log(`
    ╔═══════════════════════════════════════╗
    ║   TripMind API Server                 ║
    ║   Environment: ${env.NODE_ENV.padEnd(23)} ║
    ║   Port: ${PORT.toString().padEnd(31)} ║
    ║   URL: http://localhost:${PORT.toString().padEnd(15)} ║
    ║   WebSocket: Enabled                  ║
    ║   Database: Connected                 ║
    ╚═══════════════════════════════════════╝
  `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Initialize server
startServer();

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`${signal} signal received: closing HTTP server`);

  httpServer.close(async () => {
    console.log('HTTP server closed');

    // Disconnect from database
    await disconnectDatabase();

    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', async (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);

  httpServer.close(async () => {
    await disconnectDatabase();
    process.exit(1);
  });
});

export { io };
export default httpServer;


