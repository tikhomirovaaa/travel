import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import CreateTripForm from './CreateTripForm';

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [openCreateTrip, setOpenCreateTrip] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate('/', { state: { refresh: true } });
  };

  return (
    <>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Link to="/" onClick={handleLogoClick} style={{ color: 'white', textDecoration: 'none' }}>
                TravelImpressions
              </Link>
            </Typography>
            
            {token ? (
              <>
                <Button color="inherit" onClick={() => setOpenCreateTrip(true)}>
                  Создать пост
                </Button>
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
      
      <CreateTripForm 
        open={openCreateTrip} 
        handleClose={() => setOpenCreateTrip(false)} 
      />
    </>
  );
}