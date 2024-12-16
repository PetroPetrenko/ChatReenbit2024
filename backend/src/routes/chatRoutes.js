import express from 'express';
import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';

const router = express.Router();

// Get all chats
router.get('/chats', async (req, res) => {
  try {
    const chats = await Chat.find().sort({ lastMessageDate: -1 });
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch chats',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create a new chat
router.post('/chats', async (req, res) => {
  try {
    const { firstName, lastName, title } = req.body;
    
    if (!firstName || !lastName) {
      return res.status(400).json({ 
        error: 'First name and last name are required' 
      });
    }

    const chat = new Chat({
      firstName,
      lastName,
      title: title || `${firstName} ${lastName}`
    });

    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ 
      error: 'Failed to create chat',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get chat by ID
router.get('/chats/:id', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ 
      error: 'Failed to fetch chat',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get messages for a chat
router.get('/chats/:id/messages', async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.id })
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      error: 'Failed to fetch messages',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add message to chat
router.post('/chats/:id/messages', async (req, res) => {
  try {
    const { text, sender } = req.body;
    const chatId = req.params.id;

    if (!text || !sender) {
      return res.status(400).json({ 
        error: 'Text and sender are required' 
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const message = new Message({
      chatId,
      text,
      sender,
      timestamp: new Date()
    });

    await message.save();

    // Update last message in chat
    chat.lastMessage = text;
    chat.lastMessageDate = message.timestamp;
    await chat.save();

    res.status(201).json(message);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ 
      error: 'Failed to add message',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update a message
router.put('/messages/:id', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        error: 'Message text is required' 
      });
    }

    const message = await Message.findByIdAndUpdate(
      req.params.id, 
      { 
        text, 
        edited: true,
        editedAt: new Date() 
      }, 
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Update last message in chat if this is the last message
    const chat = await Chat.findById(message.chatId);
    if (chat && chat.lastMessage === message.text) {
      chat.lastMessage = text;
      await chat.save();
    }

    res.json(message);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ 
      error: 'Failed to update message',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete chat
router.delete('/chats/:id', async (req, res) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Delete all messages in chat
    await Message.deleteMany({ chatId: req.params.id });

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ 
      error: 'Failed to delete chat',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
