// Item Details Page Logic: Fetch details, Owner Actions (Edit/Delete), Prepare Request Swap

let currentItem = null;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('id');

  if (!itemId) {
    showError('No item ID provided in URL');
    return;
  }

  await loadItemDetails(itemId);
  setupEditModal();
});

async function loadItemDetails(itemId) {
  const container = document.getElementById('itemDetailsContainer');
  try {
    const response = await fetch(`${API_BASE_URL}/clothing/${itemId}`);
    const data = await response.json();

    if (!response.ok || !data.success || !data.data) {
      showError(data.message || 'Clothing item not found');
      return;
    }

    currentItem = data.data;
    renderItemDetails(currentItem);
  } catch (error) {
    console.error('Error loading item:', error);
    showError('Failed to load item details. Please check server connection.');
  }
}

function renderItemDetails(item) {
  const container = document.getElementById('itemDetailsContainer');
  const currentUser = getUser();
  const isOwner = currentUser && item.owner && (item.owner._id === currentUser.id || item.owner === currentUser.id);
  const isAdmin = currentUser && currentUser.role === 'admin';

  const imageUrl = item.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80';
  const ownerName = item.owner?.name || 'Sustainable Swapper';
  const ownerLocation = item.owner?.location || item.location || 'Local Area';
  const ownerAvatar = item.owner?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

  container.innerHTML = `
    <div style="margin-bottom: 1.5rem;">
      <a href="listings.html" style="color: var(--primary-color); font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
        ← Back to Marketplace
      </a>
    </div>

    <div class="item-details-layout">
      <!-- Image Column -->
      <div class="item-gallery-frame">
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.title)}" onerror="this.src='https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80'">
      </div>

      <!-- Info Column -->
      <div class="item-info-panel">
        <div class="item-badges-row">
          <span class="badge badge-user">${escapeHtml(item.category)}</span>
          <span class="badge" style="background: #e2e8f0; color: #1e293b;">Size: ${escapeHtml(item.size)}</span>
          <span class="badge" style="background: #e0f2fe; color: #0369a1;">${escapeHtml(item.condition)}</span>
          <span class="badge" style="${item.status === 'Available' ? 'background: #d1fae5; color: #065f46;' : 'background: #fef3c7; color: #92400e;'}">
            ● ${escapeHtml(item.status)}
          </span>
        </div>

        <h1 class="item-heading">${escapeHtml(item.title)}</h1>
        <p class="item-brand-sub">Brand: <strong>${escapeHtml(item.brand)}</strong></p>

        <!-- Swap Value Card -->
        <div class="item-val-card">
          <div>
            <div class="val-label">Estimated Swap Value</div>
            <p style="font-size: 0.85rem; color: #15803d;">Fair Barter Estimation</p>
          </div>
          <div class="val-amount">~$${item.estimatedValue}</div>
        </div>

        <!-- Specifications Grid -->
        <div class="specs-grid">
          <div class="spec-item">
            <h5>Category</h5>
            <p>${escapeHtml(item.category)}</p>
          </div>
          <div class="spec-item">
            <h5>Size</h5>
            <p>${escapeHtml(item.size)}</p>
          </div>
          <div class="spec-item">
            <h5>Condition</h5>
            <p>${escapeHtml(item.condition)}</p>
          </div>
          <div class="spec-item">
            <h5>Location</h5>
            <p>📍 ${escapeHtml(item.location)}</p>
          </div>
        </div>

        <!-- Description Box -->
        <div class="item-desc-box">
          <h4>Item Description</h4>
          <p style="color: #334155; line-height: 1.6; white-space: pre-line;">${escapeHtml(item.description)}</p>
        </div>

        <!-- Owner Profile Card -->
        <div class="owner-profile-card">
          <img src="${escapeHtml(ownerAvatar)}" alt="${escapeHtml(ownerName)}" class="owner-avatar">
          <div style="flex: 1;">
            <h4 style="font-size: 1rem; color: #0f172a;">${escapeHtml(ownerName)}</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Member from ${escapeHtml(ownerLocation)}</p>
          </div>
          ${isOwner ? '<span class="badge badge-user">Your Item</span>' : ''}
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          ${!isOwner ? `
            <button id="requestSwapBtn" class="btn btn-primary btn-block" style="font-size: 1.05rem; padding: 0.85rem 1.5rem;" ${item.status !== 'Available' ? 'disabled' : ''}>
              🔄 Request Swap
            </button>
          ` : `
            <button id="openEditBtn" class="btn btn-outline" style="flex: 1;">
              ✏️ Edit Listing
            </button>
            <button id="deleteBtn" class="btn btn-danger" style="flex: 1;">
              🗑️ Delete Listing
            </button>
          `}
        </div>

        ${!isOwner ? `
          <p style="font-size: 0.82rem; color: var(--text-muted); text-align: center; margin-top: 0.75rem;">
            🌱 100% Cash-free barter swap. You will offer one of your own wardrobe items in exchange.
          </p>
        ` : ''}
      </div>
    </div>
  `;

  // Attach button listeners
  const requestSwapBtn = document.getElementById('requestSwapBtn');
  if (requestSwapBtn) {
    requestSwapBtn.addEventListener('click', () => {
      if (!isAuthenticated()) {
        alert('Please sign in to send swap requests!');
        window.location.href = 'login.html';
        return;
      }
      alert('Day 3 Feature: The complete interactive swap request flow (selecting your item, value matching, and sending trade request) will be implemented in Day 3!');
    });
  }

  const openEditBtn = document.getElementById('openEditBtn');
  if (openEditBtn) {
    openEditBtn.addEventListener('click', populateAndOpenEditModal);
  }

  const deleteBtn = document.getElementById('deleteBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', handleDeleteListing);
  }
}

function showError(message) {
  const container = document.getElementById('itemDetailsContainer');
  if (container) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h2>Item Not Found</h2>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">${escapeHtml(message)}</p>
        <a href="listings.html" class="btn btn-primary">Return to Marketplace</a>
      </div>
    `;
  }
}

// Edit Modal Handling
function setupEditModal() {
  const modalOverlay = document.getElementById('editModal');
  const closeBtn = document.getElementById('closeEditModalBtn');
  const cancelBtn = document.getElementById('cancelEditModalBtn');
  const form = document.getElementById('editListingForm');

  if (!modalOverlay) return;

  const closeModal = () => modalOverlay.classList.remove('active');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = getToken();
      if (!token || !currentItem) return;

      const submitBtn = form.querySelector('button[type="submit"]');

      const title = document.getElementById('editTitle').value.trim();
      const description = document.getElementById('editDescription').value.trim();
      const category = document.getElementById('editCategory').value;
      const brand = document.getElementById('editBrand').value.trim();
      const size = document.getElementById('editSize').value;
      const condition = document.getElementById('editCondition').value;
      const estimatedValue = document.getElementById('editEstimatedValue').value;
      const image = document.getElementById('editImage').value.trim();
      const location = document.getElementById('editLocation').value.trim();
      const status = document.getElementById('editStatus').value;

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving Changes...';

        const response = await fetch(`${API_BASE_URL}/clothing/${currentItem._id}`, {
          method: 'PUT',
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
            location,
            status
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          closeModal();
          alert('Listing updated successfully!');
          currentItem = data.data;
          renderItemDetails(currentItem);
        } else {
          alert(data.message || 'Failed to update listing');
        }
      } catch (error) {
        console.error('Update error:', error);
        alert('Server connection error while updating listing');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';
      }
    });
  }
}

function populateAndOpenEditModal() {
  if (!currentItem) return;
  const modal = document.getElementById('editModal');
  if (!modal) return;

  document.getElementById('editTitle').value = currentItem.title || '';
  document.getElementById('editBrand').value = currentItem.brand || '';
  document.getElementById('editCategory').value = currentItem.category || 'Tops';
  document.getElementById('editSize').value = currentItem.size || 'M';
  document.getElementById('editCondition').value = currentItem.condition || 'Gently used';
  document.getElementById('editEstimatedValue').value = currentItem.estimatedValue || 0;
  document.getElementById('editLocation').value = currentItem.location || '';
  document.getElementById('editImage').value = currentItem.image || '';
  document.getElementById('editDescription').value = currentItem.description || '';
  document.getElementById('editStatus').value = currentItem.status || 'Available';

  modal.classList.add('active');
}

async function handleDeleteListing() {
  if (!confirm('Are you sure you want to permanently remove this clothing listing?')) {
    return;
  }

  const token = getToken();
  if (!token || !currentItem) return;

  try {
    const response = await fetch(`${API_BASE_URL}/clothing/${currentItem._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (response.ok && data.success) {
      alert('Listing deleted successfully!');
      window.location.href = 'listings.html';
    } else {
      alert(data.message || 'Failed to delete listing');
    }
  } catch (error) {
    console.error('Delete error:', error);
    alert('Server error deleting listing');
  }
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
