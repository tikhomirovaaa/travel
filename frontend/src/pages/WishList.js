import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Box,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getWishlist, removeFromWishlist, downloadWishlist } from '../api';

export default function WishList() {
  const { user, authChecked } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authChecked && user) {
      fetchWishlist();
    } else if (authChecked) {
      setLoading(false);
    }
  }, [user, authChecked]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getWishlist();
      setWishlist(response.data);
    } catch (err) {
      console.error('Ошибка загрузки списка:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить список');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrip = (tripId) => {
    setSelectedTrips(prev => 
      prev.includes(tripId) 
        ? prev.filter(id => id !== tripId) 
        : [...prev, tripId]
    );
  };

  const handleRemoveFromWishlist = async (wishlistId) => {
    try {
      await removeFromWishlist(wishlistId);
      setWishlist(prev => prev.filter(item => item.id !== wishlistId));
      setSelectedTrips(prev => prev.filter(id => id !== wishlistId));
    } catch (err) {
      console.error('Ошибка удаления:', err);
      setError('Не удалось удалить из списка');
    }
  };

  const handleDownload = async () => {
    try {
      const response = await downloadWishlist(selectedTrips, format);
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: format === 'pdf' ? 'application/pdf' : 'text/plain' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `wishlist.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setOpenDownloadDialog(false);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      setError('Не удалось скачать список');
    }
  };

  if (!authChecked) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Пожалуйста, войдите в систему, чтобы просмотреть свой список желаний
        </Typography>
        <Button 
          variant="contained" 
          component={Link} 
          to="/login"
          sx={{ mt: 2 }}
        >
          Войти
        </Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Загрузка вашего списка...
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Мой список желаний</Typography>
      
      {error && (
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
      )}
      
      {wishlist.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Вы пока еще ничего не добавляли в список желаний
          </Typography>
          <Button 
            variant="contained" 
            component={Link} 
            to="/trips"
            sx={{ mt: 2 }}
          >
            Посмотреть путешествия
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button 
              variant="contained" 
              color="primary"
              disabled={selectedTrips.length === 0}
              onClick={() => setOpenDownloadDialog(true)}
            >
              Скачать выбранное ({selectedTrips.length})
            </Button>
          </Box>
          
          <Grid container spacing={4}>
            {wishlist.map(item => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <Checkbox
                    checked={selectedTrips.includes(item.trip.id)}
                    onChange={() => handleSelectTrip(item.trip.id)}
                    sx={{ position: 'absolute', zIndex: 1, right: 8, top: 8 }}
                  />
                  
                  <CardMedia
                    component={Link}
                    to={`/trips/${item.trip.id}`}
                    image={item.trip.image ? `http://localhost:8000${item.trip.image}` : '/placeholder.jpg'}
                    height="200"
                  />
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                      gutterBottom 
                      variant="h5" 
                      component={Link} 
                      to={`/trips/${item.trip.id}`}
                      sx={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        '&:hover': { color: 'primary.main' },
                        display: 'block'
                      }}
                    >
                      {item.trip.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.notes || 'Нет заметок'}
                    </Typography>
                  </CardContent>
                  
                  <Button 
                    variant="outlined" 
                    color="error"
                    sx={{ m: 2 }}
                    onClick={() => handleRemoveFromWishlist(item.id)}
                  >
                    Удалить из списка
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
      
      <Dialog open={openDownloadDialog} onClose={() => setOpenDownloadDialog(false)}>
        <DialogTitle>Скачать список желаний</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Checkbox 
                checked={format === 'pdf'} 
                onChange={() => setFormat('pdf')} 
              />
            }
            label="PDF"
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={format === 'txt'} 
                onChange={() => setFormat('txt')} 
              />
            }
            label="Текстовый файл"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDownloadDialog(false)}>Отмена</Button>
          <Button onClick={handleDownload} variant="contained">Скачать</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}