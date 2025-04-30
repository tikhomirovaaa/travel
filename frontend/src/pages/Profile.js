import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TripCard from '../components/TripCard';
import { updateUser } from '../api';

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
  const { user: currentUser } = useAuth();
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userRes = await axios.get(`http://localhost:8000/api/users/?username=${username}`);
        setProfileUser(userRes.data[0]);
        setEditData({
          username: userRes.data[0].username,
          bio: userRes.data[0].bio || ''
        });
        setAvatarPreview(userRes.data[0].avatar);
        
        const tripsRes = await axios.get(`http://localhost:8000/api/trips/?author=${userRes.data[0].id}`);
        setTrips(tripsRes.data.results || []);
        
        if (currentUser) {
          const subRes = await axios.get(`http://localhost:8000/api/subscriptions/?subscriber=${currentUser.id}&target_user=${userRes.data[0].id}`);
          setIsSubscribed(subRes.data.length > 0);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [username, currentUser]);

  const handleSubscribe = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      if (isSubscribed) {
        await axios.delete(`http://localhost:8000/api/subscriptions/${profileUser.id}/`, {
          headers: { 'Authorization': `Token ${token}` }
        });
      } else {
        await axios.post(`http://localhost:8000/api/subscriptions/`, {
          target_user: profileUser.id
        }, {
          headers: { 'Authorization': `Token ${token}` }
        });
      }
      setIsSubscribed(!isSubscribed);
    } catch (error) {
      console.error('Error toggling subscription:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('username', editData.username);
      formData.append('bio', editData.bio);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      const updatedUser = await updateUser(formData);
      setProfileUser(updatedUser.data);
      setOpenEdit(false);
    } catch (error) {
      console.error('Error updating profile:', error);
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

  if (!profileUser) return <div>Пользователь не найден</div>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 4 }}>
        <Avatar 
          src={avatarPreview || (profileUser.avatar ? `http://localhost:8000${profileUser.avatar}` : '')} 
          sx={{ width: 120, height: 120 }}
        />
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h3" component="h1">
            {profileUser.username}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {profileUser.bio || 'Нет описания профиля'}
          </Typography>
          
          {currentUser && currentUser.id === profileUser.id ? (
            <Button 
              variant="outlined" 
              sx={{ mt: 2 }}
              onClick={() => setOpenEdit(true)}
            >
              Редактировать профиль
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color={isSubscribed ? 'error' : 'primary'}
              sx={{ mt: 2 }}
              onClick={handleSubscribe}
            >
              {isSubscribed ? 'Отписаться' : 'Подписаться'}
            </Button>
          )}
        </Box>
      </Box>
      
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
        <Tab label="Путешествия" />
        <Tab label="Информация" />
      </Tabs>
      
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={4}>
          {trips.map(trip => (
            <Grid item xs={12} sm={6} md={4} key={trip.id}>
              <TripCard trip={trip} />
            </Grid>
          ))}
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h5" gutterBottom>О пользователе</Typography>
        <Typography variant="body1" paragraph>
          {profileUser.bio || 'Пользователь пока не добавил информацию о себе.'}
        </Typography>
        
        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Статистика</Typography>
        <Typography variant="body1">
          Количество путешествий: {trips.length}
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