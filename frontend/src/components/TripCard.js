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
  TextField
} from '@mui/material';
import { Favorite, FavoriteBorder, Comment, Bookmark, BookmarkBorder } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function TripCard({ trip }) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(trip.is_liked);
  const [likeCount, setLikeCount] = useState(trip.total_likes);
  const [comments, setComments] = useState(trip.comments || []);
  const [commentText, setCommentText] = useState('');
  const [openComments, setOpenComments] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      await axios.post(`http://localhost:8000/api/trips/${trip.id}/like/`, {}, {
        headers: { 'Authorization': `Token ${token}` }
      });
      
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddComment = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      const response = await axios.post(
        `http://localhost:8000/api/trips/${trip.id}/comment/`,
        { text: commentText },
        { headers: { 'Authorization': `Token ${token}` } }
      );
      
      setComments([...comments, response.data]);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      await axios.post(
        'http://localhost:8000/api/wishlist/',
        { trip: trip.id },
        { headers: { 'Authorization': `Token ${token}` } }
      );
      
      setInWishlist(true);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component={Link}
        to={`/trips/${trip.id}`}
        image={`http://localhost:8000${trip.image}`}
        height="200"
      />
      
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
        
        <IconButton onClick={handleAddToWishlist}>
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
    </Card>
  );
}