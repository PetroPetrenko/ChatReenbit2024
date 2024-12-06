import { create } from 'zustand';

const useStore = create((set) => ({
  // Chat state
  chats: [],
  selectedChat: null,
  messages: [],

  // Actions
  setChats: (chats) => set({ chats }),
  setSelectedChat: (chat) => set({ selectedChat: chat, messages: [] }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  
  // Chat actions
  createChat: (chat) => set((state) => ({ 
    chats: [...state.chats, chat] 
  })),
  updateChat: (updatedChat) => set((state) => ({
    chats: state.chats.map((chat) => 
      chat._id === updatedChat._id ? updatedChat : chat
    )
  })),
  deleteChat: (chatId) => set((state) => ({
    chats: state.chats.filter((chat) => chat._id !== chatId),
    selectedChat: state.selectedChat?._id === chatId ? null : state.selectedChat
  })),

  // Search functionality
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  // UI state
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  
  // Error handling
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null })
}));

export { useStore };
