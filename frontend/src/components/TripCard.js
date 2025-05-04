// TripCard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Button, 
  Chip, 
  Box, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Tooltip,
  Avatar
} from '@mui/material';
import { Favorite, FavoriteBorder, Bookmark, BookmarkBorder, MoreVert, Comment } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    likeTrip, 
    commentTrip, 
    addToWishlist, 
    removeFromWishlist, 
    deleteTrip, 
    checkWishlist,
    subscribeToUser,
    unsubscribeFromUser
  } from '../api';
import axios from 'axios';

export default function TripCard({ trip, onDelete }) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(trip.is_liked);
  const [likeCount, setLikeCount] = useState(trip.total_likes);
  const [comments, setComments] = useState(trip.comments || []);
  const [commentText, setCommentText] = useState('');
  const [openComments, setOpenComments] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const openMenu = Boolean(anchorEl);

  useEffect(() => {
    const checkInitialStatus = async () => {
      if (user) {
        try {
          setLoadingWishlist(true);
          
          // Check wishlist status
          const wishlistResponse = await checkWishlist(trip.id);
          setInWishlist(wishlistResponse.exists);
          setWishlistId(wishlistResponse.id);
          
          // Check subscription status
          if (trip.author.id !== user.id) {
            const subResponse = await axios.get(`http://localhost:8000/api/subscriptions/?subscriber=${user.id}&target_user=${trip.author.id}`);
            setIsSubscribed(subResponse.data.length > 0);
          }
        } catch (err) {
          console.error('Ошибка проверки статуса:', err);
        } finally {
          setLoadingWishlist(false);
        }
      }
    };
    
    checkInitialStatus();
  }, [user, trip.id, trip.author.id]);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLike = async () => {
    try {
      if (!user) {
        window.location.href = '/login';
        return;
      }
      
      await likeTrip(trip.id);
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    } catch (error) {
      console.error('Ошибка лайка:', error);
      setError('Не удалось поставить лайк');
    }
  };

  const handleAddComment = async () => {
    try {
      if (!user) {
        window.location.href = '/login';
        return;
      }
      
      const response = await commentTrip(trip.id, commentText);
      setComments([...comments, response.data]);
      setCommentText('');
    } catch (error) {
      console.error('Ошибка добавления комментария:', error);
      setError('Не удалось добавить комментарий');
    }
  };

  const handleWishlist = async () => {
    try {
      if (!user) {
        window.location.href = '/login';
        return;
      }
      
      setLoadingWishlist(true);
      
      if (inWishlist) {
        await removeFromWishlist(wishlistId);
        setInWishlist(false);
        setWishlistId(null);
      } else {
        const response = await addToWishlist(trip.id);
        setInWishlist(true);
        setWishlistId(response.id);
      }
    } catch (error) {
      console.error('Ошибка:', error.response?.data);
      setError(error.response?.data?.detail || 'Не удалось обновить избранное');
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      if (!user) {
        window.location.href = '/login';
        return;
      }
      
      if (isSubscribed) {
        await unsubscribeFromUser(trip.author.id);
      } else {
        await subscribeToUser(trip.author.id);
      }
      setIsSubscribed(!isSubscribed);
    } catch (error) {
      console.error('Ошибка подписки:', error);
      setError('Не удалось изменить подписку');
    }
  };

  const handleDeleteTrip = async () => {
    try {
      if (user && (user.id === trip.author.id || user.is_staff)) {
        await deleteTrip(trip.id);
        if (typeof onDelete === 'function') {
          onDelete();
        }
      }
    } catch (error) {
      console.error('Ошибка удаления поездки:', error);
      setError('Не удалось удалить поездку');
    } finally {
      handleMenuClose();
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ position: 'relative' }}>
      <CardMedia
    component={Link}
    to={`/trips/${trip.id}`}
    image={trip.main_image ? `http://localhost:8000${trip.main_image}` : '/placeholder.jpg'}
    height="200"
    sx={{ objectFit: 'cover' }}
  />
  {(user && (user.id === trip.author.id || user.is_staff)) && (
    <IconButton
      aria-label="more"
      aria-controls="long-menu"
      aria-haspopup="true"
      onClick={handleMenuClick}
      sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.7)' }}
    >
      <MoreVert />
    </IconButton>
  )}
</Box>
      
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={openMenu}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDeleteTrip}>Удалить</MenuItem>
      </Menu>
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography 
          gutterBottom 
          variant="h5" 
          component={Link} 
          to={`/trips/${trip.id}`}
          sx={{ 
            textDecoration: 'none', 
            color: 'inherit',
            '&:hover': { color: 'primary.main' }
          }}
        >
          {trip.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
  {trip.description ? 
    (trip.description.length > 100 
      ? `${trip.description.substring(0, 100)}...` 
      : trip.description)
    : 'Описание отсутствует'}
</Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {trip.tags.map(tag => (
            <Chip key={tag} label={tag} size="small" />
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Avatar 
            src={trip.author.avatar ? `http://localhost:8000${trip.author.avatar}` : ''} 
            sx={{ width: 24, height: 24 }}
            component={Link}
            to={`/profile/${trip.author.username}`}
          />
          <Typography variant="caption">
            <Link 
              to={`/profile/${trip.author.username}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {trip.author.username}
            </Link>
          </Typography>
          
          {user && user.id !== trip.author.id && (
            <Button 
              size="small" 
              variant={isSubscribed ? "outlined" : "contained"}
              onClick={handleSubscribe}
              sx={{ ml: 'auto' }}
            >
              {isSubscribed ? 'Отписаться' : 'Подписаться'}
            </Button>
          )}
        </Box>
      </CardContent>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
        <Box>
          <IconButton onClick={handleLike}>
            {isLiked ? <Favorite color="error" /> : <FavoriteBorder />}
          </IconButton>
          <Typography component="span">{likeCount}</Typography>
          
          <IconButton onClick={() => setOpenComments(true)}>
            <Comment />
          </IconButton>
          <Typography component="span">{comments.length}</Typography>
        </Box>
        
        <Tooltip title={inWishlist ? "Удалить из избранного" : "Добавить в избранное"}>
          <IconButton 
            onClick={handleWishlist} 
            disabled={loadingWishlist}
            color={inWishlist ? "primary" : "default"}
          >
            {inWishlist ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
        </Tooltip>
      </Box>
      
      <Dialog open={openComments} onClose={() => setOpenComments(false)} fullWidth maxWidth="sm">
        <DialogTitle>Комментарии</DialogTitle>
        <DialogContent>
          <Box sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
            {comments.length === 0 ? (
              <Typography>Пока нет комментариев</Typography>
            ) : (
              comments.map(comment => (
                <Box key={comment.id} sx={{ mb: 2, p: 2, bgcolor: 'background.paper' }}>
                  <Typography fontWeight="bold">{comment.author.username}</Typography>
                  <Typography>{comment.text}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(comment.created_at).toLocaleString()}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
          
          {user && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Добавить комментарий..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Button 
                variant="contained" 
                onClick={handleAddComment}
                disabled={!commentText.trim()}
              >
                Отправить
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenComments(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Card>
  );
}