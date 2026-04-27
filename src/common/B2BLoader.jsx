import { Box, LoadingOverlay } from '@mantine/core';
import React from 'react';

const B2BLoader = ({ open }) => {

    return (
        <>
            <div>
                <LoadingOverlay visible={open} overlayProps={{ radius: "sm", blur: 2 }} />
            </div>
        </>
    );
}

export default B2BLoader