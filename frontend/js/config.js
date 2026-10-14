// Primary Deployed Backend Base URL (Vercel)
const PROD_BACKEND_URL = 'https://clothing-exchange-backend.vercel.app';

// Dynamic API Base URL Configuration
const API_BASE_URL = (() => {
  if (typeof window !== 'undefined') {
    // 1. Explicit window or localStorage override
    if (window.BACKEND_API_URL) {
      return window.BACKEND_API_URL.replace(/\/$/, '') + '/api';
    }
    const custom = localStorage.getItem('clothswap_backend_url');
    if (custom) {
      return custom.replace(/\/$/, '') + '/api';
    }
    // 2. Only use local port 5000 if frontend is served by local backend on :5000
    if (window.location.origin.includes(':5000')) {
      return `${window.location.origin}/api`;
    }
  }

  // 3. Default to the verified deployed Vercel backend API
  return `${PROD_BACKEND_URL}/api`;
})();

// Helper to extract a friendly error message from any fetch response
const parseApiError = async (response, fallbackMsg = 'Request failed') => {
  try {
    const text = await response.text();
    try {
      const json = JSON.parse(text);
      return json.message || json.error || fallbackMsg;
    } catch (_) {
      return text && text.length < 150 ? text : `${fallbackMsg} (Status ${response.status})`;
    }
  } catch (_) {
    return `${fallbackMsg} (Status ${response.status})`;
  }
};


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
