import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';
import fetch from 'node-fetch';
import https from 'https';

const RESPONSE_DELAY = 3000; // 3 seconds delay for auto-response

const agent = new https.Agent({
  rejectUnauthorized: false
});

class AutoMessageManager {
  constructor() {
    this.activeChats = new Set();
    this.intervals = new Map();
  }

  async getRandomQuote() {
    try {
      const response = await fetch('https://api.quotable.io/random', { agent });
      const data = await response.json();
      return `${data.content} - ${data.author}`;
    } catch (error) {
      console.error('Error fetching quote:', error);
      return 'Life is what happens while you are busy making other plans. - John Lennon';
    }
  }

  async handleUserMessage(socket, messageData) {
    const { chatId } = messageData;
    if (!chatId) {
      console.error('chatId is required');
      return;
    }
    console.log('Handling user message for chat:', chatId);
    
    // Set a 3-second interval for handling user messages
    if (!this.intervals.has(chatId)) {
      const interval = setInterval(async () => {
        console.log(`Handling interval for chat: ${chatId}`);
        try {
          const quote = await this.getRandomQuote();
          
          // Create and save the auto-response message
          const autoMessage = new Message({
            chatId,
            text: quote,
            sender: 'bot',
            timestamp: new Date()
          });
          
          await autoMessage.save();

          // Emit the message through socket
          socket.to(chatId).emit('receive_message', autoMessage);
          socket.emit('receive_message', autoMessage);

        } catch (error) {
          console.error('Error sending auto-response:', error);
        }
      }, RESPONSE_DELAY);
      this.intervals.set(chatId, interval);
    }

    console.log('Set auto-message interval for chat:', chatId);
  }

  stopAutoMessages(chatId) {
    console.log('Stopping auto messages for chat:', chatId);
    const interval = this.intervals.get(chatId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(chatId);
      console.log('Cleared auto-message interval for chat:', chatId);
    } else {
      console.log('No interval found for chat:', chatId);
    }
  }

  addChat(chatId) {
    this.activeChats.add(chatId);
  }

  removeChat(chatId) {
    this.activeChats.delete(chatId);
    this.stopAutoMessages(chatId);
  }
}

const autoMessageManager = new AutoMessageManager();
export default autoMessageManager;
