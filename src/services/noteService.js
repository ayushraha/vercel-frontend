import api from './api';

export const noteService = {
  uploadNote: async (formData) => {
    const response = await api.post('/notes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getAllNotes: async (filters = {}) => {
    const response = await api.get('/notes', { params: filters });
    return response.data;
  },

  getNoteById: async (id) => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },

  updateNote: async (id, data) => {
    const response = await api.put(`/notes/${id}`, data);
    return response.data;
  },

  deleteNote: async (id) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },

  downloadNote: async (id) => {
    const response = await api.put(`/notes/${id}/download`);
    return response.data;
  }
};