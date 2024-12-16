import express from 'express';
import cors from 'cors';
import { verifyGoogleToken } from '../auth/googleAuth.js';

const router = express.Router();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173', 
    'http://localhost:3333',
    'https://chat-reenbit2024-9pdv.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

router.use(cors(corsOptions));

router.post('/google-login', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const userData = await verifyGoogleToken(token);
    if (!userData) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
