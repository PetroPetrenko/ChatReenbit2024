import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import router from './routes/chatRoutes.js';
import { setupSocketHandlers } from './socket/socketHandlers.js';
import { Chat } from './models/Chat.js';
import { User } from './models/User.js';
import fetch from 'node-fetch';

dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
const httpServer = createServer(app);

// Socket.IO setup with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "https://chat-reenbit2024-9pdv.vercel.app",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://chat-reenbit2024-9pdv.vercel.app",
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    // Predefined Chats
    const predefinedChats = [
      { firstName: 'Alice', lastName: 'Johnson', img: '', createdAt: new Date() },
      { firstName: 'Bob', lastName: 'Smith', img: '', createdAt: new Date() },
      { firstName: 'Charlie', lastName: 'Brown', img: '', createdAt: new Date() }
    ];

    Chat.insertMany(predefinedChats)
      .then(() => console.log('Predefined chats added'))
      .catch((error) => console.error('Error adding predefined chats:', error));

    // Function to create a user with a random avatar
    async function createUser(firstName, lastName) {
      try {
        const response = await fetch(`https://avatars.dicebear.com/api/initials/${firstName}-${lastName}.svg`);
        const avatarUrl = response.url;
        const newUser = new User({
          firstName,
          lastName,
          avatar: avatarUrl
        });
        await newUser.save();
        console.log('User created:', newUser);
      } catch (error) {
        console.error('Error creating user:', error);
      }
    }

    // Example usage
    createUser('John', 'Doe');
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Chat App API');
});

// Routes
app.use('/api/chats', router);

// Socket.IO handlers
setupSocketHandlers(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3334;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
