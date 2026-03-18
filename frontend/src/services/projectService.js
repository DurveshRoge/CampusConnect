import api from './api';

// --- Existing Functions ---

export const getProjects = async (tech) => {
  const params = tech ? { tech } : {};
  const response = await api.get('/projects', { params });
  return response.data?.data?.projects || [];
};

export const getProjectById = async (id) => {
  const response = await api.get(`/projects/${id}`);
  return response.data?.data?.project;
};

export const getUserProjects = async (userId) => {
  const response = await api.get(`/projects/user/${userId}`);
  return response.data?.data?.projects || [];
};

export const createProject = async (data) => {
  const response = await api.post('/projects', data);
  return response.data?.data?.project;
};

export const updateProject = async (id, data) => {
  const response = await api.patch(`/projects/${id}`, data);
  return response.data?.data?.project;
};

export const deleteProject = async (id) => {
  await api.delete(`/projects/${id}`);
};

// --- The Fix for your SyntaxError ---

/**
 * We define the function logic here.
 */
export const toggleLikeProject = async (id) => {
  const response = await api.post(`/projects/${id}/like`);
  return response.data?.data;
};

/**
 * ALIAS: We also export it as 'likeProject' 
 * This ensures ProjectDetailPage.jsx (which asks for likeProject) 
 * and ProjectsPage.jsx (which asks for toggleLikeProject) BOTH work.
 */
export const likeProject = toggleLikeProject;

/**
 * Optional: Add a comment to a project
 */
export const commentProject = async (id, text) => {
  const response = await api.post(`/projects/${id}/comment`, { text });
  return response.data?.data;
};