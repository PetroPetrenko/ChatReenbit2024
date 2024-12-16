import autoMessageManager from './autoMessages.js';
import { Message } from '../models/Message.js';

class SocketManager {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Set();
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
      this.connectedUsers.add(socket.id);
      this.io.emit('connected_users', Array.from(this.connectedUsers));

      socket.on('join_room', (chatId) => {
        if (!chatId) {
          console.error('No chatId provided for join_room');
          return;
        }
        socket.join(chatId);
        autoMessageManager.addChat(chatId);
        console.log(`Socket ${socket.id} joined room ${chatId}`);
      });

      socket.on('leave_room', (chatId) => {
        if (!chatId) {
          console.error('No chatId provided for leave_room');
          return;
        }
        socket.leave(chatId);
        autoMessageManager.removeChat(chatId);
        console.log(`Socket ${socket.id} left room ${chatId}`);
      });

      socket.on('start_auto_messages', async (chatId) => {
        if (!chatId) {
          console.error('No chatId provided for start_auto_messages');
          socket.emit('error', { message: 'Chat ID is required' });
          return;
        }
        
        console.log(`Starting auto messages for chat: ${chatId}`);
        try {
          await autoMessageManager.startAutoMessages(chatId, socket);
          socket.emit('auto_messages_started', chatId);
        } catch (error) {
          console.error('Error starting auto messages:', error);
          socket.emit('error', { message: 'Failed to start auto messages' });
        }
      });

      socket.on('stop_auto_messages', (chatId) => {
        if (!chatId) {
          console.error('No chatId provided for stop_auto_messages');
          socket.emit('error', { message: 'Chat ID is required' });
          return;
        }
        
        console.log(`Stopping auto messages for chat: ${chatId}`);
        autoMessageManager.stopAutoMessages(chatId);
        socket.emit('auto_messages_stopped', chatId);
      });

      socket.on('send_message', async (messageData) => {
        try {
          if (!messageData || !messageData.chatId) {
            console.error('Invalid message data');
            return;
          }

          const message = new Message({
            chatId: messageData.chatId,
            text: messageData.text,
            sender: messageData.sender,
            timestamp: new Date()
          });
          await message.save();
          socket.to(messageData.chatId).emit('receive_message', message);
        } catch (error) {
          console.error('Error handling send_message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      socket.on('update_message', async (messageData) => {
        const { messageId, newText } = messageData;
        try {
          const updatedMessage = await Message.findByIdAndUpdate(
            messageId,
            { text: newText },
            { new: true }
          );
          if (updatedMessage) {
            this.io.to(updatedMessage.chatId.toString()).emit('message_updated', updatedMessage);
          }
        } catch (error) {
          console.error('Error updating message:', error);
          socket.emit('error', { message: 'Failed to update message' });
        }
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        this.connectedUsers.delete(socket.id);
        this.io.emit('connected_users', Array.from(this.connectedUsers));
      });
    });
  }
}

export default SocketManager;
