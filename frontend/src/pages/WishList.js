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
      console.error('Ошибка загрузки избранного:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить избранное');
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
      const response = await downloadWishlist(selectedTrips, format);
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: format === 'pdf' ? 'application/pdf' : 'text/plain' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `избранное.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setOpenDownloadDialog(false);
    } catch (err) {
      console.error('Ошибка загрузки избранного:', err);
      setError('Не удалось загрузить избранное');
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

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Загрузка вашего избранного...
        </Typography>
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
            to="/trips"
            sx={{ mt: 2 }}
          >
            Посмотреть поездки
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
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component={Link}
                    to={`/trips/${item.trip.id}`}
                    image={item.trip.image ? `http://localhost:8000${item.trip.image}` : '/placeholder.jpg'}
                    height="200"
                    sx={{ objectFit: 'cover' }}
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
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      {item.trip.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      {item.trip.description ? `${item.trip.description.substring(0, 100)}...` : 'Нет описания'}
                    </Typography>
                  </CardContent>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
                    <Checkbox
                      checked={selectedTrips.includes(item.trip.id)}
                      onChange={() => handleSelectTrip(item.trip.id)}
                    />
                    
                    <IconButton 
                      onClick={() => handleRemoveFromWishlist(item.id, item.trip.id)}
                      color="error"
                    >
                      <Bookmark />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
      
      <Dialog open={openDownloadDialog} onClose={() => setOpenDownloadDialog(false)}>
        <DialogTitle>Скачать избранное</DialogTitle>
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