import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';

export const chatController = {
  async createChat(req, res) {
    try {
      const { firstName, lastName, img } = req.body;
      const chat = new Chat({ firstName, lastName, img });
      await chat.save();
      res.status(201).json(chat);
    } catch (error) {
      res.status(400).json({ error: 'Error creating chat' });
    }
  },

  async updateChat(req, res) {
    try {
      const { id } = req.params;
      const { firstName, lastName, img } = req.body;
      const updatedChat = await Chat.findByIdAndUpdate(
        id,
        { firstName, lastName, img },
        { new: true }
      );
      if (!updatedChat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      res.json(updatedChat);
    } catch (error) {
      res.status(500).json({ message: 'Error updating chat', error });
    }
  },

  async deleteChat(req, res) {
    try {
      const { id } = req.params;
      const deletedChat = await Chat.findByIdAndDelete(id);
      if (!deletedChat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting chat', error });
    }
  },

  async createMessage(req, res) {
    try {
      const { chatId } = req.params;
      const { author, text } = req.body;
      const message = new Message({ chatId, author, text, timestamp: new Date() });
      await message.save();
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: 'Error creating message' });
    }
  }
};

export const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chats' });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
};

export const createChat = async (req, res) => {
  try {
    const { firstName, lastName, img } = req.body;
    const chat = new Chat({ firstName, lastName, img });
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(400).json({ error: 'Error creating chat' });
  }
};

export const createMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { author, text } = req.body;
    const message = new Message({ chatId, author, text, timestamp: new Date() });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Error creating message' });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedChat = await Chat.findByIdAndDelete(id);
    if (!deletedChat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting chat', error });
  }
};

export const updateChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, img } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(
      id,
      { firstName, lastName, img },
      { new: true }
    );
    if (!updatedChat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: 'Error updating chat', error });
  }
};
