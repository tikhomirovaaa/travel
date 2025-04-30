import React, { useState } from 'react';
import { 
  Button, 
  TextField, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle,
  Box,
  Chip,
  Typography,
  Avatar,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { createTrip } from '../api';
import { useNavigate } from 'react-router-dom';

export default function CreateTripForm({ open, handleClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const tripData = {
        title,
        description,
        image,
        tags
      };

      const response = await createTrip(tripData);
      handleClose();
      resetForm();
      navigate(`/trips/${response.data.id}`);
    } catch (error) {
      console.error('Error creating trip:', error);
      setError(error.response?.data?.detail || 'Ошибка при создании поста');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImage(null);
    setPreview('');
    setTags([]);
    setTagInput('');
    setError(null);
  };

  const handleCloseForm = () => {
    resetForm();
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleCloseForm} fullWidth maxWidth="md">
      <DialogTitle>Создать новое путешествие</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Название"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          
          <TextField
            label="Описание"
            multiline
            rows={4}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton color="primary" component="label">
              <PhotoCamera />
              <input 
                type="file" 
                hidden 
                accept="image/*" 
                onChange={handleImageChange}
                id="trip-image-input"
                name="trip-image"
              />
            </IconButton>
            <Typography>{image ? image.name : 'Выберите изображение'}</Typography>
          </Box>
          
          {preview && (
            <Avatar 
              src={preview} 
              variant="rounded" 
              sx={{ width: '100%', height: 200, objectFit: 'cover' }}
            />
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              label="Добавить тег"
              fullWidth
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <Button onClick={handleAddTag}>Добавить</Button>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {tags.map(tag => (
              <Chip 
                key={tag} 
                label={tag} 
                onDelete={() => handleRemoveTag(tag)}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseForm}>Отмена</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!title || !description || !image || loading}
        >
          {loading ? 'Публикация...' : 'Опубликовать'}
        </Button>
      </DialogActions>

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
    </Dialog>
  );
}