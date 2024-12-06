import React from 'react';
import { toast } from 'react-toastify';
import styles from './AutoSendToggle.module.css';

const AutoSendToggle = ({ enabled, onToggle }) => {
  const handleToggle = () => {
    onToggle(!enabled);
    if (!enabled) {
      toast.success('Auto-send enabled');
    } else {
      toast.warning('Auto-send disabled');
    }
  };

  return (
    <div className={styles.toggleContainer}>
      <button
        className={`${styles.toggle} ${enabled ? styles.enabled : styles.disabled}`}
        onClick={handleToggle}
        aria-label="Toggle auto-send"
      >
        <div className={styles.indicator} />
      </button>
      <span className={styles.label}>
        {enabled ? 'Auto-send ON' : 'Auto-send OFF'}
      </span>
    </div>
  );
};

export default AutoSendToggle;
