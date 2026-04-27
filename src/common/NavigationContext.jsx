import { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// Create a context for navigation
const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
    const navigate = useNavigate();
    return (
        <NavigationContext.Provider value={navigate}>
            {children}
        </NavigationContext.Provider>
    );
};

// Custom hook to use navigation globally
export const useGlobalNavigate = () => {
    return useContext(NavigationContext);
};
