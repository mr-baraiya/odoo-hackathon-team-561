import api from './api';

export const getApprovals = async () => {
  try {
    const res = await api.get('/approvals');
    return res.data;
  } catch (err) {
    return null;
  }
};

export const approveQuotation = async (id, notes = '') => {
  try {
    const res = await api.post(`/approvals/${id}/approve`, { notes });
    return res.data;
  } catch (err) {
    return null;
  }
};

export const rejectQuotation = async (id, reason) => {
  try {
    const res = await api.post(`/approvals/${id}/reject`, { reason });
    return res.data;
  } catch (err) {
    return null;
  }
};

export const returnQuotation = async (id, notes) => {
  try {
    const res = await api.post(`/approvals/${id}/return`, { notes });
    return res.data;
  } catch (err) {
    return null;
  }
};
