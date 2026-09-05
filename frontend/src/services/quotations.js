import api from './api';

export const getQuotations = async () => {
  try {
    const res = await api.get('/quotations');
    return res.data;
  } catch (err) {
    console.warn('API error in getQuotations, using local state');
    return null;
  }
};

export const getQuotation = async (id) => {
  try {
    const res = await api.get(`/quotations/${id}`);
    return res.data;
  } catch (err) {
    console.warn(`API error in getQuotation ${id}`);
    return null;
  }
};

export const createQuotation = async (data) => {
  try {
    const res = await api.post('/quotations', data);
    return res.data;
  } catch (err) {
    console.warn('API error in createQuotation');
    return null;
  }
};

export const updateQuotation = async (id, data) => {
  try {
    const res = await api.put(`/quotations/${id}`, data);
    return res.data;
  } catch (err) {
    console.warn(`API error in updateQuotation ${id}`);
    return null;
  }
};

export const submitForApproval = async (id) => {
  try {
    const res = await api.post(`/quotations/${id}/submit`);
    return res.data;
  } catch (err) {
    console.warn(`API error in submitForApproval ${id}`);
    return null;
  }
};
