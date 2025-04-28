import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { getCurrentUser } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        axios.defaults.headers.common['Authorization'] = `Token ${token}`;
        const response = await getCurrentUser();
        setUser(response.data);
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
    }
    setAuthChecked(true);
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/token/login/', credentials);
      localStorage.setItem('token', response.data.auth_token);
      axios.defaults.headers.common['Authorization'] = `Token ${response.data.auth_token}`;
      const userResponse = await getCurrentUser();
      setUser(userResponse.data);
      window.location.reload();
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.response?.data };
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:8000/api/auth/token/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      authChecked,
      login, 
      logout,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);