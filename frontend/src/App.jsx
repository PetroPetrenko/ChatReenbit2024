import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './App.module.css';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import ConnectedUsers from './components/ConnectedUsers';
import GoogleLoginButton from './components/GoogleLoginButton';

const App = () => {
  return (
    <Router>
      <div className={styles.app}>
        <div className={styles.header}>
          <h1>Welcome to ChatApp</h1>
          <GoogleLoginButton />
        </div>
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
  );
};

export default App;
