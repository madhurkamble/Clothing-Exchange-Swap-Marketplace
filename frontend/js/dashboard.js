// Dashboard Logic: Profile loading, authentication verification, logout

document.addEventListener('DOMContentLoaded', async () => {
  const token = getToken();

  // Route protection: redirect to login if not authenticated
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Bind Logout Button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }

  // Load and render user profile
  await loadUserProfile(token);
});

async function loadUserProfile(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      // Invalid/expired token
      logout();
      return;
    }

    const data = await response.json();
    if (data.success && data.user) {
      const user = data.user;
      setUser(user); // Cache updated user data

      // Update UI elements
      const userNameEl = document.getElementById('userName');
      const userEmailEl = document.getElementById('userEmail');
      const userLocationEl = document.getElementById('userLocation');
      const userRoleBadgeEl = document.getElementById('userRoleBadge');
      const welcomeNameEl = document.getElementById('welcomeName');
      const userAvatarEl = document.getElementById('userAvatar');

      if (userNameEl) userNameEl.textContent = user.name;
      if (userEmailEl) userEmailEl.textContent = user.email;
      if (userLocationEl) userLocationEl.textContent = user.location || 'Location not set';
      if (welcomeNameEl) welcomeNameEl.textContent = user.name;
      
      if (userRoleBadgeEl) {
        userRoleBadgeEl.textContent = user.role.toUpperCase();
        userRoleBadgeEl.className = `badge badge-${user.role}`;
      }

      if (userAvatarEl && user.profileImage) {
        userAvatarEl.src = user.profileImage;
        userAvatarEl.alt = user.name;
      }
    }
  } catch (error) {
    console.error('Failed to load user profile:', error);
  }
}
