import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app';
import { env } from './config/env';
import { setupTimelineSocket } from './sockets/timelineSocket';

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

// Start server
httpServer.listen(PORT, () => {
  console.log(`
    ╔═══════════════════════════════════════╗
    ║   TripMind API Server                 ║
    ║   Environment: ${env.NODE_ENV.padEnd(23)} ║
    ║   Port: ${PORT.toString().padEnd(31)} ║
    ║   URL: http://localhost:${PORT.toString().padEnd(15)} ║
    ║   WebSocket: Enabled                  ║
    ╚═══════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  httpServer.close(() => {
    process.exit(1);
  });
});

export { io };
export default httpServer;

