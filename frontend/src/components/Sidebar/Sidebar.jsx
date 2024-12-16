import React, { useState, useContext, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import styles from './Sidebar.module.css';
import { FaSearch } from 'react-icons/fa';

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';

  const now = new Date();
  const messageDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now - messageDate) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hr ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day ago`;
  }

  return messageDate.toLocaleDateString();
};

const Sidebar = ({ chats, onSelectChat, activeChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useContext(AuthContext);

  const filteredChats = useMemo(() => {
    return chats.filter(chat => 
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chats, searchTerm]);

  const renderChatItem = (chat) => {
    const isActive = activeChat?._id === chat._id;
    const lastMessage = chat.lastMessage || {};

    return (
      <div 
        key={chat._id} 
        className={`${styles.chatItem} ${isActive ? styles.active : ''}`}
        onClick={() => onSelectChat(chat)}
      >
        <div className={styles.avatarContainer}>
          <img 
            src={chat.avatar || '/default-avatar.png'} 
            alt={chat.name} 
            className={styles.avatar} 
          />
          {chat.isOnline && <div className={styles.onlineStatus}></div>}
        </div>
        
        <div className={styles.chatInfo}>
          <div className={styles.chatName}>{chat.name}</div>
          <div className={styles.lastMessage}>
            {lastMessage.text || 'No messages yet'}
          </div>
        </div>
        
        <div className={styles.chatMeta}>
          <div className={styles.timestamp}>
            {lastMessage.timestamp 
              ? formatTimeAgo(lastMessage.timestamp) 
              : ''}
          </div>
          {chat.unreadCount > 0 && (
            <div className={styles.unreadCount}>
              {chat.unreadCount}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.searchContainer}>
        <FaSearch color="#6c757d" />
        <input 
          type="text" 
          placeholder="Search chats" 
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className={styles.chatList}>
        {filteredChats.length > 0 
          ? filteredChats.map(renderChatItem)
          : <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
              No chats found
            </div>
        }
      </div>
    </div>
  );
};

export default Sidebar;
