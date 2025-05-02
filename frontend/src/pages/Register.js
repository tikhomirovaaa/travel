// Register.jsx
import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    re_password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Регистрация пользователя
      await registerUser(formData);
      
      // 2. Автоматический вход после регистрации
      const { success, error } = await login({
        email: formData.email,
        password: formData.password
      });

      if (success) {
        navigate('/');
        window.location.reload();
      } else {
        setError(error || 'Регистрация успешна, но вход не выполнен');
      }
    } catch (err) {
      setError(err.response?.data || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Регистрация</Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Имя пользователя"
          fullWidth
          margin="normal"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <TextField
          label="Пароль"
          type="password"
          fullWidth
          margin="normal"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <TextField
          label="Подтвердите пароль"
          type="password"
          fullWidth
          margin="normal"
          value={formData.re_password}
          onChange={(e) => setFormData({ ...formData, re_password: e.target.value })}
          required
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </Button>
      </form>
    </Container>
  );
}