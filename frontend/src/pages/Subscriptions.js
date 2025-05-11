import React, { useEffect, useState, useContext } from 'react';
import { useTheme } from '@mui/material/styles';
import { 
  Container, 
  Typography, 
  List, 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  Button,
  Grid,
  CircularProgress,
  Tabs,
  Tab,
  Box,
  Paper
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import TripCard from '../components/TripCard';
import { unsubscribeFromUser } from '../api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const theme = useTheme();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Subscriptions() {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [subscriptions, setSubscriptions] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (user) {
          const subRes = await axios.get('http://localhost:8000/api/subscriptions/', {
            headers: { Authorization: `Token ${localStorage.getItem('token')}` }
          });
          setSubscriptions(subRes.data);
          
          const tripsRes = await axios.get('http://localhost:8000/api/subscription-trips/', {
            headers: { Authorization: `Token ${localStorage.getItem('token')}` }
          });
          setTrips(tripsRes.data);
        }
      } catch (error) {
        console.error('Ошибка загрузки подписок:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const handleUnsubscribe = async (subscriptionId) => {
    try {
      await unsubscribeFromUser(subscriptionId);
      setSubscriptions(prev => prev.filter(sub => sub.id !== subscriptionId));
      
      // Обновляем ленту
      const tripsRes = await axios.get('http://localhost:8000/api/subscription-trips/', {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` }
      });
      setTrips(tripsRes.data);
    } catch (error) {
      console.error('Ошибка отписки:', error);
    }
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
      <Typography variant="h3" gutterBottom>Мои подписки</Typography>
      
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
        <Tab label="Лента" />
        <Tab label="Подписки" />
      </Tabs>
      
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={4}>
          {trips.length > 0 ? (
            trips.map(trip => (
              <Grid item xs={12} sm={6} md={4} key={trip.id}>
                <TripCard trip={trip} />
              </Grid>
            ))
          ) : (
            <Paper elevation={3} sx={{ 
              p: 4, 
              width: '100%', 
              textAlign: 'center',
              backgroundColor: theme.palette.background.paper
            }}>
              <Typography variant="h6">
                {subscriptions.length === 0 
                  ? 'Вы ни на кого не подписаны' 
                  : 'Нет новых постов от ваших подписок'}
              </Typography>
            </Paper>
          )}
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Paper elevation={3} sx={{ 
          p: 2,
          backgroundColor: theme.palette.background.paper 
        }}>
          <List>
            {subscriptions.length > 0 ? (
              subscriptions.map(sub => (
                <ListItem key={sub.id}>
                  <ListItemAvatar>
                    <Avatar 
                      src={sub.target_user.avatar && `http://localhost:8000${sub.target_user.avatar}`} 
                    />
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
              ))
            ) : (
              <Typography variant="h6" sx={{ mt: 4, textAlign: 'center' }}>
                Вы ни на кого не подписаны
              </Typography>
            )}
          </List>
        </Paper>
      </TabPanel>
    </Container>
  );
}