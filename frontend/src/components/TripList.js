import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  TextField, 
  Chip, 
  Box, 
  CircularProgress,
  Typography,
  Divider
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import TripCard from '../components/TripCard';
import { searchTripsByTag, getTrips } from '../api';

export default function TripList() {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTag, setSearchTag] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
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
        filterTrips(response.data, selectedTags);
      } catch (err) {
        setError(err.response?.data?.detail || 'Не удалось загрузить поездки');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrips();
  }, [searchTag, location.key, selectedTags]);

  const filterTrips = (tripsList, tags) => {
    if (tags.length === 0) {
      setFilteredTrips(tripsList);
      return;
    }

    const filtered = tripsList.filter(trip => 
      tags.some(tag => trip.tags.includes(tag))
    );
    
    const rest = tripsList.filter(trip => 
      !tags.some(tag => trip.tags.includes(tag))
    );

    setFilteredTrips([...filtered, ...rest]);
  };

  const handleTagClick = (tag) => {
    setSearchTag(tag);
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
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
      
      {selectedTags.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Выбранные теги:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedTags.map(tag => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleTagClick(tag)}
                color="primary"
              />
            ))}
          </Box>
          <Divider sx={{ my: 2 }} />
        </Box>
      )}
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Grid container spacing={4}>
        {filteredTrips.map(trip => (
          <Grid item xs={12} sm={6} md={4} key={trip.id}>
            <TripCard trip={trip} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}