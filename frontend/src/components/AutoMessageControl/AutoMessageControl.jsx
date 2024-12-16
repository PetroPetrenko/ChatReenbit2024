import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { socket } from '../../socket';
import { useChatStore } from '../../store/chatStore';
import { apiUrl } from '../../config/host.config';
import styles from './AutoMessageControl.module.css';
import buttonStyles from '../../styles/buttons.module.css';

const AutoMessageControl = () => {
  const [isActive, setIsActive] = useState(false);
  const { currentChat } = useChatStore();
  
  const startAutoMessages = () => {
    if (!currentChat) {
      toast.error('Please select a chat first');
      return;
    }

    setIsActive(true);
    socket.emit('start_auto_messages', currentChat._id);
    toast.info('Auto-messaging started');
  };

  const stopAutoMessages = () => {
    if (!currentChat) {
      toast.error('No chat selected');
      return;
    }

    setIsActive(false);
    socket.emit('stop_auto_messages', currentChat._id);
    toast.info('Auto-messaging stopped');
  };

  // Listen for auto messages status updates
  React.useEffect(() => {
    if (!currentChat) {
      return;
    }

    const handleAutoMessagesStopped = (chatId) => {
      console.log(`🤖 ОТЛАДКА: Остановка авто-сообщений`, {
        chatId,
        currentChatId: currentChat?._id,
        timestamp: new Date().toISOString()
      });

      if (chatId === currentChat?._id) {
        setIsActive(false);
        toast.info('Авто-сообщения остановлены');
      }
    };

    const handleAutoMessagesStarted = (data) => {
      console.log(`🤖 ОТЛАДКА: Запуск авто-сообщений`, {
        data,
        currentChatId: currentChat?._id,
        timestamp: new Date().toISOString()
      });

      if (data.chatId === currentChat?._id) {
        setIsActive(true);
        toast.info('Авто-сообщения запущены');
      }
    };

    const handleAutoMessagesError = (errorData) => {
      console.error('🚨 ОШИБКА авто-сообщений:', {
        errorData,
        currentChatId: currentChat?._id,
        timestamp: new Date().toISOString()
      });

      setIsActive(false);
      toast.error(`Ошибка авто-сообщений: ${errorData.message}`);
    };

    socket.on('auto_messages_stopped', handleAutoMessagesStopped);
    socket.on('auto_messages_started', handleAutoMessagesStarted);
    socket.on('auto_messages_error', handleAutoMessagesError);

    return () => {
      socket.off('auto_messages_stopped', handleAutoMessagesStopped);
      socket.off('auto_messages_started', handleAutoMessagesStarted);
      socket.off('auto_messages_error', handleAutoMessagesError);
    };
  }, [currentChat]);

  return (
    <div className={styles.container}>
      <button
        className={`${buttonStyles.button} ${isActive ? buttonStyles.danger : buttonStyles.primary}`}
        onClick={isActive ? stopAutoMessages : startAutoMessages}
        disabled={!currentChat}
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
