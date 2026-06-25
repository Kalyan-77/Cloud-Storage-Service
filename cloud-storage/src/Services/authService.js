import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(name, email, password) {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout', {});
    return response.data;
  },

  async checkSession() {
    const response = await api.get('/auth/checkSession');
    return response.data;
  },

  async getUserProfile(userId) {
    const response = await api.get(`/auth/${userId}`);
    return response.data;
  },

  async updateAuthProfile(userId, data) {
    const response = await api.put(`/auth/update/${userId}`, data);
    return response.data;
  },

  async deleteAccount(userId) {
    const response = await api.delete(`/auth/delete/${userId}`);
    return response.data;
  },

  async forgetPassword(email, password) {
    const response = await api.put(`/auth/forgetPassword`, { email, password });
    return response.data;
  },

  async changePassword(userId, currentPassword, newPassword) {
    const response = await api.put(`/auth/change-password/${userId}`, { currentPassword, newPassword });
    return response.data;
  },

  async updateWhatsAppProfile(formData) {
    const response = await api.put('/profile/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async disconnectGoogleDrive() {
    const response = await api.delete('/auth/google/disconnect');
    return response.data;
  },
};
