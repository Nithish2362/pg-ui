// LoaderContext.js
import { createContext, useContext, useRef, useState } from 'react';

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const loadingCountRef = useRef(0);
    let hideTimeOut = useRef(null)

    const showLoader = () => {
      loadingCountRef.current +=1;
      if(hideTimeOut.current){
        clearTimeout(hideTimeOut.current);
        hideTimeOut.current = null;
      }
      setIsLoading(true)
    };

    const hideLoader = () => {
        loadingCountRef.current = Math.max(0,loadingCountRef.current -1);
      if(loadingCountRef.current ===0){
        hideTimeOut.current = setTimeout(()=>{
            setIsLoading(false);
            hideTimeOut.current = null;
        },200)
      }
    };

    return (
        <LoaderContext.Provider value={{
            isLoading: isLoading,
            showLoader,
            hideLoader
        }}>
            {children}
        </LoaderContext.Provider>
    );
};

export const useLoader = () => useContext(LoaderContext);