import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Card, CardMedia, CardContent, Button } from '@mui/material';
import { getTrip } from '../api';

export default function TripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    getTrip(id).then(res => setTrip(res.data));
  }, [id]);

  if (!trip) return <div>Loading...</div>;

  return (
    <Container sx={{ py: 4 }}>
      <Card>
        <CardMedia
          component="img"
          height="400"
          image={`http://localhost:8000${trip.image}`}
          alt={trip.title}
        />
        <CardContent>
          <Typography gutterBottom variant="h3">
            {trip.title}
          </Typography>
          <Typography variant="body1" paragraph>
            {trip.description}
          </Typography>
          <Button variant="contained" color="primary">
            Добавить в "Хочу посетить"
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}