import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8000/api/'  // Используем localhost для разработки
    : '/api/',
});

export const getTrips = () => api.get('trips/');
export const getTrip = (id) => api.get(`trips/${id}/`);
export const getUser = (username) => api.get(`users/?username=${username}`);
export const login = (credentials) => api.post('auth/token/login/', credentials);
export const registerUser = (data) => api.post('auth/users/', data);
export const addToWishlist = (tripId) => api.post('wishlist/', { trip: tripId });
export const getWishlist = () => api.get('wishlist/');