import React, { useEffect } from 'react';
import { useLoader } from './LoaderContext';
import { Overlay, Center, Stack } from '@mantine/core';
import './GlobalLoader.css';

const GlobalLoader = () => {
    const { isLoading } = useLoader();

    useEffect(() => {
        if (isLoading) {
            document.body.style.overflow = 'hidden';
            document.body.style.scrollbarGutter = 'stable';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.scrollbarGutter = 'auto';
        }
    }, [isLoading]);

    if (!isLoading) return null;

    return (
        <Overlay
            fixed
            zIndex={2000}
            opacity={0.9}
            color="#fff"
        >
            <Center style={{ height: '100vh' }}>
                <Stack align="center" gap="md">
                    <div className="loader"></div>
                </Stack>
            </Center>
        </Overlay>
    );
};

export default GlobalLoader;
