import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });

export const getBoards = () => api.get('/boards');
export const getBoard = (id) => api.get(`/boards/${id}`);
export const createBoard = (data) => api.post('/boards', data);
export const updateBoard = (id, data) => api.put(`/boards/${id}`, data);
export const deleteBoard = (id) => api.delete(`/boards/${id}`);

export const getLists = (boardId) => api.get(`/lists/board/${boardId}`);
export const createList = (boardId, data) => api.post(`/lists/board/${boardId}`, data);
export const updateList = (id, data) => api.put(`/lists/${id}`, data);
export const deleteList = (id) => api.delete(`/lists/${id}`);
export const reorderLists = (lists) => api.put('/lists/reorder', { lists });

export const getCards = (listId) => api.get(`/lists/${listId}/cards`);
export const createCard = (listId, data) => api.post(`/lists/${listId}/cards`, data);
export const getCard = (id) => api.get(`/cards/${id}`);
export const updateCard = (id, data) => api.put(`/cards/${id}`, data);
export const deleteCard = (id) => api.delete(`/cards/${id}`);
export const reorderCards = (cards) => api.put('/cards/reorder', { cards });
export const searchCards = (params) => api.get('/cards/search', { params });
export const getLabels = () => api.get('/cards/labels');

export const addLabel = (cardId, labelId) => api.post(`/cards/${cardId}/labels`, { labelId });
export const removeLabel = (cardId, labelId) => api.delete(`/cards/${cardId}/labels/${labelId}`);
export const addMember = (cardId, memberId) => api.post(`/cards/${cardId}/members`, { memberId });
export const removeMember = (cardId, memberId) => api.delete(`/cards/${cardId}/members/${memberId}`);
export const addChecklistItem = (cardId, content) => api.post(`/cards/${cardId}/checklist`, { content });
export const updateChecklistItem = (cardId, itemId, data) => api.put(`/cards/${cardId}/checklist/${itemId}`, data);
export const deleteChecklistItem = (cardId, itemId) => api.delete(`/cards/${cardId}/checklist/${itemId}`);

export const getMembers = () => api.get('/members');
