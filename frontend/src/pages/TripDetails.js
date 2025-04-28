import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Card, 
  CardMedia, 
  CardContent, 
  Button,
  Box,
  Chip,
  IconButton,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { Favorite, FavoriteBorder, Comment, Bookmark, BookmarkBorder } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { 
  getTrip, 
  likeTrip, 
  commentTrip, 
  addToWishlist, 
  removeFromWishlist 
} from '../api';

export default function TripDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        const response = await getTrip(id);
        setTrip(response.data);
        setIsLiked(response.data.is_liked);
        setLikeCount(response.data.total_likes);
        
        if (user) {
          const wishlistItem = response.data.in_wishlists.find(
            item => item.user === user.id
          );
          if (wishlistItem) {
            setInWishlist(true);
            setWishlistId(wishlistItem.id);
          }
        }
      } catch (error) {
        console.error('Error fetching trip:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrip();
  }, [id, user]);

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
    }
  };

  const handleAddComment = async () => {
    try {
      if (!user) {
        window.location.href = '/login';
        return;
      }
      
      const response = await commentTrip(trip.id, commentText);
      setTrip({
        ...trip,
        comments: [...trip.comments, response.data]
      });
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
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
      } else {
        const response = await addToWishlist(trip.id);
        setInWishlist(true);
        setWishlistId(response.data.id);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!trip) {
    return (
      <Container>
        <Typography variant="h4">Путешествие не найдено</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card>
        <CardMedia
          component="img"
          height="500"
          image={`http://localhost:8000${trip.image}`}
          alt={trip.title}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography gutterBottom variant="h2" component="div">
              {trip.title}
            </Typography>
            
            <Box>
              <IconButton onClick={handleLike}>
                {isLiked ? <Favorite color="error" /> : <FavoriteBorder />}
                <Typography sx={{ ml: 1 }}>{likeCount}</Typography>
              </IconButton>
              
              <IconButton onClick={handleWishlist}>
                {inWishlist ? <Bookmark color="primary" /> : <BookmarkBorder />}
              </IconButton>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {trip.tags.map(tag => (
              <Chip key={tag} label={tag} />
            ))}
          </Box>
          
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
            {trip.description}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 4, mb: 2 }}>
            <Avatar 
              src={trip.author.avatar && `http://localhost:8000${trip.author.avatar}`} 
              sx={{ width: 56, height: 56 }}
            />
            <Box sx={{ ml: 2 }}>
              <Typography variant="h6">
                {trip.author.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Опубликовано: {new Date(trip.created_at).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" gutterBottom>Комментарии</Typography>
        
        {user ? (
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Оставьте ваш комментарий..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleAddComment}
              disabled={!commentText.trim()}
            >
              Отправить
            </Button>
          </Box>
        ) : (
          <Typography variant="body1" sx={{ mb: 4 }}>
            <Button 
              variant="text" 
              color="primary"
              onClick={() => window.location.href = '/login'}
            >
              Войдите
            </Button>, чтобы оставить комментарий
          </Typography>
        )}
        
        <List>
          {trip.comments.length > 0 ? (
            trip.comments.map(comment => (
              <ListItem key={comment.id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar src={comment.author.avatar && `http://localhost:8000${comment.author.avatar}`} />
                </ListItemAvatar>
                <ListItemText
                  primary={comment.author.username}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {comment.text}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {new Date(comment.created_at).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))
          ) : (
            <Typography variant="body1">Пока нет комментариев</Typography>
          )}
        </List>
      </Box>
    </Container>
  );
}