import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatWindow from '../ChatWindow';
import { AuthContext } from '../../../context/AuthContext';
import { SocketContext } from '../../../context/SocketContext';

// Мок-данные для различных сценариев
const mockAuthContext = {
  user: { 
    _id: 'user123', 
    firstName: 'John', 
    lastName: 'Doe' 
  }
};

const mockSocketContext = {
  socket: {
    emit: jest.fn(),
    on: jest.fn()
  }
};

// Тестовые сценарии чатов
const singleUserChat = {
  _id: 'chat1',
  name: 'Alice Smith',
  type: 'single',
  participants: [
    { _id: 'user1', firstName: 'Alice', lastName: 'Smith' }
  ],
  isGroup: false
};

const groupChat = {
  _id: 'chat2',
  name: 'Team Rocket',
  type: 'group',
  description: 'Awesome team chat',
  participants: [
    { _id: 'user1', firstName: 'John', lastName: 'Doe' },
    { _id: 'user2', firstName: 'Alice', lastName: 'Smith' },
    { _id: 'user3', firstName: 'Bob', lastName: 'Johnson' }
  ],
  isGroup: true
};

const mockMessages = [
  {
    _id: 'msg1',
    text: 'Hello world',
    sender: 'user',
    timestamp: new Date().toISOString()
  },
  {
    _id: 'msg2', 
    text: 'Hi there!', 
    sender: 'bot',
    timestamp: new Date().toISOString()
  }
];

describe('ChatWindow Component', () => {
  const renderComponent = (currentChat = null, currentMessages = []) => {
    return render(
      <AuthContext.Provider value={mockAuthContext}>
        <SocketContext.Provider value={mockSocketContext}>
          <ChatWindow 
            currentChat={currentChat} 
            currentMessages={currentMessages} 
          />
        </SocketContext.Provider>
      </AuthContext.Provider>
    );
  };

  test('renders no chat selected state', () => {
    renderComponent();
    expect(screen.getByText(/Select a chat to start messaging/i)).toBeInTheDocument();
  });

  test('renders single user chat header', () => {
    renderComponent(singleUserChat);
    
    // Проверяем название чата
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    
    // Проверяем количество участников
    expect(screen.getByText('1 participants')).toBeInTheDocument();
  });

  test('renders group chat header', () => {
    renderComponent(groupChat, mockMessages);
    
    // Проверяем название группового чата
    expect(screen.getByText('Team Rocket')).toBeInTheDocument();
    
    // Проверяем описание
    expect(screen.getByText('Awesome team chat')).toBeInTheDocument();
    
    // Проверяем количество участников
    expect(screen.getByText('3 participants')).toBeInTheDocument();
    
    // Проверяем кнопку добавления участников
    expect(screen.getByText('Add Participant')).toBeInTheDocument();
  });

  test('renders message labels correctly', () => {
    renderComponent(singleUserChat, mockMessages);
    
    // Проверяем метки сообщений
    const userLabel = screen.getByText('You');
    const botLabel = screen.getByText('Bot');
    
    expect(userLabel).toBeInTheDocument();
    expect(botLabel).toBeInTheDocument();
  });

  test('message content is displayed', () => {
    renderComponent(singleUserChat, mockMessages);
    
    // Проверяем текст сообщений
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });
});
