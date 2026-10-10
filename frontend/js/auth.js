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

        const data = await response.json();

        if (response.ok && data.success) {
          showAlert('alertBox', 'Login successful! Redirecting...', 'success');
          setToken(data.token);
          setUser(data.user);
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 800);
        } else {
          showAlert('alertBox', data.message || 'Login failed. Please check your credentials.', 'error');
        }
      } catch (error) {
        console.error('Login error:', error);
        showAlert('alertBox', 'Unable to connect to server. Ensure backend is running.', 'error');
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

        const data = await response.json();

        if (response.ok && data.success) {
          showAlert('alertBox', 'Account created successfully! Redirecting...', 'success');
          setToken(data.token);
          setUser(data.user);
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 1000);
        } else {
          showAlert('alertBox', data.message || 'Registration failed. Try again.', 'error');
        }
      } catch (error) {
        console.error('Registration error:', error);
        showAlert('alertBox', 'Unable to connect to server. Ensure backend is running.', 'error');
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
