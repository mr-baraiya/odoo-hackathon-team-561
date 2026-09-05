import api from './api';

export const getFulfillments = async () => {
  try {
    const res = await api.get('/fulfillment');
    return res.data;
  } catch (err) {
    return null;
  }
};

export const acceptWarehouseSplit = async (orderId) => {
  try {
    const res = await api.post(`/fulfillment/${orderId}/accept-split`);
    return res.data;
  } catch (err) {
    return null;
  }
};
