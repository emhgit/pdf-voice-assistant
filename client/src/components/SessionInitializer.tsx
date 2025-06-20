import { useEffect } from 'react';

export const SessionInitializer = () => {
  useEffect(() => {
    const token = localStorage.getItem('sessionToken');
    if (token) {
      // Optionally preload critical state here using fetch hooks
    }
  }, []);

  return null; // No UI; just logic
};
