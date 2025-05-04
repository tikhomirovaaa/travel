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
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getWishlist, removeFromWishlist, downloadWishlist } from '../api';
import { Bookmark } from '@mui/icons-material';

export default function WishList() {
  const { user, authChecked } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getWishlist();
      // Добавляем проверку на наличие данных
      const validatedWishlist = response.data.map(item => ({
        ...item,
        trip: {
          ...item.trip,
          author: item.trip.author || { username: 'Неизвестный пользователь' }
        }
      }));
      setWishlist(validatedWishlist);
    } catch (err) {
      console.error('Ошибка загрузки избранного:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить избранное');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrip = (tripId, isSelected) => {
    setSelectedTrips(prev => 
      isSelected 
        ? [...prev, tripId] 
        : prev.filter(id => id !== tripId)
    );
  };

  const handleRemoveFromWishlist = async (wishlistId, tripId) => {
    try {
      await removeFromWishlist(wishlistId);
      setWishlist(prev => prev.filter(item => item.id !== wishlistId));
      setSelectedTrips(prev => prev.filter(id => id !== tripId));
    } catch (err) {
      console.error('Ошибка удаления из избранного:', err);
      setError('Не удалось удалить из избранного');
    }
  };

  const handleDownload = async () => {
    try {
      if (selectedTrips.length === 0) {
        setError('Выберите хотя бы одну поездку для скачивания');
        return;
      }
      
      const response = await downloadWishlist(selectedTrips, format);
      
      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'text/plain'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `wishlist.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setOpenDownloadDialog(false);
    } catch (err) {
      console.error('Ошибка загрузки избранного:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить избранное');
    }
  };

  useEffect(() => {
    if (authChecked && user) {
      fetchWishlist();
    }
  }, [authChecked, user]);

  if (!authChecked || loading) {
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
          Войдите, чтобы просмотреть избранное
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

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Мое избранное</Typography>
      
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
            Ваше избранное пусто
          </Typography>
          <Button 
            variant="contained" 
            component={Link} 
            to="/"
            sx={{ mt: 2 }}
          >
            Посмотреть поездки
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body1">
              Выбрано: {selectedTrips.length} из {wishlist.length}
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              disabled={selectedTrips.length === 0}
              onClick={() => setOpenDownloadDialog(true)}
            >
              Скачать выбранное
            </Button>
          </Box>
          
          <Grid container spacing={4}>
            {wishlist.map(item => {
              // Добавляем защитные проверки
              const trip = item.trip || {};
              const author = trip.author || { username: 'Неизвестный пользователь' };
              const imageUrl = trip.image ? `http://localhost:8000${trip.image}` : '/placeholder.jpg';
              const description = trip.description || 'Нет описания';
              const shortDescription = description.length > 100 
                ? `${description.substring(0, 100)}...` 
                : description;

              return (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component={Link}
                      to={`/trips/${trip.id}`}
                      image={imageUrl}
                      height="200"
                      sx={{ objectFit: 'cover' }}
                    />
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography 
                        gutterBottom 
                        variant="h5" 
                        component={Link} 
                        to={`/trips/${trip.id}`}
                        sx={{ 
                          textDecoration: 'none', 
                          color: 'inherit',
                          '&:hover': { color: 'primary.main' }
                        }}
                      >
                        {trip.title || 'Без названия'}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {shortDescription}
                      </Typography>
                      
                      <Typography variant="caption" color="text.secondary">
                        Автор: {author.username}
                      </Typography>
                    </CardContent>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
                      <Checkbox
                        checked={selectedTrips.includes(trip.id)}
                        onChange={(e) => handleSelectTrip(trip.id, e.target.checked)}
                      />
                      
                      <IconButton 
                        onClick={() => handleRemoveFromWishlist(item.id, trip.id)}
                        color="error"
                      >
                        <Bookmark />
                      </IconButton>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}
      
      <Dialog open={openDownloadDialog} onClose={() => setOpenDownloadDialog(false)}>
        <DialogTitle>Скачать избранное</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body1">
              Выбрано постов: {selectedTrips.length}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button 
                variant={format === 'pdf' ? 'contained' : 'outlined'}
                onClick={() => setFormat('pdf')}
              >
                PDF
              </Button>
              <Button 
                variant={format === 'txt' ? 'contained' : 'outlined'}
                onClick={() => setFormat('txt')}
              >
                Текстовый файл
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDownloadDialog(false)}>Отмена</Button>
          <Button onClick={handleDownload} variant="contained">Скачать</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}