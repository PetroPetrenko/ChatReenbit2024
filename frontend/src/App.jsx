import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import styles from './App.module.css';
import { CLIENT_ID } from './config';
import GoogleLoginButton from './components/GoogleLoginButton';
import ChatList from './components/ChatList/ChatList';
import ChatWindow from './components/ChatWindow/ChatWindow';
import ConnectedUsers from './components/ConnectedUsers/ConnectedUsers';
import { 
  fetchRandomQuote, 
  getQuoteCategories 
} from './utils/randomQuotes';

const App = () => {
  const [dailyQuote, setDailyQuote] = useState(null);
  const [quoteCategories, setQuoteCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initQuotes = async () => {
      try {
        // Get available quote categories
        const categories = await getQuoteCategories();
        setQuoteCategories(categories);

        // Generate initial quote
        const quote = await fetchRandomQuote();
        setDailyQuote(quote);
      } catch (error) {
        console.error('Error initializing quotes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initQuotes();
  }, []);

  const handleNewQuote = async (category = null) => {
    setIsLoading(true);
    try {
      const quote = await fetchRandomQuote({ 
        category,  // Передаем категорию напрямую
      });
      setDailyQuote(quote);
      setSelectedCategory(category);
    } catch (error) {
      console.error('Error fetching new quote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <Router>
        <div className={styles.app}>
          <div className={styles.header}>
            <h1>Welcome to ChatApp</h1>
            <GoogleLoginButton />
          </div>
          {dailyQuote && !isLoading && (
            <div className={styles.quoteContainer}>
              <div className={styles.quoteControls}>
                <select 
                  value={selectedCategory || ''} 
                  onChange={(e) => handleNewQuote(e.target.value || null)}
                  className={styles.categorySelect}
                >
                  <option value="">Все категории</option>
                  {quoteCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={() => handleNewQuote(selectedCategory)}
                  className={styles.refreshQuoteButton}
                  disabled={isLoading}
                >
                  {isLoading ? 'Загрузка...' : 'Новая цитата'}
                </button>
              </div>
              <blockquote className={styles.dailyQuote}>
                "{dailyQuote.text}"
                <footer className={styles.quoteAuthor}>
                  - {dailyQuote.author} ({dailyQuote.category})
                </footer>
              </blockquote>
            </div>
          )}
          <div className={styles.container}>
            <ChatList />
            <div className={styles.mainContent}>
              <ChatWindow />
              <ConnectedUsers />
            </div>
          </div>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
