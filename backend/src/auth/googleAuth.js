import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    // Additional validation
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    return {
      googleId: payload['sub'],
      email: payload['email'],
      name: payload['name'],
      picture: payload['picture']
    };
  } catch (error) {
    console.error('Google Token Verification Error:', error);
    throw error;
  }
};
