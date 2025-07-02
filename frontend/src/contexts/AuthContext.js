import React, { createContext, useState, useEffect } from 'react';
import { getToken } from '../utils/auth';

export const AuthContext = createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => {}
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!getToken());
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
