import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    re_password: '' // Добавьте это поле
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Регистрация</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Имя пользователя"
          fullWidth
          margin="normal"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />
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
        <TextField
          label="Подтвердите пароль"
          type="password"
          fullWidth
          margin="normal"
          value={formData.re_password}
          onChange={(e) => setFormData({ ...formData, re_password: e.target.value })}
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Зарегистрироваться
        </Button>
      </form>
    </Container>
  );
}