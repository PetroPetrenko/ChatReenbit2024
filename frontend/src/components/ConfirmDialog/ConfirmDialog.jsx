import React from 'react';
import PropTypes from 'prop-types';
import styles from './ConfirmDialog.module.css';
import buttonStyles from '../../styles/buttons.module.css';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttons}>
          <button
            className={`${buttonStyles.button} ${buttonStyles.secondary}`}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className={`${buttonStyles.button} ${buttonStyles.danger}`}
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ConfirmDialog;
