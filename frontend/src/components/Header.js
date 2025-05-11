import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container,
  IconButton 
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import CreateTripForm from './CreateTripForm';
import { AccountCircle } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Brightness4, Brightness7 } from '@mui/icons-material';

export default function Header({ toggleColorMode, mode }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openCreateTrip, setOpenCreateTrip] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate('/', { state: { refresh: true } });
  };

  const token = localStorage.getItem('token');

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
            
            <IconButton onClick={toggleColorMode} color="inherit" sx={{ mr: 2 }}>
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            
            {token ? (
              <>
                <Button color="inherit" onClick={() => setOpenCreateTrip(true)}>
                  Создать пост
                </Button>
                <Button color="inherit" component={Link} to="/wishlist">
                  Избранное
                </Button>
                <Button color="inherit" component={Link} to="/subscriptions">
                  Подписки
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to={`/profile/${user?.username}`}
                  startIcon={<AccountCircle />}
                >
                  Профиль
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