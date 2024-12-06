import React, { useState } from 'react';
import styles from './ChatDialog.module.css';
import buttonStyles from '../../styles/buttons.module.css';
import Modal from '../Modal/Modal';
import PropTypes from 'prop-types';

const ChatDialog = ({ chat, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: chat ? chat.firstName : '',
    lastName: chat ? chat.lastName : ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={chat ? 'Edit Chat' : 'Create New Chat'}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter first name"
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter last name"
            className={styles.input}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={onClose}
            className={`${buttonStyles.button} ${buttonStyles.secondary}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${buttonStyles.button} ${buttonStyles.primary}`}
          >
            {chat ? 'Save Changes' : 'Create Chat'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

ChatDialog.propTypes = {
  chat: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ChatDialog;
