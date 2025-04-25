import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import { login } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(formData);
      localStorage.setItem('token', res.data.auth_token);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Вход</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <TextField
          label="Пароль"
          type="password"
          fullWidth
          margin="normal"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Войти
        </Button>
      </form>
    </Container>
  );
}