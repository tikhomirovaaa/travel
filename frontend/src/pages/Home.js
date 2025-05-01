import React, { useEffect, useState, useCallback } from 'react';
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
import { getTrips } from '../api';
import TripCard from '../components/TripCard';
import { useAuth } from '../context/AuthContext';
import CreateTripForm from '../components/CreateTripForm';

export default function Home() {
  const { user, authChecked } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  const tripsPerPage = 6;

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getTrips({ page });
      
      // Изменение здесь - работаем с массивом напрямую, если нет results
      const tripsData = response.data.results || response.data;
      const totalCount = response.data.count || response.data.length;
      
      setTrips(tripsData);
      setTotalPages(Math.ceil(totalCount / tripsPerPage));
    } catch (error) {
      console.error('Ошибка при загрузке путешествий:', error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [page, refreshTrigger]);

  useEffect(() => {
    if (authChecked) {
      fetchTrips();
    }
  }, [page, authChecked, fetchTrips]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleNewTripCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setPage(1);
    setCreateModalOpen(false);
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
        Путешествия
      </Typography>

      {user && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button 
            variant="contained" 
            onClick={() => setCreateModalOpen(true)}
          >
            Создать новое путешествие
          </Button>
        </Box>
      )}

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
            {trips.length > 0 ? (
              trips.map(trip => (
                <Grid item xs={12} sm={6} md={4} key={trip.id}>
                  <TripCard trip={trip} onDelete={fetchTrips} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="h6" textAlign="center">
                  Пока нет путешествий. Будьте первым!
                </Typography>
              </Grid>
            )}
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

      <CreateTripForm 
        open={createModalOpen}
        handleClose={() => setCreateModalOpen(false)}
        onTripCreated={handleNewTripCreated}
      />
    </Container>
  );
}