import axios from 'axios';

// In production (Vercel), REACT_APP_API_URL points to the Render backend.
// In development, it falls back to '' so the CRA proxy in package.json kicks in.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
});

export default api;
