import { Message } from '../models/Message.js';
import { Chat } from '../models/Chat.js';

export const setupSocketHandlers = (io) => {
  const connectedUsers = new Set();

  io.on('connection', (socket) => {
    connectedUsers.add(socket.id);
    console.log('User connected:', socket.id);

    // Join a chat room
    socket.on('join_room', (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.id} joined room ${chatId}`);
    });

    // Leave a chat room
    socket.on('leave_room', (chatId) => {
      socket.leave(chatId);
      console.log(`User ${socket.id} left room ${chatId}`);
    });

    // Typing event
    socket.on('typing', (chatId) => {
      socket.to(chatId).emit('user_typing', socket.id);
    });

    socket.on('stop_typing', (chatId) => {
      socket.to(chatId).emit('user_stop_typing', socket.id);
    });

    // Ping-Pong test
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Send message
    socket.on('send_message', async (messageData) => {
      try {
        const { chatId, author, text } = messageData;
        
        // Create and save the message
        const message = new Message({
          chatId,
          author,
          text,
          timestamp: new Date()
        });
        await message.save();

        // Broadcast the message to the room
        io.to(chatId).emit('receive_message', {
          _id: message._id,
          chatId,
          author,
          text,
          timestamp: message.timestamp
        });

        // Send auto-response after 3 seconds
        setTimeout(async () => {
          try {
            const response = await fetch('https://api.quotable.io/random');
            const data = await response.json();
            
            const autoMessage = new Message({
              chatId,
              author: 'Bot',
              text: data.content,
              timestamp: new Date()
            });
            await autoMessage.save();

            io.to(chatId).emit('receive_message', {
              _id: autoMessage._id,
              chatId,
              author: 'Bot',
              text: data.content,
              timestamp: autoMessage.timestamp
            });
          } catch (error) {
            console.error('Error sending auto-response:', error);
            socket.emit('error', { message: 'Error sending auto-response' });
          }
        }, 3000);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    socket.on('request_connected_users', () => {
      socket.emit('connected_users', Array.from(connectedUsers));
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.warn('Reconnection failed');
    });

    socket.on('disconnect', (reason) => {
      console.log('User disconnected:', socket.id, 'Reason:', reason);
      connectedUsers.delete(socket.id);
    });
  });
};
