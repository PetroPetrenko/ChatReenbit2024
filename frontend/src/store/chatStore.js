import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

const initialState = {
  chats: [],
  currentChat: null,
  messages: {},
  isLoading: false,
  error: null
};

export const useChatStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setChats: (chats) => set((state) => {
          // Ensure chats is an array
          const chatsArray = Array.isArray(chats) ? chats : [chats];
          
          // Remove duplicates based on firstName and lastName
          const uniqueChats = chatsArray.reduce((acc, current) => {
            const x = acc.find(item => item.firstName === current.firstName && item.lastName === current.lastName);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, []);
          
          return {
            ...state,
            chats: uniqueChats
          };
        }),

        setCurrentChat: (chat) => set((state) => ({
          ...state,
          currentChat: chat
        })),

        setMessages: (chatId, messages) => set((state) => ({
          ...state,
          messages: {
            ...state.messages,
            [chatId]: messages
          }
        })),

        addMessage: (chatId, message) => set((state) => ({
          ...state,
          messages: {
            ...state.messages,
            [chatId]: [...(state.messages[chatId] || []), message]
          }
        })),

        setLoading: (isLoading) => set((state) => ({
          ...state,
          isLoading
        })),

        setError: (error) => set((state) => ({
          ...state,
          error
        })),

        reset: () => set(initialState)
      }),
      {
        name: 'chat-storage',
        version: 1,
      }
    )
  )
);
