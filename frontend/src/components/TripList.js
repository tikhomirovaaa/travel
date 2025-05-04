import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  TextField, 
  Chip, 
  Box, 
  CircularProgress,
  Typography
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import TripCard from '../components/TripCard';
import { searchTripsByTag, getTrips } from '../api';

export default function TripList() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTag, setSearchTag] = useState('');
  const location = useLocation();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        let response;
        
        if (searchTag) {
          response = await searchTripsByTag(searchTag);
        } else {
          response = await getTrips();
        }
        
        setTrips(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Не удалось загрузить поездки');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrips();
  }, [searchTag, location.key]);

  const handleTagClick = (tag) => {
    setSearchTag(tag);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <TextField
        fullWidth
        label="Поиск по тегам"
        variant="outlined"
        value={searchTag}
        onChange={(e) => setSearchTag(e.target.value)}
        sx={{ mb: 3 }}
      />
      
      {trips.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {trips[0].tags.map(tag => (
            <Chip
              key={tag}
              label={tag}
              onClick={() => handleTagClick(tag)}
              sx={{ mr: 1, mb: 1 }}
              color={searchTag === tag ? 'primary' : 'default'}
            />
          ))}
        </Box>
      )}
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Grid container spacing={4}>
        {trips.map(trip => (
          <Grid item xs={12} sm={6} md={4} key={trip.id}>
            <TripCard trip={trip} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}