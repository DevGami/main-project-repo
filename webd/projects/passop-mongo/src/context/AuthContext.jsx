import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, setAuthData, clearAuthData } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('passop_token');
      if (token) {
        try {
          const data = await getMe();
          if (data.success) {
            setUser(data.user);
          } else {
            clearAuthData();
          }
        } catch {
          clearAuthData();
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, []);

  const loginUser = (token, userData, masterKey) => {
    setAuthData(token, masterKey);
    setUser(userData);
  };

  const logoutUser = () => {
    clearAuthData();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
