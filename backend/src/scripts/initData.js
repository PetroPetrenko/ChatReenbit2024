import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Chat } from '../models/chat.js';
import { Message } from '../models/message.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat_app';

const initializeData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Chat.deleteMany({});
    await Message.deleteMany({});

    // Create test chats
    const chats = await Chat.create([
      {
        firstName: 'John',
        lastName: 'Doe',
        title: 'General Chat',
        lastMessage: 'Welcome to the general chat!',
        lastMessageDate: new Date()
      },
      {
        firstName: 'Alice',
        lastName: 'Smith',
        title: 'Tech Support',
        lastMessage: 'How can we help you today?',
        lastMessageDate: new Date()
      },
      {
        firstName: 'Bob',
        lastName: 'Johnson',
        title: 'Random Talk',
        lastMessage: 'Anyone up for a random conversation?',
        lastMessageDate: new Date()
      }
    ]);

    // Add initial messages to each chat
    for (const chat of chats) {
      await Message.create({
        chatId: chat._id,
        text: chat.lastMessage,
        sender: 'bot',
        timestamp: chat.lastMessageDate
      });
    }

    console.log('Test data initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing data:', error);
    process.exit(1);
  }
};

initializeData();
