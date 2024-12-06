import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    default: function() {
      return `${this.firstName} ${this.lastName}`;
    }
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Check if model exists before creating
const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);

export { Chat };
