import React, { useState } from 'react';
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
  MenuItem
} from '@mui/material';
import { Favorite, FavoriteBorder, Comment, Bookmark, BookmarkBorder, MoreVert } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { likeTrip, commentTrip, addToWishlist, removeFromWishlist, deleteTrip } from '../api';

export default function TripCard({ trip, onDelete }) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(trip.is_liked);
  const [likeCount, setLikeCount] = useState(trip.total_likes);
  const [comments, setComments] = useState(trip.comments || []);
  const [commentText, setCommentText] = useState('');
  const [openComments, setOpenComments] = useState(false);
  const [inWishlist, setInWishlist] = useState(trip.in_wishlists?.some(w => w.user === user?.id));
  const [wishlistId, setWishlistId] = useState(
    trip.in_wishlists?.find(w => w.user === user?.id)?.id || null
  );
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

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
      console.error('Error toggling like:', error);
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
      console.error('Error adding comment:', error);
      setError('Не удалось добавить комментарий');
    }
  };

  const handleWishlist = async () => {
    try {
      if (!user) {
        window.location.href = '/login';
        return;
      }
      
      if (inWishlist) {
        await removeFromWishlist(wishlistId);
        setInWishlist(false);
        setWishlistId(null);
      } else {
        const response = await addToWishlist(trip.id);
        setInWishlist(true);
        setWishlistId(response.data.id);
      }
    } catch (error) {
      console.error('Error:', error.response?.data);
      setError(
        error.response?.data?.detail || 
        error.response?.data?.trip?.[0] || 
        'Ошибка при обновлении списка желаний'
      );
    }
  };

  const handleDeleteTrip = async () => {
    try {
      if (user && (user.id === trip.author.id || user.is_staff)) { // Разрешаем удаление автору или админу
        await deleteTrip(trip.id);
        if (typeof onDelete === 'function') {
          onDelete(); // Вызываем колбэк для обновления списка
        }
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
      setError('Не удалось удалить путешествие');
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
          image={`http://localhost:8000${trip.image}`}
          height="200"
        />
        {(user && (user.id === trip.author.id || user.is_staff)) && ( // Показываем меню автору или админу
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
          {trip.description.length > 100 
            ? `${trip.description.substring(0, 100)}...` 
            : trip.description}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {trip.tags.map(tag => (
            <Chip key={tag} label={tag} size="small" />
          ))}
        </Box>
        
        <Typography variant="caption" display="block" sx={{ mb: 2 }}>
          Автор: {trip.author.username}
        </Typography>
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
        
        <IconButton onClick={handleWishlist}>
          {inWishlist ? <Bookmark color="primary" /> : <BookmarkBorder />}
        </IconButton>
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