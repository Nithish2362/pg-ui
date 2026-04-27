import React, { useState, useEffect, useRef } from 'react';
import { createB2BAPI } from '../api/Interceptor';
import { useDisclosure } from '@mantine/hooks';
import B2BButton from './B2BButton';
import { Modal } from '@mantine/core';

const BarcodeScanner = ({ url, setResponse }) => {
    const inputFieldRef = useRef(null);
    const B2B_API = createB2BAPI();

    const [visible, { open, close }] = useDisclosure(false);
    useEffect(() => {
        let input = "";
        if (inputFieldRef.current) {
            inputFieldRef.current.focus();
        }
        const handleKeyDown = (event) => {
            if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
                return;
            }

            if (/^[a-zA-Z0-9]$/.test(event.key)) {
                input += event.key;
            }

            if (event.key === 'Enter') {
                scanBarcode(input);
                input = "";
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
    const scanBarcode = async (input) => {
        try {
            const res = await B2B_API.get(`${url}/${input}`).json();
            const response = res.response;
            setResponse(response);
            console.log("Barcode scanned successfully:", response);
        } catch (error) {
            console.error("Error scanning barcode:", error);
            open();
        }
    };

    return (
        <div>
            <input ref={inputFieldRef}
                type="text"
                style={{
                    opacity: 0,
                    position: 'absolute',
                    top: '-9999px',
                }}
                readOnly />
                    <> <Modal opened={visible} onClose={close} title={<span style={{ fontWeight: "bold", fontSize: '20px' }}>{''}</span>} size={"30%"}>
                            <div className='modal_content'>
                              Invalid Barcode Scanned
                            </div>
                            <div className='modal_btn'>
                                <B2BButton
                                    name={"Close"}
                                    onClick={() => close()} />
                            </div>
                        </Modal></>
        </div>
    );
};

export default BarcodeScanner;