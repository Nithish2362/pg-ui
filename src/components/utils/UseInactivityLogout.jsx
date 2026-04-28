import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UseInactivityLogout = (timeout = 3000000) => { 
  const navigate = useNavigate();
  const [isPopupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    let inactivityTimeoutId;
    let popupTimeoutId;

    const handleActivity = () => {
      clearTimeout(inactivityTimeoutId);
      clearTimeout(popupTimeoutId);

      if (isPopupVisible) {
        popupTimeoutId = setTimeout(() => {
          setPopupVisible(false);
        }, 30000);
      } else {
        
        inactivityTimeoutId = setTimeout(() => {
         localStorage.clear();
          setPopupVisible(true);
        }, timeout);
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    handleActivity(); 

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      clearTimeout(inactivityTimeoutId);
      clearTimeout(popupTimeoutId);
    };
  }, [navigate, timeout, isPopupVisible]);

  const handleLogout = () => {
    setPopupVisible(false);
    localStorage.clear();
    navigate('/');
  };

  return { isPopupVisible,  handleLogout };
};

export default UseInactivityLogout;
