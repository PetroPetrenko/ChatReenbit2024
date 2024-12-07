import { io } from 'socket.io-client';
import { socketUrl } from './config/host.config';

//const SOCKET_URL = socketUrl;
const SOCKET_URL = 'https://chat-reenbit2024-9pdv.vercel.app'

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});
