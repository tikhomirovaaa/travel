import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const SubscriptionsContext = createContext();

export const SubscriptionsProvider = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  // Загрузка подписок текущего пользователя
  const fetchSubscriptions = async () => {
    try {
      console.log('tut')
      setLoading(true);
      const response = await api.getSubscriptions();
      console.log(user)
      setSubscriptions(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  // Подписаться на пользователя
  const subscribe = async (targetUserId) => {
    try {
      await api.subscribeToUser(targetUserId);
      await fetchSubscriptions(); // Обновляем список после подписки
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Subscription failed' 
      };
    }
  };

  // Отписаться от пользователя
  const unsubscribe = async (targetUserId) => {
    try {
      await api.unsubscribeFromUser(targetUserId);
      await fetchSubscriptions(); // Обновляем список после отписки
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Unsubscription failed' 
      };
    }
  };

  // Проверить статус подписки
  const checkSubscription = (targetUserId) => {
    return subscriptions.some(sub => sub.target_user.id === targetUserId);
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return (
    <SubscriptionsContext.Provider
      value={{
        subscriptions,
        loading,
        error,
        subscribe,
        unsubscribe,
        checkSubscription,
        refetch: fetchSubscriptions
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
};

export const useSubscriptions = () => {
  const context = useContext(SubscriptionsContext);
  if (!context) {
    throw new Error('useSubscriptions must be used within a SubscriptionsProvider');
  }
  return context;
};