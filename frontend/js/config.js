// Dynamic API Base URL Configuration
// When frontend & backend are deployed as separate Vercel projects:
// - Set window.BACKEND_API_URL, or
// - Save in localStorage: localStorage.setItem('clothswap_backend_url', 'https://your-backend.vercel.app')
const CUSTOM_BACKEND_URL = (typeof window !== 'undefined' && (window.BACKEND_API_URL || localStorage.getItem('clothswap_backend_url'))) || '';

const API_BASE_URL = (() => {
  if (CUSTOM_BACKEND_URL) {
    return CUSTOM_BACKEND_URL.replace(/\/$/, '') + '/api';
  }

  const origin = window.location.origin;

  // Local development on unified port 5000
  if (origin.includes(':5000')) {
    return `${origin}/api`;
  }

  // Local static servers (e.g. Live Server on :5500, file://, etc.)
  if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.startsWith('file:')) {
    return 'http://localhost:5000/api';
  }

  // Production same-origin default
  return `${origin}/api`;
})();

// Token Management
const getToken = () => localStorage.getItem('clothswap_token');
const setToken = (token) => localStorage.setItem('clothswap_token', token);
const removeToken = () => localStorage.removeItem('clothswap_token');

// User Profile Management
const getUser = () => {
  const user = localStorage.getItem('clothswap_user');
  return user ? JSON.parse(user) : null;
};
const setUser = (user) => localStorage.setItem('clothswap_user', JSON.stringify(user));
const removeUser = () => localStorage.removeItem('clothswap_user');

// Authentication State Helpers
const isAuthenticated = () => !!getToken();

// Logout Function
const logout = () => {
  removeToken();
  removeUser();
  window.location.href = 'login.html';
};

// UI Notification Helper
const showAlert = (containerId, message, type = 'error') => {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.className = `alert alert-${type}`;
  container.innerHTML = `<span>${message}</span>`;
  container.classList.remove('alert-hidden');

  // Auto hide after 5 seconds if not persistent
  setTimeout(() => {
    container.classList.add('alert-hidden');
  }, 5000);
};
