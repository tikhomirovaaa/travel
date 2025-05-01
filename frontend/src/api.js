import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const login = (credentials) => api.post('auth/token/login/', credentials);
export const registerUser = (data) => api.post('auth/users/', data);
export const logout = () => api.post('auth/token/logout/');
export const getTrips = (params = {}) => {
  console.log('Fetching trips with params:', params); // Добавляем лог
  return api.get('trips/', { params })
    .then(response => {
      console.log('API response:', response.data); // Лог ответа
      return response;
    })
    .catch(error => {
      console.error('API error:', error);
      throw error;
    });
};
export const getTrip = (id) => api.get(`trips/${id}/`);
export const createTrip = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (key === 'tags') {
      data.tags.forEach(tag => formData.append('tags', tag));
    } else if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return api.post('trips/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
export const deleteTrip = (id) => api.delete(`trips/${id}/`);

export const likeTrip = (id) => api.post(`trips/${id}/like/`);
export const commentTrip = (id, text) => api.post(`trips/${id}/comment/`, { text });
export const getUser = (username) => api.get(`users/?username=${username}`);
export const getCurrentUser = () => api.get('users/me/');
export const updateUser = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return api.put('users/me/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
export const getWishlist = () => api.get('wishlist/');
export const addToWishlist = (tripId, notes = '') => {
  return api.post('wishlist/', {
    trip: tripId,
    notes: notes
  });
};
export const removeFromWishlist = (id) => api.delete(`wishlist/${id}/`);
export const downloadWishlist = (tripIds, format) => 
  api.post('wishlist/download/', { trip_ids: tripIds, format }, { 
    responseType: format === 'pdf' ? 'blob' : 'text' 
  });

export default api;