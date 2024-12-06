import express from 'express';
import { verifyGoogleToken } from '../auth/googleAuth.js';

const router = express.Router();

router.post('/google-login', async (req, res) => {
  const { token } = req.body;
  try {
    const userData = await verifyGoogleToken(token);
    // Handle user data (e.g., create or find user in DB)
    res.json({ success: true, user: userData });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid token' });
  }
});

export default router;
