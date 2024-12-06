import React, { useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { socket } from '../../socket';
import { apiUrl } from '../../config/host.config';
import styles from './ChatWindow.module.css';
import { useChatStore } from '../../store/chatStore';
import { FaEdit, FaUser } from 'react-icons/fa';

const ChatWindow = () => {
  const { currentChat, messages, setMessages, addMessage } = useChatStore();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [editMessageId, setEditMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState('');
  const messagesEndRef = useRef(null);

  // Get messages for current chat
  const currentMessages = currentChat ? (messages[currentChat._id] || []) : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentChat?._id) {
      socket.emit('join_room', currentChat._id);
      fetchMessages();
    }

    return () => {
      if (currentChat?._id) {
        socket.emit('leave_room', currentChat._id);
      }
    };
  }, [currentChat]);

  useEffect(() => {
    socket.on('receive_message', (message) => {
      if (currentChat?._id) {
        addMessage(currentChat._id, message);
        // Show notification only for messages from the other user
        if (message.sender !== 'user') {
          toast.info(`New message from ${currentChat.firstName}: ${message.text}`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
        scrollToBottom();
      }
    });

    return () => {
      socket.off('receive_message');
    };
  }, [addMessage, currentChat]);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const fetchMessages = async () => {
    if (!currentChat?._id) return;

    try {
      const response = await fetch(`${apiUrl}/api/chats/${currentChat._id}/messages`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(currentChat._id, data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!newMessage.trim() || !currentChat?._id) return;

    try {
      setIsTyping(true);

      const messageData = {
        chatId: currentChat._id,
        text: newMessage.trim(),
        sender: 'user'
      };

      // Emit socket event
      socket.emit('send_message', messageData);

      // Send to API
      const response = await fetch(`${apiUrl}/api/chats/${currentChat._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const sentMessage = await response.json();
      addMessage(currentChat._id, sentMessage);
      setNewMessage('');
      scrollToBottom();

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditMessage = (messageId, text) => {
    setEditMessageId(messageId);
    setEditMessageText(text);
  };

  const handleSaveEdit = async () => {
    if (!editMessageText.trim()) return;
    try {
      const response = await fetch(`${apiUrl}/api/messages/${editMessageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: editMessageText }),
      });

      if (!response.ok) {
        throw new Error('Failed to update message');
      }

      const updatedMessage = await response.json();
      setMessages(currentChat._id, currentMessages.map(msg => msg._id === updatedMessage._id ? updatedMessage : msg));
      setEditMessageId(null);
      setEditMessageText('');
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Failed to update message');
    }
  };

  const handleCancelEdit = () => {
    setEditMessageId(null);
    setEditMessageText('');
  };

  if (!currentChat) {
    return (
      <div className={styles.noChat}>
        <p>Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className={styles.chatWindow}>
      <div className={styles.chatHeader}>
        <div className={styles.chatInfo}>
          <div className={`${styles.userAvatar} ${styles.defaultIcon}`}>
            <FaUser />
          </div>
          <div className={styles.userInfo}>
            <h2>{currentChat.firstName} {currentChat.lastName}</h2>
            <span className={styles.userStatus}>online</span>
          </div>
        </div>
      </div>

      <div className={styles.messageList}>
        {currentMessages.map((message, index) => (
          <div
            key={message._id || index}
            className={`${styles.message} ${
              message.sender === 'user' ? styles.sent : styles.received
            }`}
          >
            <div className={styles.messageContent}>
              {editMessageId === message._id ? (
                <div>
                  <textarea
                    value={editMessageText}
                    onChange={(e) => setEditMessageText(e.target.value)}
                    className={styles.editInput}
                  />
                  <button onClick={handleSaveEdit} className={styles.saveButton}>Save</button>
                  <button onClick={handleCancelEdit} className={styles.cancelButton}>Cancel</button>
                </div>
              ) : (
                <p>{message.text}</p>
              )}
              {message.sender === 'user' && editMessageId !== message._id && (
                <FaEdit
                  className={styles.editIcon}
                  onClick={() => handleEditMessage(message._id, message.text)}
                />
              )}
            </div>
            <span className={styles.timestamp}>
              {message.timestamp && !isNaN(new Date(message.timestamp).getTime())
                ? format(new Date(message.timestamp), 'dd/MM/yyyy hh:mm a')
                : ''}
            </span>
          </div>
        ))}
        {isTyping && (
          <div className={`${styles.message} ${styles.received}`}>
            <div className={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className={styles.messageForm}>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className={styles.messageInput}
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className={styles.sendButton}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
