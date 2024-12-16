import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, formatDistance, subDays } from 'date-fns';
import { toast } from 'react-toastify';
import { useChatStore } from '../../store/chatStore';
import styles from './ChatList.module.css';
import buttonStyles from '../../styles/buttons.module.css';
import ChatDialog from '../ChatDialog/ChatDialog';
import SearchBar from '../SearchBar/SearchBar';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import AutoMessageControl from '../AutoMessageControl/AutoMessageControl';
import { apiUrl } from '../../config/host.config';

const ChatList = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const { chats, setChats, setCurrentChat } = useChatStore();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  const filteredChats = chats?.filter(chat =>
    `${chat.firstName} ${chat.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleCreateChat = async (formData) => {
    try {
      const response = await fetch(`${apiUrl}/api/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          title: `${formData.firstName} ${formData.lastName}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create chat');
      }

      const newChat = await response.json();
      setChats([...chats, newChat]);
      toast.success('Chat created successfully!');
      setCurrentChat(newChat);
      navigate(`/chat/${newChat._id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error(`Error creating chat: ${error.message}`);
    }
  };

  const handleUpdateChat = async (chatData) => {
    try {
      const response = await fetch(`${apiUrl}/api/chats/${selectedChat._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update chat');
      }
      
      const updatedChat = await response.json();
      setChats(chats.map(chat => (chat._id === updatedChat._id ? updatedChat : chat)));
      toast.success('Chat updated successfully');
    } catch (error) {
      console.error('Error updating chat:', error);
      toast.error('Failed to update chat');
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      const response = await fetch(`${apiUrl}/api/chats/${chatId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }
      
      setChats(chats.filter(chat => chat._id !== chatId));
      toast.success('Chat deleted successfully');
      setShowConfirmDialog(false);
      setChatToDelete(null);
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const handleConfirmDelete = (chat) => {
    setChatToDelete(chat);
    setShowConfirmDialog(true);
  };

  const handleSelectChat = (chat) => {
    setCurrentChat(chat);
    navigate(`/chat/${chat._id}`);
  };

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/chats`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error('Error fetching chats:', error);
        toast.error('Не удалось загрузить чаты. Проверьте подключение к серверу.');
      }
    };

    fetchChats();
  }, [setChats]);

  return (
    <div className={styles.chatList}>
      <div className={styles.header}>
        <h2>Chats</h2>
        <button
          className={`${buttonStyles.button} ${buttonStyles.primary}`}
          onClick={() => { setSelectedChat(null); setShowDialog(true); }}
        >
          New Chat
        </button>
      </div>

      <AutoMessageControl />

      <div className={styles.searchWrapper}>
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search or start new chat"
        />
      </div>

      <div className={styles.list}>
        {filteredChats.map((chat) => (
          <div
            key={chat._id}
            className={`${styles.chatItem} ${chat._id === chatId ? styles.active : ''}`}
            onClick={() => handleSelectChat(chat)}
          >
            <div className={styles.avatar}>
              {chat.firstName?.[0]}
              {chat.lastName?.[0]}
            </div>
            <div className={styles.chatInfo}>
              <div className={styles.name}>
                {chat.firstName} {chat.lastName}
              </div>
              <div className={styles.lastMessage}>
                {chat.lastMessage || 'No messages yet'}
              </div>
              <div className={styles.chatDate}>
                {chat.lastMessageDate 
                  ? formatDistance(new Date(chat.lastMessageDate), new Date(), { addSuffix: true }) 
                  : ''}
              </div>
            </div>
           
            <div className={styles.buttonContainer}>
              <button
                className={`${buttonStyles.button} ${buttonStyles.secondary}`}
                onClick={(e) => { e.stopPropagation(); setSelectedChat(chat); setShowDialog(true); }}
              >
                Edit
              </button>
              <button
                className={`${buttonStyles.button} ${buttonStyles.danger}`}
                onClick={(e) => { e.stopPropagation(); handleConfirmDelete(chat); }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showDialog && (
        <ChatDialog
          chat={selectedChat}
          onSubmit={selectedChat ? handleUpdateChat : handleCreateChat}
          onClose={() => { setShowDialog(false); setSelectedChat(null); }}
        />
      )}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Delete Chat"
        message={chatToDelete ? `Are you sure you want to delete the chat with ${chatToDelete.firstName} ${chatToDelete.lastName}?` : ''}
        onConfirm={() => handleDeleteChat(chatToDelete?._id)}
        onCancel={() => { setShowConfirmDialog(false); setChatToDelete(null); }}
      />
    </div>
  );
};

export default ChatList;
