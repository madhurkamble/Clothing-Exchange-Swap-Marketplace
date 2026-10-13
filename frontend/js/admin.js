// Admin Panel JavaScript: Role verification, analytics, user management, clothing moderation & swap monitoring

let adminData = {
  analytics: null,
  users: [],
  clothing: [],
  swaps: []
};

document.addEventListener('DOMContentLoaded', async () => {
  const token = getToken();
  const user = getUser();

  // Guard: Admin Authorization Check
  if (!token || !user || user.role !== 'admin') {
    alert('Access Forbidden: Admin privileges required to view this panel.');
    window.location.href = 'dashboard.html';
    return;
  }

  // Setup tab switcher
  setupAdminTabs();

  // Load all admin modules
  await loadAnalytics(token);
  await loadUsers(token);
  await loadListings(token);
  await loadSwaps(token);
});

function setupAdminTabs() {
  const tabs = document.querySelectorAll('.admin-tab-btn');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');

      const targetSection = btn.getAttribute('data-target');
      document.querySelectorAll('.admin-section').forEach(sec => {
        sec.style.display = 'none';
      });

      const activeSec = document.getElementById(targetSection);
      if (activeSec) activeSec.style.display = 'block';
    });
  });
}

// 1. Platform Analytics
async function loadAnalytics(token) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/analytics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (res.ok && data.success) {
      const a = data.data;
      adminData.analytics = a;

      document.getElementById('metricTotalUsers').textContent = a.users.total;
      document.getElementById('metricTotalListings').textContent = a.listings.total;
      document.getElementById('metricAvailableListings').textContent = a.listings.available;
      document.getElementById('metricTotalSwaps').textContent = a.swaps.total;
      document.getElementById('metricCompletedSwaps').textContent = a.swaps.completed;
      document.getElementById('metricSuccessRate').textContent = `${a.swaps.successRate}%`;

      // Render Category Distribution
      const catContainer = document.getElementById('categoryBreakdown');
      if (catContainer && a.listings.byCategory) {
        catContainer.innerHTML = a.listings.byCategory.map(c => `
          <div style="background: white; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; color: #1e293b;">${c._id}</span>
            <span class="badge badge-user">${c.count} items</span>
          </div>
        `).join('');
      }
    }
  } catch (error) {
    console.error('Error loading analytics:', error);
  }
}

// 2. Manage Users
async function loadUsers(token) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (res.ok && data.success) {
      adminData.users = data.data || [];
      renderUsersTable(adminData.users);
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

function renderUsersTable(users) {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  tbody.innerHTML = users.map(u => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <img src="${u.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}" 
               style="width: 34px; height: 34px; border-radius: 50%; object-fit: cover;">
          <div>
            <strong>${escapeHtml(u.name)}</strong>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(u.location || 'Local')}</div>
          </div>
        </div>
      </td>
      <td>${escapeHtml(u.email)}</td>
      <td>
        <span class="badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}">
          ${u.role.toUpperCase()}
        </span>
      </td>
      <td>${u.listingsCount || 0}</td>
      <td>${u.swapsCount || 0}</td>
      <td>
        ${u.role !== 'admin' ? `
          <button class="btn btn-outline btn-sm" onclick="toggleUserRole('${u._id}', 'admin')">
            Make Admin
          </button>
        ` : `
          <button class="btn btn-outline btn-sm" onclick="toggleUserRole('${u._id}', 'user')">
            Set User
          </button>
        `}
      </td>
    </tr>
  `).join('');
}

async function toggleUserRole(userId, newRole) {
  if (!confirm(`Change this user's role to "${newRole}"?`)) return;
  const token = getToken();

  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role: newRole })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert(`User role changed to ${newRole}`);
      loadUsers(token);
      loadAnalytics(token);
    } else {
      alert(data.message || 'Error updating role');
    }
  } catch (error) {
    alert('Server error updating role');
  }
}

// 3. Manage Clothing Listings
async function loadListings(token) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/clothing`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (res.ok && data.success) {
      adminData.clothing = data.data || [];
      renderListingsTable(adminData.clothing);
    }
  } catch (error) {
    console.error('Error loading clothing:', error);
  }
}

function renderListingsTable(items) {
  const tbody = document.getElementById('listingsTableBody');
  if (!tbody) return;

  tbody.innerHTML = items.map(item => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <img src="${item.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=100&q=80'}" 
               style="width: 38px; height: 38px; border-radius: var(--radius-sm); object-fit: cover;">
          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(item.brand)} • Size: ${item.size}</div>
          </div>
        </div>
      </td>
      <td>${escapeHtml(item.category)}</td>
      <td>~$${item.estimatedValue}</td>
      <td>${escapeHtml(item.owner?.name || 'User')}</td>
      <td>
        <span class="badge ${item.status === 'Available' ? 'badge-user' : 'badge-admin'}">
          ${item.status}
        </span>
      </td>
      <td>
        <div style="display: flex; gap: 0.4rem;">
          <a href="item-details.html?id=${item._id}" class="btn btn-outline btn-sm" target="_blank">View</a>
          <button class="btn btn-danger btn-sm" onclick="removeListingModeration('${item._id}')">
            Remove
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function removeListingModeration(itemId) {
  if (!confirm('Are you sure you want to remove this listing for policy or inappropriate content moderation?')) return;
  const token = getToken();

  try {
    const res = await fetch(`${API_BASE_URL}/admin/clothing/${itemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert('Listing removed by administrator moderation.');
      loadListings(token);
      loadAnalytics(token);
    } else {
      alert(data.message || 'Error removing listing');
    }
  } catch (error) {
    alert('Server error deleting listing');
  }
}

// 4. Monitor Swap Requests
async function loadSwaps(token) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/swaps`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (res.ok && data.success) {
      adminData.swaps = data.data || [];
      renderSwapsTable(adminData.swaps);
    }
  } catch (error) {
    console.error('Error loading swaps:', error);
  }
}

function renderSwapsTable(swaps) {
  const tbody = document.getElementById('swapsTableBody');
  if (!tbody) return;

  tbody.innerHTML = swaps.map(s => `
    <tr>
      <td>${escapeHtml(s.requester?.name || 'User')}</td>
      <td>${escapeHtml(s.owner?.name || 'User')}</td>
      <td>
        <strong>${escapeHtml(s.offeredItem?.title || 'Garment')}</strong>
        <div style="font-size: 0.78rem; color: var(--text-muted);">~$${s.offeredItem?.estimatedValue || 0}</div>
      </td>
      <td>
        <strong>${escapeHtml(s.requestedItem?.title || 'Garment')}</strong>
        <div style="font-size: 0.78rem; color: var(--text-muted);">~$${s.requestedItem?.estimatedValue || 0}</div>
      </td>
      <td>
        <span class="badge ${s.status === 'Completed' ? 'badge-user' : 'badge-admin'}">
          ${s.status}
        </span>
      </td>
      <td>${new Date(s.createdAt).toLocaleDateString()}</td>
      <td>
        <a href="chat.html?swapId=${s._id}" class="btn btn-outline btn-sm">Inspect Chat</a>
      </td>
    </tr>
  `).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
