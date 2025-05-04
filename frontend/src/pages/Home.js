import React, { useState, useEffect, useCallback, useContext } from 'react';
import { 
  Container, 
  Typography,  
  Grid, 
  CircularProgress,
  Pagination,
  Box,
  Button,
  Paper,
  TextField,
  Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getTrips, getWishlist } from '../api';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const tripsPerPage = 6;

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      const params = { 
        page,
        search: searchTerm,
        tags: selectedTags.join(',')
      };
      
      const response = await getTrips(params);
      const tripsData = response.data.results || response.data;
      
      // Получаем уникальные теги из всех поездок
      const tags = [...new Set(
        tripsData.flatMap(trip => trip.tags || [])
      )];
      setAvailableTags(tags);
      
      if (user) {
        const wishlistResponse = await getWishlist();
        const wishlistTripIds = wishlistResponse.data.map(item => item.trip.id);
        
        const enhancedTrips = tripsData.map(trip => ({
          ...trip,
          description: trip.description || 'Интересное путешествие',
          in_wishlists: wishlistTripIds.includes(trip.id) 
            ? [{ user: user.id }] 
            : []
        }));
        
        setTrips(enhancedTrips);
      } else {
        setTrips(tripsData);
      }
      
      const totalCount = response.data.count || response.data.length;
      setTotalPages(Math.ceil(totalCount / tripsPerPage));
    } catch (error) {
      console.error('Ошибка при загрузке путешествий:', error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [page, refreshTrigger, user, searchTerm, selectedTags]);

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

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
    setPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
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

      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Поиск по названию или описанию..."
          value={searchTerm}
          onChange={handleSearch}
        />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {availableTags.map(tag => (
            <Chip
              key={tag}
              label={tag}
              clickable
              color={selectedTags.includes(tag) ? 'primary' : 'default'}
              onClick={() => handleTagToggle(tag)}
            />
          ))}
        </Box>
      </Box>

      {user && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button 
            variant="contained" 
            onClick={() => setCreateModalOpen(true)}
          >
            Создать новую поездку
          </Button>
        </Box>
      )}

      {!user && (
        <Paper elevation={3} sx={{ p: 4, mb: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Присоединяйтесь к нашему сообществу путешественников!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Зарегистрируйтесь, чтобы сохранять понравившиеся поездки и создавать свои собственные маршруты.
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
                  <TripCard 
                    trip={trip} 
                    onDelete={fetchTrips}
                  />
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