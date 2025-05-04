import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Avatar, 
  Box, 
  Button, 
  Tabs, 
  Tab,
  Grid,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  TextField,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Badge
} from '@mui/material';
import { PhotoCamera, Edit } from '@mui/icons-material';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import TripCard from '../components/TripCard';
import { updateUser, subscribeToUser, unsubscribeFromUser, getCurrentUser } from '../api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

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

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, setUser, logout } = useContext(AuthContext);
  const [profileUser, setProfileUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    bio: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userRes = await axios.get(`http://localhost:8000/api/users/${username}/`);
        setProfileUser(userRes.data);
        setEditData({
          username: userRes.data.username,
          bio: userRes.data.bio || ''
        });
        setAvatarPreview(userRes.data.avatar ? `http://localhost:8000${userRes.data.avatar}` : '');
        
        const tripsRes = await axios.get(`http://localhost:8000/api/trips/?user=${userRes.data.id}`);
        setTrips(tripsRes.data);
        
        const subsRes = await axios.get(`http://localhost:8000/api/subscriptions/?target_user=${userRes.data.id}`);
        setSubscribers(subsRes.data || []);
        
        const subscrRes = await axios.get(`http://localhost:8000/api/subscriptions/?subscriber=${userRes.data.id}`);
        setSubscriptions(subscrRes.data || []);
        
        if (currentUser) {
          const isSub = subsRes.data.some(sub => sub.subscriber.id === currentUser.id);
          setIsSubscribed(isSub);
        }
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        setError(error.response?.data?.detail || 'Не удалось загрузить профиль');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [username, currentUser]);

  const handleSubscribe = async () => {
    try {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      const existingSubscription = subscribers.find(
        sub => sub.subscriber.id === currentUser.id
      );
      
      if (isSubscribed) {
        await unsubscribeFromUser(existingSubscription.id);
      } else {
        await subscribeToUser(profileUser.id);
      }
      
      const subsRes = await axios.get(`http://localhost:8000/api/subscriptions/?target_user=${profileUser.id}`);
      setSubscribers(subsRes.data || []);
      
      const subscrRes = await axios.get(`http://localhost:8000/api/subscriptions/?subscriber=${currentUser.id}`);
      setSubscriptions(subscrRes.data || []);
      
      setIsSubscribed(!isSubscribed);
    } catch (error) {
      console.error('Ошибка подписки:', error);
      setError('Не удалось изменить подписку');
    }
  };
  
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('username', editData.username);
      formData.append('bio', editData.bio || '');
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      } else if (avatarPreview === '' && profileUser.avatar) {
        // If user removed avatar
        formData.append('avatar', '');
      }
      
      const response = await updateUser(formData);
      setProfileUser(response.data);
      setOpenEdit(false);
      
      // Update current user in context
      const userResponse = await getCurrentUser();
      setUser(userResponse.data);
      
      // Update avatar preview
      if (avatarFile) {
        setAvatarPreview(URL.createObjectURL(avatarFile));
      } else if (!response.data.avatar) {
        setAvatarPreview('');
      }
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      setError(error.response?.data || 'Не удалось обновить профиль');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">{error}</Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => window.location.href = '/'}
        >
          На главную
        </Button>
      </Container>
    );
  }

  if (!profileUser) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5">Пользователь не найден</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 4, position: 'relative' }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            currentUser?.id === profileUser.id && (
              <IconButton 
                component="label"
                size="small"
                sx={{ 
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'background.default' }
                }}
              >
                <PhotoCamera fontSize="small" />
                <input 
                  type="file" 
                  hidden 
                  accept="image/*" 
                  onChange={handleImageChange}
                />
              </IconButton>
            )
          }
        >
          <Avatar 
            src={avatarPreview || (profileUser.avatar ? `http://localhost:8000${profileUser.avatar}` : '')} 
            sx={{ width: 120, height: 120 }}
          />
        </Badge>
        
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h3" component="h1">
              {profileUser.username}
            </Typography>
            
            {currentUser?.id === profileUser.id && (
              <IconButton onClick={() => setOpenEdit(true)}>
                <Edit />
              </IconButton>
            )}
          </Box>
          
          <Typography variant="body1" sx={{ mt: 1 }}>
            {profileUser.bio || 'Нет информации о себе'}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Typography variant="body1">
              <strong>{subscribers.length}</strong> Подписчиков
            </Typography>
            <Typography variant="body1">
              <strong>{subscriptions.length}</strong> Подписок
            </Typography>
            <Typography variant="body1">
              <strong>{trips.length}</strong> Поездок
            </Typography>
          </Box>
          
          {currentUser && currentUser.id === profileUser.id ? (
            <Button 
              variant="outlined" 
              color="error"
              sx={{ mt: 2 }}
              onClick={logout}
            >
              Выйти
            </Button>
          ) : currentUser ? (
            <Button 
              variant="contained" 
              color={isSubscribed ? 'error' : 'primary'}
              sx={{ mt: 2 }}
              onClick={handleSubscribe}
            >
              {isSubscribed ? 'Отписаться' : 'Подписаться'}
            </Button>
          ) : (
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              onClick={() => navigate('/login')}
            >
              Войти, чтобы подписаться
            </Button>
          )}
        </Box>
      </Box>
      
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
        <Tab label="Поездки" />
        <Tab label="Подписчики" />
        <Tab label="Подписки" />
        <Tab label="О себе" />
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
            <Typography variant="h6" sx={{ mt: 4, width: '100%', textAlign: 'center' }}>
              {currentUser && currentUser.id === profileUser.id ? 
                'У вас пока нет поездок. Создайте первую!' : 
                'У пользователя пока нет поездок'}
            </Typography>
          )}
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <List>
            {subscribers.length > 0 ? (
              subscribers.map(sub => (
                <ListItem key={sub.id}>
                  <ListItemAvatar>
                    <Avatar 
                      src={sub.subscriber?.avatar ? `http://localhost:8000${sub.subscriber.avatar}` : ''} 
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={sub.subscriber?.username || 'Неизвестный пользователь'}
                    secondary={`Подписан с ${new Date(sub.created_at).toLocaleDateString()}`}
                  />
                </ListItem>
              ))
            ) : (
              <Typography variant="body1">Нет подписчиков</Typography>
            )}
          </List>
        </Paper>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <List>
            {subscriptions.length > 0 ? (
              subscriptions.map(sub => (
                <ListItem key={sub.id}>
                  <ListItemAvatar>
                    <Avatar 
                      src={sub.target_user?.avatar ? `http://localhost:8000${sub.target_user.avatar}` : ''} 
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={sub.target_user?.username || 'Неизвестный пользователь'}
                    secondary={`Подписан с ${new Date(sub.created_at).toLocaleDateString()}`}
                  />
                </ListItem>
              ))
            ) : (
              <Typography variant="body1">Нет подписок</Typography>
            )}
          </List>
        </Paper>
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h5" gutterBottom>О себе</Typography>
        <Typography variant="body1" paragraph>
          {profileUser.bio || 'Пользователь не добавил информацию о себе.'}
        </Typography>
        
        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Статистика</Typography>
        <Typography variant="body1">
          Количество поездок: {trips.length}
        </Typography>
        <Typography variant="body1">
          Подписчики: {subscribers.length}
        </Typography>
        <Typography variant="body1">
          Подписки: {subscriptions.length}
        </Typography>
      </TabPanel>
      
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Редактировать профиль</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                src={avatarPreview || (profileUser.avatar ? `http://localhost:8000${profileUser.avatar}` : '')} 
                sx={{ width: 80, height: 80 }} 
              />
              <Button variant="contained" component="label">
                Изменить фото
                <input 
                  type="file" 
                  hidden 
                  accept="image/*" 
                  onChange={handleImageChange} 
                />
              </Button>
            </Box>
            
            <TextField
              label="Имя пользователя"
              fullWidth
              value={editData.username}
              onChange={(e) => setEditData({...editData, username: e.target.value})}
            />
            
            <TextField
              label="О себе"
              multiline
              rows={4}
              fullWidth
              value={editData.bio}
              onChange={(e) => setEditData({...editData, bio: e.target.value})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Отмена</Button>
          <Button 
            onClick={handleSaveProfile} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}