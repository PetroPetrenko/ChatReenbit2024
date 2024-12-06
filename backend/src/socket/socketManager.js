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

      socket.on('join_room', (chatId) => {
        socket.join(chatId);
        autoMessageManager.addChat(chatId);
        this.connectedUsers.add(socket.id);
        this.io.emit('connected_users', Array.from(this.connectedUsers));
        console.log(`Socket ${socket.id} joined room ${chatId}`);
      });

      socket.on('leave_room', (chatId) => {
        socket.leave(chatId);
        autoMessageManager.removeChat(chatId);
        this.connectedUsers.delete(socket.id);
        this.io.emit('connected_users', Array.from(this.connectedUsers));
        console.log(`Socket ${socket.id} left room ${chatId}`);
      });

      socket.on('send_message', (messageData) => {
        // Broadcast the message to the room
        socket.to(messageData.chatId).emit('receive_message', messageData);
        
        // Handle auto-response
        autoMessageManager.handleUserMessage(socket, messageData);
      });

      socket.on('update_message', async (messageData) => {
        const { messageId, newText } = messageData;
        try {
          const updatedMessage = await Message.findByIdAndUpdate(messageId, { text: newText }, { new: true });
          if (updatedMessage) {
            // Emit the updated message to the room
            this.io.to(updatedMessage.chatId.toString()).emit('message_updated', updatedMessage);
          }
        } catch (error) {
          console.error('Error updating message:', error);
        }
      });

      socket.on('start_auto_messages', (chatId) => {
        console.log('Starting auto messages for chat:', chatId);
        autoMessageManager.addChat(chatId);
        // Имитируем первое сообщение пользователя для запуска авто-сообщений
        autoMessageManager.handleUserMessage(socket, { chatId });
      });

      socket.on('stop_auto_messages', (chatId) => {
        console.log('Received stop_auto_messages for chat:', chatId);
        autoMessageManager.stopAutoMessages(chatId);
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
