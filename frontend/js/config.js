// Dynamic API Base URL Configuration
// Pre-configured to point to the deployed Vercel backend
const API_BASE_URL = (() => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  // Local development on unified port 5000
  if (origin.includes(':5000')) {
    return `${origin}/api`;
  }

  // Local static dev servers (e.g. Live Server on :5500, file://)
  if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.startsWith('file:')) {
    return 'http://localhost:5000/api';
  }

  // Production backend URL (configurable via window.BACKEND_API_URL or localStorage)
  const configuredBackend = (typeof window !== 'undefined' && (window.BACKEND_API_URL || localStorage.getItem('clothswap_backend_url'))) || 'https://clothing-exchange-backend.vercel.app';
  return configuredBackend.replace(/\/$/, '') + '/api';
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
