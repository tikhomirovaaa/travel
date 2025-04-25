import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Card, 
  CardMedia, 
  CardContent, 
  Grid, 
  Button,
  CircularProgress,
  Pagination
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Home() {
  // Состояния компонента
  const [trips, setTrips] = useState([]); // Список путешествий
  const [loading, setLoading] = useState(true); // Флаг загрузки
  const [page, setPage] = useState(1); // Текущая страница пагинации
  const [totalPages, setTotalPages] = useState(1); // Всего страниц
  const tripsPerPage = 6; // Количество путешествий на странице

  // Загрузка данных при монтировании компонента и изменении страницы
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        // Запрос к API с параметрами пагинации
        const response = await axios.get(`http://localhost:8000/api/trips/?page=${page}`);
        setTrips(response.data.results || []);
        setTotalPages(Math.ceil(response.data.count / tripsPerPage));
      } catch (error) {
        console.error('Ошибка при загрузке путешествий:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [page]);

  // Обработчик изменения страницы
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Функция для добавления в список желаний
  const addToWishlist = async (tripId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Перенаправление на страницу входа, если пользователь не авторизован
        window.location.href = '/login';
        return;
      }
      
      await axios.post(
        'http://localhost:8000/api/wishlist/',
        { trip: tripId },
        { headers: { 'Authorization': `Token ${token}` } }
      );
      
      alert('Путешествие добавлено в ваш список желаний!');
    } catch (error) {
      console.error('Ошибка при добавлении в список желаний:', error);
    }
  };

  // Отображение компонента
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок страницы */}
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold',
          color: 'primary.main',
          textAlign: 'center',
          mb: 4
        }}
      >
        Последние путешествия
      </Typography>

      {/* Индикатор загрузки */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
          <CircularProgress size={60} />
        </div>
      )}

      {/* Сетка с карточками путешествий */}
      <Grid container spacing={4}>
        {trips.map(trip => (
          <Grid item xs={12} sm={6} md={4} key={trip.id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'scale(1.03)',
                boxShadow: 6
              }
            }}>
              {/* Изображение путешествия */}
              <CardMedia
                component="img"
                height="200"
                image={`http://localhost:8000${trip.image}`}
                alt={trip.title}
                sx={{ objectFit: 'cover' }}
              />
              
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Название путешествия (ссылка на детали) */}
                <Typography 
                  gutterBottom 
                  variant="h5" 
                  component={Link} 
                  to={`/trips/${trip.id}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                >
                  {trip.title}
                </Typography>
                
                {/* Краткое описание */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {trip.description.length > 100 
                    ? `${trip.description.substring(0, 100)}...` 
                    : trip.description}
                </Typography>
                
                {/* Автор путешествия */}
                <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                  Автор: {trip.author.username}
                </Typography>
              </CardContent>
              
              {/* Кнопка добавления в список желаний */}
              <Button 
                variant="contained" 
                color="secondary"
                sx={{ m: 2 }}
                onClick={() => addToWishlist(trip.id)}
              >
                Хочу посетить
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Пагинация */}
      {!loading && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </div>
      )}
    </Container>
  );
}