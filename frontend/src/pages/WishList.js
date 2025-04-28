import React, { useState, useEffect, useContext } from 'react';
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
  CircularProgress
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function WishList() {
  const { user } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/wishlist/', {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` }
      });
      setWishlist(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrip = (tripId) => {
    if (selectedTrips.includes(tripId)) {
      setSelectedTrips(selectedTrips.filter(id => id !== tripId));
    } else {
      setSelectedTrips([...selectedTrips, tripId]);
    }
  };

  const handleRemoveFromWishlist = async (wishlistId) => {
    try {
      await axios.delete(`http://localhost:8000/api/wishlist/${wishlistId}/`, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` }
      });
      setWishlist(wishlist.filter(item => item.id !== wishlistId));
      setSelectedTrips(selectedTrips.filter(id => id !== wishlistId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/wishlist/download/',
        { trip_ids: selectedTrips, format },
        {
          headers: { Authorization: `Token ${localStorage.getItem('token')}` },
          responseType: format === 'pdf' ? 'blob' : 'text'
        }
      );

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
    } catch (error) {
      console.error('Error downloading wishlist:', error);
    }
  };

  if (!user) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5">
          Пожалуйста, войдите в систему, чтобы просмотреть свой список желаний
        </Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Мой список желаний</Typography>
      
      {wishlist.length === 0 ? (
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
          Ваш список желаний пуст
        </Typography>
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
                  <Checkbox
                    checked={selectedTrips.includes(item.trip.id)}
                    onChange={() => handleSelectTrip(item.trip.id)}
                    sx={{ position: 'absolute', zIndex: 1 }}
                  />
                  
                  <CardMedia
                    component={Link}
                    to={`/trips/${item.trip.id}`}
                    image={`http://localhost:8000${item.trip.image}`}
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
                        '&:hover': { color: 'primary.main' }
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