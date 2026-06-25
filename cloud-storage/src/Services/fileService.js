import api from './api';

export const fileService = {
  async getFiles() {
    const response = await api.get('/cloud/files');
    return response.data;
  },

  async getFilesByType(type) {
    const response = await api.get(`/cloud/files/type`, {
      params: { type },
    });
    return response.data;
  },

  async getFilesCount() {
    const response = await api.get('/cloud/filesCount');
    return response.data;
  },

  async getTotalStorage() {
    const response = await api.get('/cloud/totalStorage');
    return response.data;
  },

  async getFilesCountByType(type) {
    const response = await api.get('/cloud/filesCount/type', {
      params: { type },
    });
    return response.data;
  },

  async getStorageByType(type) {
    const response = await api.get('/cloud/StorageByType/type', {
      params: { type },
    });
    return response.data;
  },

  async searchFiles(searchTerm) {
    const response = await api.get('/cloud/search', {
      params: { name: searchTerm },
    });
    return response.data;
  },

  async uploadFile(formData) {
    const response = await api.post('/cloud/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async moveToTrash(fileId) {
    const response = await api.put(`/cloud/trash/${fileId}`);
    return response.data;
  },

  async downloadFile(fileId) {
    const response = await api.get(`/cloud/download/${fileId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async generateLink(fileId) {
    const response = await api.get(`/cloud/generate-link/${fileId}`);
    return response.data;
  },

  async makePublic(fileId) {
    const response = await api.post(`/cloud/public/${fileId}`);
    return response.data;
  },

  async renameFile(fileId, name) {
    const response = await api.put(`/cloud/updateFileName/${fileId}`, { name });
    return response.data;
  },

  // Bin pages
  async getBinFiles() {
    const response = await api.get('/cloud/bin');
    return response.data;
  },

  async restoreFile(fileId) {
    const response = await api.put(`/cloud/restore/${fileId}/`);
    return response.data;
  },

  async deleteFilePermanently(fileId) {
    const response = await api.delete(`/cloud/deletefiles/${fileId}`);
    return response.data;
  },
};

export default fileService;
