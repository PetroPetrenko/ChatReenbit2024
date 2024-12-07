import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import chatRoutes from './routes/chatRoutes.js';
import authRoutes from './routes/auth.js';
import SocketManager from './socket/socketManager.js'; // Используем импорт для ES6
import dotenv from 'dotenv';
import { Message } from './models/Message.js'; // Assuming Message model is defined in this file

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://chat-reenbit2024-9pdv.vercel.app'
}));
app.use(express.json());
app.use('/api', chatRoutes);
app.use('/api/auth', authRoutes);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "https://chat-reenbit2024-9pdv.vercel.app",
    methods: ["GET", "POST"],
  },
});

// Initialize socket manager
const socketManager = new SocketManager(io);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat_app';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Update message
app.put('/api/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const message = await Message.findByIdAndUpdate(id, { text }, { new: true });
    if (!message) {
      return res.status(404).send('Message not found');
    }

    res.json(message);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Chat API is running' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
