import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env';

export function createWebSocketServer(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.CORS_ORIGIN },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}
