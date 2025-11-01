// src/hooks/useHydration.js
import { useState, useEffect } from 'react';

export const useHydration = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
};

export const useClientOnly = (callback, deps = []) => {
  const isHydrated = useHydration();
  
  useEffect(() => {
    if (isHydrated && callback) {
      callback();
    }
  }, [isHydrated, callback, ...deps]);

  return isHydrated;
};

// Hook to safely access browser APIs
export const useBrowserAPI = (apiCallback, fallbackValue = null) => {
  const [value, setValue] = useState(fallbackValue);
  const isHydrated = useHydration();

  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined' && apiCallback) {
      try {
        const result = apiCallback();
        setValue(result);
      } catch (error) {
        console.warn('Browser API call failed:', error);
      }
    }
  }, [isHydrated, apiCallback]);

  return value;
};
