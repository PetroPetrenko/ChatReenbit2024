import React from 'react';
import styles from './Navbar.module.css';

const Navbar = () => {
  return (
    <div className={styles.navbar}>
      <h1>Chat App</h1>
      <div className={styles.profileSection}>
        <img src="/path/to/profile/icon.png" alt="Profile" className={styles.profileIcon} />
        <button className={styles.loginButton}>Log in</button>
      </div>
    </div>
  );
};

export default Navbar;
