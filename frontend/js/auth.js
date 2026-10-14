// Authentication Logic for Login and Registration Pages

document.addEventListener('DOMContentLoaded', () => {
  // If user is already logged in, redirect them to dashboard
  const token = getToken();
  const currentPage = window.location.pathname;
  if (token && (currentPage.includes('login.html') || currentPage.includes('register.html'))) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Handle Login Form Submission
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      if (!email || !password) {
        showAlert('alertBox', 'Please enter both email and password', 'error');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        let data = null;
        try {
          data = await response.json();
        } catch (_) {
          data = null;
        }

        if (response.ok && data && data.success) {
          showAlert('alertBox', 'Login successful! Redirecting...', 'success');
          setToken(data.token);
          setUser(data.user);
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 800);
        } else {
          const errorMsg = (data && (data.message || data.error))
            || (response.status === 401 ? 'Invalid email or password' : null)
            || (response.status === 503 ? 'Database connection is initializing. Please try again in a few seconds.' : null)
            || `Login failed (HTTP ${response.status}: ${response.statusText || 'Error'})`;
          showAlert('alertBox', errorMsg, 'error');
        }
      } catch (error) {
        console.error('Login error:', error);
        const netMsg = error.name === 'TypeError' || error.message.includes('fetch')
          ? `Could not reach backend API at ${API_BASE_URL}. Please verify network connection or CORS settings.`
          : `Login error: ${error.message}`;
        showAlert('alertBox', netMsg, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    });
  }

  // Handle Registration Form Submission
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const phone = document.getElementById('phone').value.trim();
      const location = document.getElementById('location').value.trim();
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      if (!name || !email || !password) {
        showAlert('alertBox', 'Please fill in all required fields (*)', 'error');
        return;
      }

      if (password.length < 6) {
        showAlert('alertBox', 'Password must be at least 6 characters long', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showAlert('alertBox', 'Passwords do not match', 'error');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';

        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, phone, location })
        });

        let data = null;
        try {
          data = await response.json();
        } catch (_) {
          data = null;
        }

        if (response.ok && data && data.success) {
          showAlert('alertBox', 'Account created successfully! Redirecting...', 'success');
          setToken(data.token);
          setUser(data.user);
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 1000);
        } else {
          const errorMsg = (data && (data.message || data.error))
            || (response.status === 400 ? 'Please check your registration details' : null)
            || (response.status === 503 ? 'Database connection is initializing. Please try again shortly.' : null)
            || `Registration failed (HTTP ${response.status}: ${response.statusText || 'Error'})`;
          showAlert('alertBox', errorMsg, 'error');
        }
      } catch (error) {
        console.error('Registration error:', error);
        const netMsg = error.name === 'TypeError' || error.message.includes('fetch')
          ? `Could not reach backend API at ${API_BASE_URL}. Please verify network connection or CORS settings.`
          : `Registration error: ${error.message}`;
        showAlert('alertBox', netMsg, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
      }
    });
  }
});

// Quick fill helper functions for testing demo credentials
function fillDemo(email, password) {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  if (emailInput && passwordInput) {
    emailInput.value = email;
    passwordInput.value = password;
  }
}
