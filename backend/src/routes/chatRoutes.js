import express from 'express';
import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';

const router = express.Router();

// Get all chats
router.get('/chats', async (req, res) => {
  try {
    const chats = await Chat.find();
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
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
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.message 
      });
    }
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// Get chat messages
router.get('/chats/:chatId/messages', async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Add message to chat
router.post('/chats/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text, sender } = req.body;

    // Validate chat exists
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

    // Update chat's last message
    chat.lastMessage = text;
    chat.lastMessageDate = new Date();
    await chat.save();

    res.status(201).json(message);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Get bot response
router.post('/chats/:chatId/bot-response', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userMessage } = req.body;

    // Simple bot response logic
    const botMessage = new Message({
      chatId,
      text: `Bot response to: ${userMessage}`,
      sender: 'bot',
      timestamp: new Date()
    });

    await botMessage.save();

    // Update chat's last message
    const chat = await Chat.findById(chatId);
    if (chat) {
      chat.lastMessage = botMessage.text;
      chat.lastMessageDate = new Date();
      await chat.save();
    }

    res.status(201).json(botMessage);
  } catch (error) {
    console.error('Error generating bot response:', error);
    res.status(500).json({ error: 'Failed to generate bot response' });
  }
});

// Update chat
router.put('/chats/:id', async (req, res) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    res.json(chat);
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({ error: 'Failed to update chat' });
  }
});

// Delete chat
router.delete('/chats/:id', async (req, res) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    // Delete all messages associated with this chat
    await Message.deleteMany({ chatId: req.params.id });
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

export default router;
