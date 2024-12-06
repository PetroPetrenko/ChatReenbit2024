import React, { useState } from 'react';
import { useValidation } from '../../hooks/useValidation';
import styles from './MessageInput.module.css';

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const { validate, errors } = useValidation();

  const handleSubmit = (e) => {
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
      onSendMessage(message);
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
