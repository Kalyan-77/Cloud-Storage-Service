import api from './api';

export const configService = {
  async getConfig(userId) {
    const response = await api.get(`/config/get/${userId}`);
    return response.data;
  },

  async saveConfig(userId, requestBody) {
    const response = await api.post(`/config/save/${userId}`, requestBody);
    return response.data;
  },

  async fetchApps() {
    const response = await api.get('/apps/all');
    return response.data;
  },
};
export default configService;
