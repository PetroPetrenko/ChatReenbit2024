import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';
import axios from 'axios';
import https from 'https';

const RESPONSE_DELAY = 3000; // 3 seconds for testing
const QUOTABLE_API_URL = 'https://api.quotable.io/random';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second between retries

// Fallback quotes if API fails
const FALLBACK_QUOTES = [
  { content: "Life is what happens while you are busy making other plans.", author: "John Lennon" },
  { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { content: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { content: "Stay hungry, stay foolish.", author: "Steve Jobs" }
];

// Создаем агент, который игнорирует ошибки SSL-сертификата
const httpsAgent = new https.Agent({  
  rejectUnauthorized: false
});

class AutoMessageManager {
  constructor() {
    this.activeChats = new Map(); // Map to store intervals
    this.isShuttingDown = false;
    this.connectedChats = new Set(); // Add this to track connected chats
  }

  async getRandomQuote() {
    try {
      console.log('🌐 Начало получения цитаты');
      const response = await axios.get('https://api.quotable.io/random', {
        httpsAgent, // Используем агент с отключенной проверкой сертификата
        timeout: 5000,
        transitional: {
          clarifyTimeoutError: true
        }
      });
      
      console.log('✅ Цитата успешно получена:', {
        quote: response.data.content,
        author: response.data.author
      });
      
      return response.data.content || 'Случайная цитата дня';
    } catch (error) {
      console.error('🌐 Ошибка получения цитаты:', error.message);
      
      // Массив резервных цитат
      const fallbackQuotes = [
        'Жизнь - это то, что с тобой происходит, пока ты занят другими планами.',
        'Мудрость приходит с опытом, а опыт - с ошибками.',
        'Успех - это способность идти от неудачи к неудаче, не теряя энтузиазма.',
        'Каждый день - это новая возможность стать лучше, чем вчера.',
        'Важно не останавливаться и верить в себя.'
      ];
      
      console.log('🔄 Используется резервная цитата:', fallbackQuotes[0]);
      return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    }
  }

  async startAutoMessages(chatId, io) {
    try {
      if (this.isShuttingDown) {
        console.log('System is shutting down, not starting new auto messages');
        return;
      }

      // Stop any existing interval for this chat
      this.stopAutoMessages(chatId);

      const chat = await Chat.findById(chatId);
      if (!chat) {
        console.error(`Chat ${chatId} not found`);
        return;
      }

      console.log(`🟢 Starting auto messages for chat ${chatId}`);

      const sendAutoMessage = async () => {
        try {
          if (this.isShuttingDown) {
            console.log(`🛑 Shutting down auto messages for chat ${chatId}`);
            this.stopAutoMessages(chatId);
            return;
          }

          const quote = await this.getRandomQuote();
          
          const message = new Message({
            chatId,
            text: quote,
            sender: 'bot', // Lowercase 'bot'
            timestamp: new Date()
          });

          await message.save();

          await Chat.findByIdAndUpdate(chatId, {
            lastMessage: quote,
            lastMessageDate: new Date()
          });

          io.to(chatId).emit('receive_message', {
            _id: message._id,
            chatId,
            author: 'Bot', // Capitalized for display
            text: quote,
            sender: 'bot',
            timestamp: message.timestamp
          });

        } catch (error) {
          console.error(`❌ Error in auto message generation for chat ${chatId}:`, error);
          if (error.name === 'MongooseError' || error.name === 'MongoError') {
            this.stopAutoMessages(chatId);
          }
        }
      };

      // Initial message
      await sendAutoMessage();

      // Set up interval for subsequent messages
      const interval = setInterval(sendAutoMessage, RESPONSE_DELAY);
      
      this.activeChats.set(chatId, interval);

    } catch (error) {
      console.error(`❌ Error starting auto messages for chat ${chatId}:`, error);
      this.stopAutoMessages(chatId);
    }
  }

  stopAutoMessages(chatId) {
    const interval = this.activeChats.get(chatId);
    if (interval) {
      clearInterval(interval);
      this.activeChats.delete(chatId);
      console.log(`Stopped auto messages for chat ${chatId}`);
    }
  }

  addChat(chatId) {
    this.connectedChats.add(chatId);
    console.log(`Chat ${chatId} added to tracking`);
  }

  removeChat(chatId) {
    this.connectedChats.delete(chatId);
    this.stopAutoMessages(chatId);
    console.log(`Chat ${chatId} removed from tracking`);
  }

  cleanup() {
    this.isShuttingDown = true;
    console.log('Cleaning up auto messages...');
    for (const [chatId, interval] of this.activeChats.entries()) {
      clearInterval(interval);
      console.log(`Cleaned up auto messages for chat ${chatId}`);
    }
    this.activeChats.clear();
  }
}

const autoMessageManager = new AutoMessageManager();

// Handle cleanup on process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received, cleaning up...');
  autoMessageManager.cleanup();
});

process.on('SIGINT', () => {
  console.log('SIGINT received, cleaning up...');
  autoMessageManager.cleanup();
});

export default autoMessageManager;
