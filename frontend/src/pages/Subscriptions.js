import React, { useEffect, useState, useContext } from 'react';
import { Container, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Button } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export default function Subscriptions() {
  const { user } = useContext(AuthContext);
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    if (user) {
      axios.get('http://localhost:8000/api/subscriptions/', {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` }
      }).then(res => setSubscriptions(res.data));
    }
  }, [user]);

  const handleUnsubscribe = (id) => {
    axios.delete(`http://localhost:8000/api/subscriptions/${id}/`, {
      headers: { Authorization: `Token ${localStorage.getItem('token')}` }
    }).then(() => {
      setSubscriptions(subscriptions.filter(sub => sub.id !== id));
    });
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Мои подписки</Typography>
      <List>
        {subscriptions.map(sub => (
          <ListItem key={sub.id}>
            <ListItemAvatar>
              <Avatar src={sub.target_user.avatar} />
            </ListItemAvatar>
            <ListItemText
              primary={sub.target_user.username}
              secondary={`Подписан с ${new Date(sub.created_at).toLocaleDateString()}`}
            />
            <Button 
              variant="outlined" 
              color="error"
              onClick={() => handleUnsubscribe(sub.id)}
            >
              Отписаться
            </Button>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}