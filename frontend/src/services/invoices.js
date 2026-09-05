import api from './api';

export const getInvoices = async () => {
  try {
    const res = await api.get('/invoices');
    return res.data;
  } catch (err) {
    return null;
  }
};

export const recordPayment = async (id, paymentData) => {
  try {
    const res = await api.post(`/invoices/${id}/pay`, paymentData);
    return res.data;
  } catch (err) {
    return null;
  }
};
