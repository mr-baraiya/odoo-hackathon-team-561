import api from './api';

export const getSubscriptions = async () => {
  try {
    const res = await api.get('/subscriptions');
    return res.data;
  } catch (err) {
    return null;
  }
};

export const updateSubscription = async (id, data) => {
  try {
    const res = await api.put(`/subscriptions/${id}`, data);
    return res.data;
  } catch (err) {
    return null;
  }
};
