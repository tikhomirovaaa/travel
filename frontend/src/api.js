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

export const subscribeToUser = (userId) => {
  return api.post('subscriptions/', { target_user: userId });
};

export const unsubscribeFromUser = (subscriptionId) => {
  return api.delete(`subscriptions/${subscriptionId}/`);
};

export const getSubscriptions = (userId) => {
  return api.get(`subscriptions/?subscriber=${userId}`);
};

export const getSubscribers = (userId) => {
  return api.get(`subscriptions/?target_user=${userId}`);
};

export const getSubscriptionStatus = async (subscriberId, targetUserId) => {
  const response = await api.get(`subscriptions/?subscriber=${subscriberId}&target_user=${targetUserId}`);
  return response.data.length > 0 ? response.data[0].id : null;
};

export const login = (credentials) => api.post('auth/token/login/', credentials);
export const registerUser = (data) => api.post('auth/users/', data);
export const logout = () => api.post('auth/token/logout/');
export const getTrips = (params = {}) => api.get('trips/', { params });
export const getTrip = (id) => api.get(`trips/${id}/`);
export const createTrip = (data) => {
  const formData = new FormData();
  
  formData.append('title', data.get('title'));
  formData.append('description', data.get('description'));
  
  const images = data.getAll('images');
  images.forEach(image => {
    if (image) formData.append('images', image);
  });
  
  const tags = data.getAll('tags');
  tags.forEach(tag => {
    if (tag) formData.append('tags', tag);
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
export const checkWishlist = async (tripId) => {
  try {
    const response = await api.get('wishlist/');
    const wishlistItem = response.data.find(item => item.trip.id === tripId);
    return {
      exists: !!wishlistItem,
      id: wishlistItem?.id || null
    };
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return { exists: false, id: null };
  }
};

export const addToWishlist = async (tripId, notes = '') => {
  try {
    const response = await api.post('wishlist/', {
      trip: tripId,
      notes: notes
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = (id) => api.delete(`wishlist/${id}/`);
export const downloadWishlist = (tripIds, format) => {
  return api.post('wishlist/download/', { 
    trip_ids: tripIds,
    format: format
  }, { 
    responseType: 'blob'
  });
};

export default api;