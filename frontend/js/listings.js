// Marketplace Listings and Wardrobe Management JavaScript

let activeTab = 'all'; // 'all' or 'mine'
let currentListings = [];

document.addEventListener('DOMContentLoaded', () => {
  // Check auth state to customize header
  const token = getToken();
  const user = getUser();

  // Setup tab listeners
  const tabAll = document.getElementById('tabAll');
  const tabMine = document.getElementById('tabMine');

  if (tabAll && tabMine) {
    tabAll.addEventListener('click', () => switchTab('all'));
    tabMine.addEventListener('click', () => {
      if (!getToken()) {
        showAlert('alertContainer', 'Please sign in to view your wardrobe items', 'info');
        setTimeout(() => { window.location.href = 'login.html'; }, 1000);
        return;
      }
      switchTab('mine');
    });
  }

  // Setup filter event listeners
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const sizeFilter = document.getElementById('sizeFilter');
  const conditionFilter = document.getElementById('conditionFilter');
  const locationFilter = document.getElementById('locationFilter');
  const resetBtn = document.getElementById('resetFiltersBtn');

  if (searchInput) searchInput.addEventListener('input', debounce(fetchAndRenderListings, 300));
  if (categoryFilter) categoryFilter.addEventListener('change', fetchAndRenderListings);
  if (sizeFilter) sizeFilter.addEventListener('change', fetchAndRenderListings);
  if (conditionFilter) conditionFilter.addEventListener('change', fetchAndRenderListings);
  if (locationFilter) locationFilter.addEventListener('input', debounce(fetchAndRenderListings, 300));

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (categoryFilter) categoryFilter.value = 'All';
      if (sizeFilter) sizeFilter.value = 'All';
      if (conditionFilter) conditionFilter.value = 'All';
      if (locationFilter) locationFilter.value = '';
      fetchAndRenderListings();
    });
  }

  // Modal for creating new listing
  setupCreateListingModal();

  // Initial fetch
  fetchAndRenderListings();
});

function switchTab(tab) {
  activeTab = tab;
  const tabAll = document.getElementById('tabAll');
  const tabMine = document.getElementById('tabMine');

  if (tab === 'all') {
    tabAll.classList.add('active');
    tabMine.classList.remove('active');
  } else {
    tabMine.classList.add('active');
    tabAll.classList.remove('active');
  }

  fetchAndRenderListings();
}

async function fetchAndRenderListings() {
  const container = document.getElementById('clothingGrid');
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
      <p style="color: var(--text-muted); font-size: 1.1rem;">Loading clothing items...</p>
    </div>
  `;

  try {
    const search = document.getElementById('searchInput')?.value.trim() || '';
    const category = document.getElementById('categoryFilter')?.value || 'All';
    const size = document.getElementById('sizeFilter')?.value || 'All';
    const condition = document.getElementById('conditionFilter')?.value || 'All';
    const location = document.getElementById('locationFilter')?.value.trim() || '';

    let url = `${API_BASE_URL}/clothing?`;
    const params = new URLSearchParams();

    if (search) params.append('search', search);
    if (category !== 'All') params.append('category', category);
    if (size !== 'All') params.append('size', size);
    if (condition !== 'All') params.append('condition', condition);
    if (location) params.append('location', location);

    if (activeTab === 'mine') {
      const user = getUser();
      if (user && user.id) {
        params.append('owner', user.id);
      }
    }

    url += params.toString();

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.success) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">⚠️</div>
          <h3>Failed to load clothing items</h3>
          <p>${data.message || 'Please verify the backend server is running.'}</p>
        </div>
      `;
      return;
    }

    currentListings = data.data || [];
    renderCards(currentListings, container);
  } catch (error) {
    console.error('Error fetching listings:', error);
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🔌</div>
        <h3>Server connection error</h3>
        <p>Could not connect to the API server at ${API_BASE_URL}</p>
      </div>
    `;
  }
}

function renderCards(items, container) {
  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">👕</div>
        <h3>No clothing items found</h3>
        <p>${activeTab === 'mine' ? 'You have not listed any clothing items yet. Click "+ Add Clothing Listing" to get started!' : 'Try adjusting your search keywords or clearing filters.'}</p>
      </div>
    `;
    return;
  }

  const currentUser = getUser();

  container.innerHTML = items.map(item => {
    const isOwner = currentUser && item.owner && (item.owner._id === currentUser.id || item.owner === currentUser.id);
    const ownerName = item.owner?.name || 'Community Member';
    const imageUrl = item.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80';

    return `
      <div class="clothing-card">
        <div class="clothing-image-container">
          <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80'">
          <div class="badge-tag-container">
            <span class="badge-condition">${escapeHtml(item.condition)}</span>
            ${item.status !== 'Available' ? `<span class="badge" style="background: #f59e0b; color: white;">${item.status}</span>` : ''}
          </div>
          <span class="badge-value">~$${item.estimatedValue}</span>
        </div>

        <div class="clothing-card-body">
          <div class="clothing-meta-tags">
            <span class="tag-pill">${escapeHtml(item.category)}</span>
            <span class="tag-pill tag-size">Size: ${escapeHtml(item.size)}</span>
          </div>

          <h3 class="clothing-title">${escapeHtml(item.title)}</h3>
          <p class="clothing-brand">${escapeHtml(item.brand)}</p>

          <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 1rem; flex: 1;">
            ${escapeHtml(item.description.length > 85 ? item.description.substring(0, 85) + '...' : item.description)}
          </p>

          <div class="clothing-footer">
            <span class="clothing-location">
              📍 ${escapeHtml(item.location)}
            </span>
            <span style="font-size: 0.8rem; color: var(--primary-color); font-weight: 600;">
              ${isOwner ? '👤 (Your Item)' : `By ${escapeHtml(ownerName.split(' ')[0])}`}
            </span>
          </div>

          <div style="margin-top: 1rem;">
            <a href="item-details.html?id=${item._id}" class="btn btn-outline btn-block btn-sm">
              View Details & Swap
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function setupCreateListingModal() {
  const modalOverlay = document.getElementById('createModal');
  const openBtn = document.getElementById('openCreateModalBtn');
  const closeBtn = document.getElementById('closeCreateModalBtn');
  const cancelBtn = document.getElementById('cancelCreateModalBtn');
  const form = document.getElementById('createListingForm');

  if (!modalOverlay || !openBtn) return;

  const openModal = () => {
    if (!getToken()) {
      showAlert('alertContainer', 'Please sign in to list clothes on the marketplace', 'info');
      setTimeout(() => { window.location.href = 'login.html'; }, 1000);
      return;
    }
    modalOverlay.classList.add('active');
  };

  const closeModal = () => {
    modalOverlay.classList.remove('active');
    if (form) form.reset();
  };

  openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Click outside to close
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Submit handler
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = getToken();
      if (!token) {
        alert('Please login first');
        window.location.href = 'login.html';
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const title = document.getElementById('itemTitle').value.trim();
      const description = document.getElementById('itemDescription').value.trim();
      const category = document.getElementById('itemCategory').value;
      const brand = document.getElementById('itemBrand').value.trim();
      const size = document.getElementById('itemSize').value;
      const condition = document.getElementById('itemCondition').value;
      const estimatedValue = document.getElementById('itemEstimatedValue').value;
      const image = document.getElementById('itemImage').value.trim();
      const location = document.getElementById('itemLocation').value.trim();

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Listing Item...';

        const response = await fetch(`${API_BASE_URL}/clothing`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title,
            description,
            category,
            brand,
            size,
            condition,
            estimatedValue,
            image,
            location
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          closeModal();
          showAlert('alertContainer', 'Clothing item listed successfully!', 'success');
          fetchAndRenderListings();
        } else {
          alert(data.message || 'Error listing item');
        }
      } catch (error) {
        console.error('Error creating listing:', error);
        alert('Server connection error. Please try again.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'List Item';
      }
    });
  }
}

// Helpers
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
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
