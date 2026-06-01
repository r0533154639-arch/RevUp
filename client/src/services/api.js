const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  ...(localStorage.getItem('token') && {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  }),
});

const request = async (path, options = {}) => {
  const response = await fetch(`${BASE}${path}`, {
    headers: getHeaders(),
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

export const api = {
  get: (path) =>
    request(path),

  post: (path, body) =>
    request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: (path, body) =>
    request(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: (path) =>
    request(path, {
      method: 'DELETE',
    }),
};

