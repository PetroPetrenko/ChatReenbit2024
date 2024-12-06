import React from 'react';
import PropTypes from 'prop-types';

const DeleteChatDialog = ({ show, handleClose, handleDelete }) => {
  if (!show) return null;

  const handleConfirmDelete = () => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      handleDelete();
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={handleClose}>&times;</span>
        <h2>Delete Chat</h2>
        <p>Are you sure you want to delete this chat?</p>
        <button onClick={handleConfirmDelete}>Delete</button>
        <button onClick={handleClose}>Cancel</button>
      </div>
    </div>
  );
};

DeleteChatDialog.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
};

export default DeleteChatDialog;
