import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useValidation } from '../../hooks/useValidation';
import styles from './MessageInput.module.css';
import { fetchRandomQuote } from '../../utils/randomQuotes';
import { useStore } from '../../store/store';

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const { validate, errors } = useValidation();
  const { addMessage } = useStore();

  const handleAutoResponse = async () => {
    try {
      // Fetch a random quote
      const quote = await fetchRandomQuote();

      // Create an auto-response message with the quote
      const autoResponseMessage = {
        text: `Here's an inspiring quote for you: "${quote.text}" - ${quote.author}`,
        sender: 'AI Assistant',
        timestamp: new Date().toISOString(),
        type: 'auto-response'
      };

      // Add the auto-response message after a short delay
      setTimeout(() => {
        addMessage(autoResponseMessage);
        toast.info('Received an inspirational quote!', {
          position: "bottom-right",
          autoClose: 3000,
        });
      }, 3000); // 3-second delay as requested
    } catch (error) {
      console.error('Error generating auto-response:', error);
      toast.error('Failed to generate auto-response');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = validate({
      message: {
        value: message,
        rules: {
          required: true,
          minLength: 1
        }
      }
    });

    if (isValid) {
      // Send the original message
      onSendMessage(message);
      
      // Trigger auto-response
      handleAutoResponse();

      // Clear the input
      setMessage('');
    }
  };

  return (
    <form className={styles.messageInput} onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className={`${styles.input} ${errors.message ? styles.error : ''}`}
      />
      <button 
        type="submit" 
        className={styles.sendButton}
        disabled={!message.trim()}
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;
