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
  Alert,
  CircularProgress,
  Grid,
  Paper
} from '@mui/material';
import { PhotoCamera, Close } from '@mui/icons-material';
import { createTrip } from '../api';
import { useNavigate } from 'react-router-dom';

export default function CreateTripForm({ open, handleClose, onTripCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setError('Можно загрузить не более 5 изображений');
      return;
    }

    const newImages = [...images];
    const newPreviews = [...previews];

    files.forEach(file => {
      newImages.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...previews];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setPreviews(newPreviews);
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
    if (!title || !description || images.length === 0 || tags.length === 0) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
  
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      images.forEach(image => formData.append('images', image));
      tags.forEach(tag => formData.append('tags', tag));
  
      const response = await createTrip(formData);
      resetForm();
      
      if (typeof onTripCreated === 'function') {
        await onTripCreated();
      }
      
      navigate(`/trips/${response.data.id}`);
      handleClose();
    } catch (error) {
      console.error('Ошибка создания поездки:', error);
      setError(error.response?.data || error.message || 'Не удалось создать поездку');
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImages([]);
    setPreviews([]);
    setTags([]);
    setTagInput('');
    setError(null);
  };

  const handleCloseForm = () => {
    resetForm();
    handleClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCloseForm} 
      fullWidth 
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          padding: 1
        }
      }}
    >
      <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        Создать новую поездку
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Название*"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ marginBottom: 2 }}
            inputProps={{ maxLength: 200 }}
            error={!title && error}
          />
          
          <TextField
            label="Описание*"
            multiline
            rows={4}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            sx={{ marginBottom: 2 }}
            error={!description && error}
          />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Изображения* (максимум 5)
            </Typography>
            <Grid container spacing={2}>
              {previews.map((preview, index) => (
                <Grid item xs={6} sm={4} key={index}>
                  <Paper elevation={3} sx={{ position: 'relative' }}>
                    <Avatar 
                      src={preview} 
                      variant="rounded" 
                      sx={{ 
                        width: '100%', 
                        height: 150,
                        objectFit: 'cover'
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: 5, 
                        right: 5,
                        backgroundColor: 'rgba(255,255,255,0.7)'
                      }}
                      onClick={() => handleRemoveImage(index)}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Paper>
                </Grid>
              ))}
              {previews.length < 5 && (
                <Grid item xs={6} sm={4}>
                  <IconButton 
                    color="primary" 
                    component="label"
                    sx={{ 
                      border: '1px dashed',
                      borderColor: error && images.length === 0 ? 'error.main' : 'primary.main',
                      borderRadius: 1,
                      width: '100%',
                      height: 150
                    }}
                  >
                    <PhotoCamera sx={{ marginRight: 1 }} />
                    <Typography variant="body2">
                      Добавить изображение
                    </Typography>
                    <input 
                      type="file" 
                      hidden 
                      accept="image/*" 
                      onChange={handleImageChange}
                      multiple
                    />
                  </IconButton>
                </Grid>
              )}
            </Grid>
            {error && images.length === 0 && (
              <Typography color="error" variant="caption">
                Необходимо добавить хотя бы одно изображение
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 2 }}>
            <TextField
              label="Добавить тег*"
              fullWidth
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              error={tags.length === 0 && error}
              helperText={tags.length === 0 && error ? "Добавьте хотя бы один тег" : ""}
            />
            <Button 
              onClick={handleAddTag}
              variant="outlined"
              disabled={!tagInput}
            >
              Добавить
            </Button>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1,
            minHeight: 40,
            marginBottom: 2
          }}>
            {tags.length > 0 ? (
              tags.map(tag => (
                <Chip 
                  key={tag} 
                  label={tag} 
                  onDelete={() => handleRemoveTag(tag)}
                  sx={{ marginBottom: 1 }}
                />
              ))
            ) : (
              <Typography variant="body2" color={error ? "error" : "text.secondary"}>
                {error ? "Добавьте теги для вашей поездки" : "Добавьте теги для вашей поездки"}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ padding: 3 }}>
        <Button 
          onClick={handleCloseForm}
          variant="outlined"
          sx={{ marginRight: 2 }}
        >
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? (
            <>
              <CircularProgress 
                size={24} 
                sx={{ 
                  color: 'inherit',
                  marginRight: 1
                }} 
              />
              Публикация...
            </>
          ) : 'Опубликовать'}
        </Button>
      </DialogActions>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ width: '100%' }}
        >
          {typeof error === 'object' ? JSON.stringify(error) : error}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}