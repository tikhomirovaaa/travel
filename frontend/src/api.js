import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8000/api/' 
    : '/api/',
});

// Trips
export const getTrips = (params = {}) => api.get('trips/', { params });
export const getTrip = (id) => api.get(`trips/${id}/`);
export const createTrip = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (key === 'tags') {
      data.tags.forEach(tag => formData.append('tags', tag));
    } else {
      formData.append(key, data[key]);
    }
  });
  return api.post('trips/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
export const likeTrip = (id) => api.post(`trips/${id}/like/`);
export const commentTrip = (id, text) => api.post(`trips/${id}/comment/`, { text });

// Users
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

// Auth
export const login = (credentials) => api.post('auth/token/login/', credentials);
export const registerUser = (data) => api.post('auth/users/', data);
export const logout = () => api.post('auth/token/logout/');

// Wishlist
export const getWishlist = () => api.get('wishlist/');
export const addToWishlist = (tripId) => api.post('wishlist/', { trip: tripId });
export const removeFromWishlist = (id) => api.delete(`wishlist/${id}/`);
export const downloadWishlist = (tripIds, format) => 
  api.post('wishlist/download/', { trip_ids: tripIds, format }, { 
    responseType: format === 'pdf' ? 'blob' : 'text' 
  });

// Subscriptions
export const getSubscriptions = () => api.get('subscriptions/');
export const subscribe = (userId) => api.post('subscriptions/', { target_user: userId });
export const unsubscribe = (id) => api.delete(`subscriptions/${id}/`);
export const getSubscriptionTrips = () => api.get('subscription-trips/');

export default api;