import { Message } from '../models/Message.js';
import { Chat } from '../models/Chat.js';
import autoMessageManager from './autoMessages.js';

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

    // Запуск автоматических сообщений
    socket.on('start_auto_messages', (chatId) => {
      console.log(`🤖 ПОДРОБНАЯ ОТЛАДКА АВТО-СООБЩЕНИЙ:`, {
        chatId,
        socketRooms: Array.from(socket.rooms),
        currentSocketId: socket.id,
        connectedUsers: socket.adapter?.sids ? Array.from(socket.adapter.sids.keys()) : 'Недоступно'
      });

      // Принудительное подключение к комнате чата
      if (!socket.rooms.has(chatId)) {
        socket.join(chatId);
        console.log(`🚪 Автоматическое присоединение к комнате ${chatId}`);
      }
      
      try {
        // Расширенная отладка запуска авто-сообщений
        console.log(`🔍 Детали запуска для чата ${chatId}:`, {
          timestamp: new Date().toISOString(),
          socketConnected: socket.connected,
          ioAvailable: !!io
        });

        autoMessageManager.startAutoMessages(chatId, io);
        
        // Расширенное подтверждение
        io.to(chatId).emit('auto_messages_started', {
          chatId, 
          timestamp: new Date().toISOString(),
          message: 'Авто-сообщения успешно запущены'
        });
        
        console.log(`✅ Авто-сообщения запущены и событие отправлено для чата ${chatId}`);
      } catch (error) {
        console.error(`❌ КРИТИЧЕСКАЯ ОШИБКА при запуске авто-сообщений:`, {
          chatId,
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack
        });

        socket.emit('auto_messages_error', { 
          chatId, 
          message: 'Не удалось запустить авто-сообщения',
          error: error.toString(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // Остановка автоматических сообщений
    socket.on('stop_auto_messages', (chatId) => {
      console.log(`Received request to stop auto messages for chat ${chatId}`);
      autoMessageManager.stopAutoMessages(chatId);
      io.to(chatId).emit('auto_messages_stopped', chatId);
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
