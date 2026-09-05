import api from './api';

export const getProducts = async () => {
  try {
    const res = await api.get('/products');
    return res.data;
  } catch (err) {
    return null;
  }
};

export const createProduct = async (productData) => {
  try {
    const res = await api.post('/products', productData);
    return res.data;
  } catch (err) {
    return null;
  }
};
