import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container,
  IconButton,
  Tooltip,
  Box
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import CreateTripForm from './CreateTripForm';
import { 
  AccountCircle, 
  Brightness4, 
  Brightness7 
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Header({ darkMode, toggleDarkMode }) {
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
      <AppBar position="static" elevation={0}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                fontWeight: 700,
                letterSpacing: 1
              }}
            >
              <Link 
                to="/" 
                onClick={handleLogoClick} 
                style={{ 
                  color: 'inherit', 
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                TravelImpressions
              </Link>
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1
            }}>
              <Tooltip title={darkMode ? 'Светлая тема' : 'Темная тема'}>
                <IconButton 
                  onClick={toggleDarkMode} 
                  color="inherit"
                  sx={{ ml: 1 }}
                >
                  {darkMode ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
              </Tooltip>
              
              {token ? (
                <>
                  <Button 
                    color="inherit" 
                    onClick={() => setOpenCreateTrip(true)}
                    sx={{ textTransform: 'none' }}
                  >
                    Создать пост
                  </Button>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/wishlist"
                    sx={{ textTransform: 'none' }}
                  >
                    Избранное
                  </Button>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/subscriptions"
                    sx={{ textTransform: 'none' }}
                  >
                    Подписки
                  </Button>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to={`/profile/${user?.username}`}
                    startIcon={<AccountCircle />}
                    sx={{ textTransform: 'none' }}
                  >
                    Профиль
                  </Button>
                  <Button 
                    color="inherit" 
                    onClick={handleLogout}
                    sx={{ textTransform: 'none' }}
                  >
                    Выйти
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/login"
                    sx={{ textTransform: 'none' }}
                  >
                    Вход
                  </Button>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/register"
                    sx={{ textTransform: 'none' }}
                  >
                    Регистрация
                  </Button>
                </>
              )}
            </Box>
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