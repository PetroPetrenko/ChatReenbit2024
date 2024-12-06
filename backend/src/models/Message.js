import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    required: true,
    enum: ['user', 'bot']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Check if model exists before creating
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export { Message };
