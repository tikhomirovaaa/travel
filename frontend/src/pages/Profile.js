import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
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
  IconButton,
  Badge,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import { PhotoCamera, Edit } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import TripCard from '../components/TripCard';
import { 
  updateUser, 
  subscribeToUser, 
  unsubscribeFromUser, 
  getCurrentUser,
  getUser,
  getTripsByUser,
  getSubscribers,
  getSubscriptions
} from '../api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
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
  const theme = useTheme();
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, setUser, logout } = useContext(AuthContext);
  const [profileUser, setProfileUser] = useState(null);
  const [userTrips, setUserTrips] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState(null);
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

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Получаем данные пользователя
        let userResponse = await getUser(username);
        const userData = userResponse.data[0];
        const myProfile = await getCurrentUser();
        setUser(myProfile.data)

        setProfileUser(userData);
        setEditData({
          username: userData.username,
          bio: userData.bio || ''
        });
        setAvatarPreview(userData.avatar 
          ? `${userData.avatar}` 
          : '');

        // Получаем посты пользователя
        const tripsResponse = await getTripsByUser(userData.id);
        console.log(tripsResponse, 'трипы трипы')
        setUserTrips(tripsResponse.data);

        // Получаем подписчиков и подписки
        const [subsResponse, subscrResponse] = await Promise.all([
          getSubscribers(userData.id),
          getSubscriptions(userData.id)
        ]);
        
        setSubscribers(subsResponse.data || []);
        setSubscriptions(subscrResponse.data || []);

      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        setError(error.response?.data?.detail || 'Не удалось загрузить профиль');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username, navigate]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubscribe = async () => {
    try {
      if (isSubscribed) {
        await unsubscribeFromUser(subscriptionId);
        setIsSubscribed(false);
        setSubscriptionId(null);
      } else {
        const response = await subscribeToUser(profileUser.id);
        setIsSubscribed(true);
        setSubscriptionId(response.data.id);
      }

      // Обновляем список подписчиков
      const updatedSubs = await getSubscribers(profileUser.id);
      setSubscribers(updatedSubs.data || []);
      
    } catch (error) {
      console.error('Ошибка подписки:', error);
      setError('Не удалось изменить подписку');
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('username', editData.username);
      formData.append('bio', editData.bio || 'asdajsja');
      let avatar = {}
      if (avatarFile) {
        avatar = {'avatar': avatarFile};
      } else if (avatarPreview === '' && profileUser.avatar) {
        // Удаление аватара
        formData.append('avatar', '');
      }

      const response = await updateUser({...editData, ...avatar});
      setProfileUser(response.data);
      setOpenEdit(false);
      
      // Обновляем текущего пользователя в контексте
      const userResponse = await getCurrentUser();
      setUser(userResponse.data);
      
      // Обновляем превью аватара
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
          onClick={() => navigate('/')}
        >
          На главную
        </Button>
      </Container>
    );
  }

  if (!profileUser) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Шапка профиля */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 4 }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <IconButton 
              component="label"
              size="small"
              sx={{ bgcolor: 'background.paper' }}
            >
              <PhotoCamera fontSize="small" />
              <input 
                type="file" 
                hidden 
                accept="image/*" 
                onChange={handleImageChange}
              />
            </IconButton>
          }
        >
          <Avatar 
            src={avatarPreview} 
            sx={{ width: 120, height: 120 }}
          />
        </Badge>
        
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h3" component="h1">
              {profileUser.username}
            </Typography>
            {username === currentUser.username && <IconButton onClick={() => setOpenEdit(true)}>
              <Edit />
            </IconButton> }
          </Box>
          
          <Typography variant="body1" sx={{ mt: 1 }}>
            {profileUser.bio || (username === currentUser.username && 'Расскажите о себе...')}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Typography variant="body1">
              <strong>{subscribers.length}</strong> Подписчиков
            </Typography>
            <Typography variant="body1">
              <strong>{subscriptions.length}</strong> Подписок
            </Typography>
            <Typography variant="body1">
              <strong>{userTrips.length}</strong> Поездок
            </Typography>
          </Box>
          
          {username === currentUser.username && <Button 
            variant="outlined" 
            color="error"
            sx={{ mt: 2 }}
            onClick={logout}
          >
            Выйти
          </Button>}
        </Box>
      </Box>
      
      {/* Вкладки */}
      <Tabs 
        value={tabValue} 
        onChange={(e, newValue) => setTabValue(newValue)}
        variant="fullWidth"
      >
        <Tab label="Мои поездки" />
        <Tab label="Подписчики" />
        <Tab label="Подписки" />
        <Tab label="О себе" />
      </Tabs>
      
      {/* Контент вкладок */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={4}>
          {userTrips.length > 0 ? (
            userTrips.map(trip => (
              <Grid item xs={12} sm={6} md={4} key={trip.id}>
                <TripCard trip={trip} />
              </Grid>
            ))
          ) : (
            <Typography variant="h6" sx={{ mt: 4, width: '100%', textAlign: 'center' }}>
              У вас пока нет поездок. Создайте первую!
            </Typography>
          )}
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Paper elevation={3} sx={{ p: 2, 
  backgroundColor: theme.palette.background.paper }}>
          <List>
            {subscribers.length > 0 ? (
              subscribers.map(sub => (
                <ListItem key={sub.id}>
                  <ListItemAvatar>
                    <Avatar src={sub.subscriber?.avatar ? `http://localhost:8000${sub.subscriber.avatar}` : ''} />
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
                    <Avatar src={sub.target_user?.avatar ? `http://localhost:8000${sub.target_user.avatar}` : ''} />
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
          {profileUser.bio || 'Пока нет информации о себе.'}
        </Typography>
      </TabPanel>
      
      {/* Диалог редактирования профиля */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Редактировать профиль</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={avatarPreview} sx={{ width: 80, height: 80 }} />
              <Button variant="contained" component="label">
                Изменить фото
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
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
              placeholder="Расскажите о себе..."
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