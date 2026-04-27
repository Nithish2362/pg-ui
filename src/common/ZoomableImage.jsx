import React, { useEffect, useState } from 'react';

const ZoomableImage = ({ src, alt, thumbnailStyle, label, labelStyle }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

    const closeModal = () => {
        setIsModalOpen(false);
        setIsZoomed(false);
        setZoomOrigin({ x: 50, y: 50 });
    };

    const handleImageClick = (e) => {
        e.stopPropagation();
        if (!isZoomed) {

            const rect = e.target.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            setZoomOrigin({ x, y });
        }
        setIsZoomed(!isZoomed);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isModalOpen) {
                closeModal();
            }
        };

        if (isModalOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isModalOpen]);
    return (
        <>
            {/* Thumbnail View */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {label && (
                    <div style={{ marginBottom: '4px', fontSize: '14px', fontWeight: 'bold', ...labelStyle }}>
                        {label}
                    </div>
                )}
                <div
                    onClick={() => setIsModalOpen(true)}
                    style={{ cursor: 'zoom-in', display: 'inline-block' }}
                >
                    <img src={src} alt={alt || label || 'Image'} style={thumbnailStyle} />
                </div>
            </div>

            {/* Full Screen Modal */}
            {isModalOpen && (
                <div
                    onClick={closeModal}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, width: '100vw', height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        zIndex: 10000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}
                >
                    <button
                        onClick={closeModal}
                        style={{
                            position: 'absolute', top: '20px', right: '20px',
                            background: 'none', border: 'none', color: 'white',
                            fontSize: '40px', cursor: 'pointer', zIndex: 10001
                        }}
                    >
                        &times;
                    </button>

                    <div
                        style={{
                            width: '100%', height: '100%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: isZoomed ? 'auto' : 'hidden',
                        }}
                    >
                        <img
                            src={src}
                            alt={alt || label || 'Full View'}
                            onClick={handleImageClick}
                            style={{
                                maxWidth: isZoomed ? 'unset' : '90%',
                                maxHeight: isZoomed ? 'unset' : '90%',
                                transform: isZoomed ? 'scale(2.5)' : 'scale(1)',
                                transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                                transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default ZoomableImage;