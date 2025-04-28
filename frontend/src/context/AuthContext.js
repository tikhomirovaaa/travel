// src/context/AuthContext.js
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { getCurrentUser } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await getCurrentUser();
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (credentials) => {
    const response = await axios.post('http://localhost:8000/api/auth/token/login/', credentials);
    localStorage.setItem('token', response.data.auth_token);
    const userResponse = await getCurrentUser();
    setUser(userResponse.data);
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:8000/api/auth/token/logout/', {}, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` }
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Добавляем хук useAuth для удобного использования контекста
export const useAuth = () => {
  return useContext(AuthContext);
};