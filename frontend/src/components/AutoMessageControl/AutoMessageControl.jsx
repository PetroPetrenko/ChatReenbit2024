import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { socket } from '../../socket';
import { useChatStore } from '../../store/chatStore';
import { apiUrl } from '../../config/host.config';
import styles from './AutoMessageControl.module.css';
import buttonStyles from '../../styles/buttons.module.css';

const AutoMessageControl = () => {
  const [isActive, setIsActive] = useState(false);
  const { chats } = useChatStore();
  
  const startAutoMessages = () => {
    if (chats.length === 0) {
      toast.error('No chats available for auto-messaging');
      return;
    }

    setIsActive(true);
    socket.emit('start_auto_messages');
    toast.info('Auto-messaging started');
  };

  const stopAutoMessages = () => {
    setIsActive(false);
    socket.emit('stop_auto_messages');
    toast.info('Auto-messaging stopped');
  };

  return (
    <div className={styles.container}>
      <button
        className={`${buttonStyles.button} ${isActive ? buttonStyles.danger : buttonStyles.primary}`}
        onClick={isActive ? stopAutoMessages : startAutoMessages}
      >
        {isActive ? 'Stop Auto Messages' : 'Start Auto Messages'}
      </button>
      {isActive && (
        <div className={styles.indicator}>
          <span className={styles.dot}></span>
          Auto-messaging active
        </div>
      )}
    </div>
  );
};

export default AutoMessageControl;
