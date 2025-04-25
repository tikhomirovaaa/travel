import React, { useEffect, useState, useContext } from 'react';
import { Container, Typography, Grid, Card, CardMedia, CardContent, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export default function WishList() {
  const { user } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (user) {
      axios.get('http://localhost:8000/api/wishlist/', {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` }
      }).then(res => setWishlist(res.data));
    }
  }, [user]);

  const handleRemove = (id) => {
    axios.delete(`http://localhost:8000/api/wishlist/${id}/`, {
      headers: { Authorization: `Token ${localStorage.getItem('token')}` }
    }).then(() => {
      setWishlist(wishlist.filter(item => item.id !== id));
    });
  };

  const downloadList = () => {
    axios.get('http://localhost:8000/api/wishlist/download/', {
      headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      responseType: 'blob'
    }).then(res => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'my_travel_list.pdf');
      document.body.appendChild(link);
      link.click();
    });
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Мой список "Хочу посетить"</Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={downloadList}
        sx={{ mb: 3 }}
      >
        Скачать список
      </Button>
      <Grid container spacing={3}>
        {wishlist.map(item => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={`http://localhost:8000${item.trip.image}`}
                alt={item.trip.title}
              />
              <CardContent>
                <Typography gutterBottom variant="h5">
                  <Link to={`/trips/${item.trip.id}`}>{item.trip.title}</Link>
                </Typography>
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => handleRemove(item.id)}
                  size="small"
                >
                  Удалить
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}