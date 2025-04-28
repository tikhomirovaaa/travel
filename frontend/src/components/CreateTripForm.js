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
  IconButton
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import axios from 'axios';

export default function CreateTripForm({ open, handleClose, onTripCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

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
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('image', image);
    tags.forEach(tag => formData.append('tags', tag));

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/trips/', formData, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      onTripCreated(response.data);
      handleClose();
    } catch (error) {
      console.error('Error creating trip:', error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Создать новое путешествие</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Название"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          <TextField
            label="Описание"
            multiline
            rows={4}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton color="primary" component="label">
              <PhotoCamera />
              <input 
                type="file" 
                hidden 
                accept="image/*" 
                onChange={handleImageChange}
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
        <Button onClick={handleClose}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!title || !description || !image}>
          Опубликовать
        </Button>
      </DialogActions>
    </Dialog>
  );
}