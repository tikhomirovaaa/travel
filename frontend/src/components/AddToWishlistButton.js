// AddToWishlistButton.jsx
import React, { useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import { addToWishlist } from '../api';

export default function AddToWishlistButton({ tripId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleAdd = async () => {
    try {
      setLoading(true);
      setError(null);
      await addToWishlist(tripId);
      setSuccess(true);
    } catch (err) {
      console.error('Ошибка добавления в избранное:', err);
      setError(err.response?.data?.detail || err.response?.data?.trip || 'Не удалось добавить в избранное');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="contained" 
        onClick={handleAdd}
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? 'Добавление...' : 'В избранное'}
      </Button>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success">Добавлено в избранное!</Alert>
      </Snackbar>
    </>
  );
}