import React from 'react'
import { useNavigate } from 'react-router-dom'
import B2BButton from './B2BButton'
import { IconMoodSad, IconSearch } from '@tabler/icons-react'

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      textAlign: 'center',
      padding: '20px',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating circles background */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'var(--header-bg)',
        opacity: '0.05',
        borderRadius: '50%',
        top: '-100px',
        right: '-100px',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        width: '200px',
        height: '200px',
        background: 'var(--header-bg)',
        opacity: '0.05',
        borderRadius: '50%',
        bottom: '-50px',
        left: '-50px',
        animation: 'float 8s ease-in-out infinite reverse'
      }} />

      <div style={{ maxWidth: '600px', position: 'relative', zIndex: 1 }}>
        {/* Icon with pulse animation */}
        <div style={{
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            animation: 'pulse 2s ease-in-out infinite',
            color: 'var(--header-bg)'
          }}>
            <IconMoodSad size={80} stroke={1.5} />
          </div>
          <div style={{
            animation: 'swing 2s ease-in-out infinite',
            color: '#666'
          }}>
            <IconSearch size={50} stroke={1.5} />
          </div>
        </div>

        {/* 404 with glitch effect */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
          <h1 style={{
            fontSize: '100px',
            fontWeight: '900',
            color: 'var(--header-bg)',
            margin: '0',
            lineHeight: '1',
            animation: 'glitch 3s infinite',
            textShadow: '2px 2px 0px rgba(7, 128, 178, 0.3)'
          }}>
            404
          </h1>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h2 style={{
            fontSize: '28px',
            color: '#333',
            margin: '0 0 15px 0',
            fontWeight: '700'
          }}>
            Oops! Page Not Found
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#666',
            lineHeight: '1.8',
            margin: '0 auto 35px auto',
            maxWidth: '480px'
          }}>
            The page you're searching for seems to have wandered off into the digital wilderness. Let's get you back on track!
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          marginTop: '25px'
        }}>
          <B2BButton
            name="Go Back"
            variant="filled"
            color="var(--header-bg)"
            size="md"
            radius="md"
            onClick={() => navigate(-1)}
          />
          <B2BButton
            name="Login"
            variant="outline"
            color="var(--header-bg)"
            size="md"
            radius="md"
            onClick={() => navigate('/')}
          />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { 
              transform: scale(1);
              opacity: 1;
            }
            50% { 
              transform: scale(1.1);
              opacity: 0.8;
            }
          }

          @keyframes swing {
            0%, 100% { 
              transform: rotate(0deg);
            }
            25% { 
              transform: rotate(15deg);
            }
            75% { 
              transform: rotate(-15deg);
            }
          }

          @keyframes glitch {
            0%, 90%, 100% {
              transform: translateX(0);
            }
            92% {
              transform: translateX(-2px);
            }
            94% {
              transform: translateX(2px);
            }
            96% {
              transform: translateX(-2px);
            }
            98% {
              transform: translateX(2px);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0) translateX(0);
            }
            50% {
              transform: translateY(-20px) translateX(10px);
            }
          }
        ` }} />
    </div>
  )
}

export default NotFound