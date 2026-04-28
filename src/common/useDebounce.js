import { useState, useEffect } from "react";

/**
 * Custom hook for debounced value
 * @param {string} value - The value to debounce (usually search input)
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {string} debouncedValue
 */
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to clear timeout if value changes before delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;