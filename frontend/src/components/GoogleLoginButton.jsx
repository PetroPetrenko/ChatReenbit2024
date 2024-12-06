import React, { useState, useEffect } from 'react';
import styles from './GoogleLoginButton.module.css';

const GoogleLoginButton = () => {
  const [user, setUser] = useState(null);

  const handleLogin = async (googleUser) => {
    try {
      const idToken = googleUser.getAuthResponse().id_token;
      const response = await fetch('http://localhost:3333/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = () => {
    const auth2 = window.gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {
      setUser(null);
      localStorage.removeItem('user');
    });
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    window.gapi.load('auth2', () => {
      window.gapi.auth2.init({
        client_id: '961833498122-f0b6rumpnh607lengqthmd4cvks7ag8q.apps.googleusercontent.com',
      }).then(() => {
        window.gapi.signin2.render('google-signin-button', {
          scope: 'profile email',
          width: 240,
          height: 50,
          longtitle: true,
          theme: 'dark',
          onsuccess: handleLogin,
        });
      });
    });
  }, []);

  if (user) {
    return (
      <div className={styles.userContainer}>
        <img src={user.picture} alt="Profile" className={styles.profilePic} />
        <span className={styles.userName}>{user.name}</span>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
    );
  }

  return <div id="google-signin-button" className={styles.signInButton}></div>;
};

export default GoogleLoginButton;
