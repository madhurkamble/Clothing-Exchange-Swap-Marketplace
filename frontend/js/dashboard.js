// Dashboard Logic: Profile loading, authentication verification, dynamic stats and recent listings

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

  // Load and render user profile and marketplace stats
  await loadUserProfile(token);
  await loadDashboardStats(token);
});

async function loadUserProfile(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      logout();
      return;
    }

    const data = await response.json();
    if (data.success && data.user) {
      const user = data.user;
      setUser(user);

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

async function loadDashboardStats(token) {
  try {
    // 1. Fetch user's own items
    const myRes = await fetch(`${API_BASE_URL}/clothing/my/items`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const myData = await myRes.json();
    
    if (myRes.ok && myData.success) {
      const countEl = document.getElementById('statMyListings');
      if (countEl) countEl.textContent = myData.count;
      renderRecentWardrobe(myData.data || []);
    }

    // 2. Fetch total marketplace available items
    const marketRes = await fetch(`${API_BASE_URL}/clothing?status=Available`);
    const marketData = await marketRes.json();
    
    if (marketRes.ok && marketData.success) {
      const countEl = document.getElementById('statMarketplace');
      if (countEl) countEl.textContent = marketData.count;
    }
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
  }
}

function renderRecentWardrobe(items) {
  const container = document.getElementById('recentWardrobeContainer');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 2.5rem 1rem;">
        <div class="empty-icon" style="font-size: 2.2rem;">👚</div>
        <p style="color: var(--text-muted); margin-bottom: 1rem;">You haven't listed any clothing items yet.</p>
        <a href="listings.html" class="btn btn-primary btn-sm">+ List Your First Item</a>
      </div>
    `;
    return;
  }

  // Display up to 3 recent items
  const recentItems = items.slice(0, 3);
  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
      ${recentItems.map(item => `
        <div class="card" style="padding: 1rem; display: flex; gap: 0.85rem; align-items: center;">
          <img src="${item.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=300&q=80'}" 
               style="width: 65px; height: 65px; border-radius: var(--radius-sm); object-fit: cover;" 
               alt="${item.title}">
          <div style="flex: 1; min-width: 0;">
            <h4 style="font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #0f172a;">${item.title}</h4>
            <p style="font-size: 0.8rem; color: var(--text-muted);">${item.brand} • Size: ${item.size}</p>
            <span class="badge" style="margin-top: 0.25rem; font-size: 0.7rem; ${item.status === 'Available' ? 'background: #d1fae5; color: #065f46;' : 'background: #fef3c7; color: #92400e;'}">
              ${item.status} (~$${item.estimatedValue})
            </span>
          </div>
          <div>
            <a href="item-details.html?id=${item._id}" class="btn btn-outline btn-sm">View</a>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
