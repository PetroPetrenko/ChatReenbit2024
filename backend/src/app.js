import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import chatRoutes from './routes/chatRoutes.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'https://chat-reenbit2024-9pdv.vercel.app',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://chat-reenbit2024-9pdv.vercel.app'
}));
app.use(express.json());

// Routes
app.use('/api', chatRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('join chat', (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  socket.on('leave chat', (chatId) => {
    socket.leave(chatId);
    console.log(`User left chat: ${chatId}`);
  });

  socket.on('new message', (message) => {
    io.to(message.chatId).emit('message received', message);
  });
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat_app';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
