import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
              TravelImpressions
            </Link>
          </Typography>
          
          {token ? (
            <>
              <Button color="inherit" component={Link} to="/wishlist">
                Мой список
              </Button>
              <Button color="inherit" component={Link} to="/subscriptions">
                Подписки
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Вход
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Регистрация
              </Button>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}