import React from 'react';
import { useMessage } from '../../context/MessageContext';
import './GlobalMessage.css';

const GlobalMessage = () => {
  const { message, hideMessage } = useMessage();

  // If there's no message, render nothing
  if (!message) {
    return null;
  }

  // Determine the CSS class based on the message type ('success' or 'error')
  const messageTypeClass = message.type === 'error' ? 'error' : 'success';

  return (
    <div className={`global-message-container ${messageTypeClass}`}>
      <p>{message.text}</p>
      <button onClick={hideMessage} className="close-btn">&times;</button>
    </div>
  );
};

export default GlobalMessage;
