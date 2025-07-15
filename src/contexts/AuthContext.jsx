import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere usato all\'interno di AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Credenziali - IN PRODUZIONE USA ENVIRONMENT VARIABLES
  const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'boostami2024';

  useEffect(() => {
    // Verifica se l'utente è già autenticato
    const authToken = localStorage.getItem('boostami-auth');
    const authExpiry = localStorage.getItem('boostami-auth-expiry');
    
    if (authToken && authExpiry) {
      const now = new Date().getTime();
      const expiryTime = parseInt(authExpiry);
      
      if (now < expiryTime) {
        setIsAuthenticated(true);
      } else {
        // Token scaduto
        localStorage.removeItem('boostami-auth');
        localStorage.removeItem('boostami-auth-expiry');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (username, password) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const now = new Date().getTime();
      const expiryTime = now + (24 * 60 * 60 * 1000); // 24 ore
      
      localStorage.setItem('boostami-auth', 'authenticated');
      localStorage.setItem('boostami-auth-expiry', expiryTime.toString());
      
      setIsAuthenticated(true);
      return { success: true, message: 'Login effettuato con successo!' };
    } else {
      return { success: false, message: 'Credenziali non valide.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('boostami-auth');
    localStorage.removeItem('boostami-auth-expiry');
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
