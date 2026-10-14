// Dynamic API Base URL Configuration
// - On Vercel (production): frontend & backend share same domain → use relative /api
// - Locally on port 5000: use full origin
// - Locally via file:// or Live Server: fallback to localhost:5000
const API_BASE_URL = (() => {
  const origin = window.location.origin;
  if (origin.includes('localhost:5000') || origin.includes('127.0.0.1:5000')) {
    return `${origin}/api`;
  }
  if (origin.startsWith('http') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
    // Production (Vercel or any live domain) — same-origin API
    return `${origin}/api`;
  }
  // Fallback: local dev without port 5000
  return 'http://localhost:5000/api';
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
