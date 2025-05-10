import React, { useState, useEffect } from 'react';
import { 
  Tooltip, 
  Avatar, 
  Box, 
  Typography,
  Grid,
  Paper,
  Icon,
  CircularProgress
} from '@mui/material';
import api from '../api';

export default function ProfileBadges({ userId }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await api.get(`/users/${userId}/achievements/`);
        setBadges(response.data);
      } catch (error) {
        console.error('Error fetching badges:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBadges();
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (badges.length === 0) {
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Пока нет достижений
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Достижения
      </Typography>
      <Grid container spacing={2}>
        {badges.map(badge => (
          <Grid item key={badge.id}>
            <Tooltip 
              title={
                <>
                  <Typography variant="subtitle1">{badge.achievement.name}</Typography>
                  <Typography variant="body2">{badge.achievement.description}</Typography>
                  <Typography variant="caption" display="block">
                    Получено: {new Date(badge.date_achieved).toLocaleDateString()}
                  </Typography>
                </>
              } 
              arrow
            >
              <Avatar 
                sx={{ 
                  width: 56, 
                  height: 56,
                  bgcolor: 'primary.main',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    transition: 'transform 0.3s',
                  }
                }}
              >
                <Icon sx={{ fontSize: 30 }}>{badge.achievement.icon}</Icon>
              </Avatar>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}