import { Modal } from '@mantine/core';
import React from 'react';

const B2BModal = ({ opened, close, children, title, styles, size }) => {

    return (
        <Modal styles={{ ...styles }} size={size} opened={opened} onClose={close} title={title} centered>
            {children}
        </Modal>
    );
};

export default B2BModal;
