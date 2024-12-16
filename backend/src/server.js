import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import chatRoutes from './routes/chatRoutes.js';
import authRoutes from './routes/auth.js';
import SocketManager from './socket/socketManager.js';
import dotenv from 'dotenv';
import { Message } from './models/Message.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
  'http://localhost:3333',
  'https://chat-reenbit2024-9pdv.vercel.app'
];

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://accounts.google.com",
        "https://apis.google.com",
        "https://www.gstatic.com"
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https://accounts.google.com", "wss:", "ws:", "*"],
      frameSrc: ["'self'", "https://accounts.google.com"],
      frameAncestors: ["'self'"]
    },
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', chatRoutes);
app.use('/api/auth', authRoutes);

// Health check and root route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Chat API is running',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    mongodb: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Socket.io setup with improved error handling
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  transports: ['websocket', 'polling']
});

// Initialize socket manager
const socketManager = new SocketManager(io);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

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

// Ensure PORT is set to 3333
const PORT = 3333;

function startServer(port) {
  try {
    server.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
      console.log(`Server is accessible at http://localhost:${port}`);
    });

    // Additional error handling for server
    server.on('error', (error) => {
      console.error(`Server error: ${error.message}`);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Please kill the process or change the port.`);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

startServer(PORT);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
