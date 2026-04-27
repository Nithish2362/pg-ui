import React from 'react';
import { Modal, Button } from '@mantine/core';
import './CustomPopup.css'; 

const CustomPopup = ({ onLogout }) => {
  return (
    <Modal 
      opened={true} 
      onClose={() => {}} 
      title="Session Expired" 
      centered
      classNames={{
        overlay: 'custom-popup-overlay',
        modal: 'custom-popup-content'
      }}
    >
      <p>You have been inactive for a while. Your session has expired. Please log in again.</p>
      <Button className='custom-popup-button' onClick={onLogout} color={"var(--primary)"}>Sign In</Button>
    </Modal>
  );
};

export default CustomPopup;
