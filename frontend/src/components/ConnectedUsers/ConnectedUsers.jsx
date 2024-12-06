import React, { useEffect, useState } from 'react';
import { socket } from '../../socket';
import styles from './ConnectedUsers.module.css';

const ConnectedUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const handleConnectedUsers = (userList) => {
      setUsers(userList);
    };

    socket.on('connected_users', handleConnectedUsers);
    socket.emit('request_connected_users');

    // Запрашивать список пользователей каждые 5 секунд
    const interval = setInterval(() => {
      socket.emit('request_connected_users');
    }, 5000);

    return () => {
      socket.off('connected_users', handleConnectedUsers);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={styles.connectedUsers}>
      <h3 className={styles.title}>Connected Users ({users.length})</h3>
      <ul className={styles.userList}>
        {users.map((userId) => (
          <li key={userId} className={styles.userItem}>
            <span className={styles.userStatus} />
            <span className={styles.userId}>{userId}</span>
          </li>
        ))}
        {users.length === 0 && (
          <li className={styles.userItem}>
            <span className={styles.userId}>No users connected</span>
          </li>
        )}
      </ul>
    </div>
  );
};

export default ConnectedUsers;
