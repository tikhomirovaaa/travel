import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography,  
  Grid, 
  CircularProgress,
  Pagination,
  Box,
  Button,
  Paper
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getTrips, addToWishlist } from '../api';
import TripCard from '../components/TripCard';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, authChecked } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const tripsPerPage = 6;

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const response = await getTrips({ page });
        setTrips(response.data.results || []);
        setTotalPages(Math.ceil(response.data.count / tripsPerPage));
      } catch (error) {
        console.error('Ошибка при загрузке путешествий:', error);
      } finally {
        setLoading(false);
      }
    };

    if (authChecked) {
      fetchTrips();
    }
  }, [page, authChecked]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleAddToWishlist = async (tripId) => {
    try {
      await addToWishlist(tripId);
      alert('Путешествие добавлено в ваш список желаний!');
    } catch (error) {
      console.error('Ошибка при добавлении в список желаний:', error);
      alert('Для добавления в список желаний необходимо авторизоваться');
    }
  };

  if (!authChecked) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold',
          color: 'primary.main',
          textAlign: 'center',
          mb: 4
        }}
      >
        Последние путешествия
      </Typography>

      {!user && (
        <Paper elevation={3} sx={{ p: 4, mb: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Присоединяйтесь к нашему сообществу путешественников!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Зарегистрируйтесь, чтобы сохранять понравившиеся путешествия и создавать свои собственные маршруты.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              component={Link} 
              to="/register"
              size="large"
            >
              Зарегистрироваться
            </Button>
            <Button 
              variant="outlined" 
              component={Link} 
              to="/login"
              size="large"
            >
              Войти
            </Button>
          </Box>
        </Paper>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          <Grid container spacing={4}>
            {trips.map(trip => (
              <Grid item xs={12} sm={6} md={4} key={trip.id}>
                <TripCard 
                  trip={trip} 
                  onAddToWishlist={user ? handleAddToWishlist : null}
                />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}