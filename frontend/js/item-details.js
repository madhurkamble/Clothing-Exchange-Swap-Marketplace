// Item Details Page Logic: Fetch details, Swap Proposal Flow, Value Calculator & Nearby City Matches

let currentItem = null;
let userAvailableItems = [];

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('id');

  if (!itemId) {
    showError('No item ID provided in URL');
    return;
  }

  await loadItemDetails(itemId);
  setupEditModal();
  setupSwapModal();
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
    loadNearbyMatches(currentItem);
  } catch (error) {
    console.error('Error loading item:', error);
    showError('Failed to load item details. Please check server connection.');
  }
}

function renderItemDetails(item) {
  const container = document.getElementById('itemDetailsContainer');
  const currentUser = getUser();
  const isOwner = currentUser && item.owner && (item.owner._id === currentUser.id || item.owner === currentUser.id);

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

    <!-- Nearby City Matches Section (Location Matching) -->
    <div style="margin-top: 3rem; border-top: 1px solid var(--border-color); padding-top: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <div>
          <h3 style="color: #0f172a; font-size: 1.35rem;">📍 Nearby Swap Opportunities</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Other available garments in ${escapeHtml(item.location.split(',')[0])} for convenient local exchanges.</p>
        </div>
      </div>
      <div id="nearbyGrid" class="clothing-grid" style="margin-bottom: 1rem;">
        <p style="color: var(--text-muted);">Looking for nearby listings...</p>
      </div>
    </div>
  `;

  // Attach button listeners
  const requestSwapBtn = document.getElementById('requestSwapBtn');
  if (requestSwapBtn) {
    requestSwapBtn.addEventListener('click', openSwapModal);
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

// Location Matching: Load nearby garments
async function loadNearbyMatches(item) {
  const container = document.getElementById('nearbyGrid');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE_URL}/clothing/nearby/matches?location=${encodeURIComponent(item.location)}&excludeId=${item._id}`);
    const data = await res.json();

    if (!res.ok || !data.success || !data.data || data.data.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 1.5rem; background: white; border: 1px dashed var(--border-color); border-radius: var(--radius-sm); text-align: center;">
          <p style="color: var(--text-muted); font-size: 0.92rem;">No other items listed in this specific city yet. Remote swaps via shipping are supported!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = data.data.map(nearbyItem => `
      <div class="clothing-card">
        <div class="clothing-image-container" style="height: 180px;">
          <img src="${nearbyItem.image}" alt="${nearbyItem.title}">
          <span class="badge-value">~$${nearbyItem.estimatedValue}</span>
        </div>
        <div class="clothing-card-body" style="padding: 1rem;">
          <span class="tag-pill" style="font-size: 0.7rem; align-self: flex-start; margin-bottom: 0.35rem;">${nearbyItem.category}</span>
          <h4 style="font-size: 0.95rem; margin-bottom: 0.25rem;">${escapeHtml(nearbyItem.title)}</h4>
          <p style="font-size: 0.8rem; color: var(--text-muted);">${nearbyItem.brand} • Size: ${nearbyItem.size}</p>
          <div style="margin-top: 0.75rem;">
            <a href="item-details.html?id=${nearbyItem._id}" class="btn btn-outline btn-block btn-sm">View Details</a>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    container.innerHTML = `<p style="color: var(--text-muted);">Could not fetch nearby items.</p>`;
  }
}

// Swap Request Proposal Modal with Interactive Value Calculator
function setupSwapModal() {
  const modal = document.getElementById('swapModal');
  const closeBtn = document.getElementById('closeSwapModalBtn');
  const cancelBtn = document.getElementById('cancelSwapModalBtn');
  const selectOffered = document.getElementById('selectOfferedItem');
  const form = document.getElementById('swapProposalForm');

  if (!modal) return;

  const closeModal = () => modal.classList.remove('active');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // When user selects a garment, update Swap Value Calculator in real-time!
  if (selectOffered) {
    selectOffered.addEventListener('change', () => {
      const selectedId = selectOffered.value;
      const offered = userAvailableItems.find(i => i._id === selectedId);
      updateSwapCalculatorDisplay(offered, currentItem);
    });
  }

  // Handle Swap Request Submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = getToken();
      if (!token || !currentItem) return;

      const offeredItemId = selectOffered.value;
      const message = document.getElementById('swapNote').value.trim();
      const submitBtn = form.querySelector('button[type="submit"]');

      if (!offeredItemId) {
        alert('Please select an item from your wardrobe to offer for this swap.');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting Request...';

        const response = await fetch(`${API_BASE_URL}/swaps`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            requestedItemId: currentItem._id,
            offeredItemId,
            message
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          closeModal();
          alert('Swap request submitted successfully! Redirecting to your Swap Inquiries...');
          window.location.href = 'swap-requests.html';
        } else {
          alert(data.message || 'Failed to submit swap request');
        }
      } catch (error) {
        console.error('Error submitting swap request:', error);
        alert('Server error creating swap request');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Swap Proposal';
      }
    });
  }
}

async function openSwapModal() {
  const token = getToken();
  if (!token) {
    alert('Please sign in to send swap requests!');
    window.location.href = 'login.html';
    return;
  }

  const modal = document.getElementById('swapModal');
  const select = document.getElementById('selectOfferedItem');
  if (!modal || !select) return;

  // Set target item preview
  document.getElementById('modalTargetTitle').textContent = currentItem.title;
  document.getElementById('modalTargetBrand').textContent = `${currentItem.brand} (Size: ${currentItem.size})`;
  document.getElementById('modalTargetVal').textContent = `~$${currentItem.estimatedValue}`;

  // Fetch current user's available items
  try {
    const res = await fetch(`${API_BASE_URL}/clothing/my/items`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (res.ok && data.success) {
      userAvailableItems = (data.data || []).filter(item => item.status === 'Available');

      if (userAvailableItems.length === 0) {
        select.innerHTML = `<option value="">-- No available items in your wardrobe --</option>`;
        document.getElementById('noItemsAlert').style.display = 'block';
        document.getElementById('swapCalcContainer').style.display = 'none';
      } else {
        document.getElementById('noItemsAlert').style.display = 'none';
        select.innerHTML = `
          <option value="">-- Choose an item to offer --</option>
          ${userAvailableItems.map(item => `
            <option value="${item._id}">
              ${escapeHtml(item.title)} (${item.brand}, Size: ${item.size}) — Est. ~$${item.estimatedValue}
            </option>
          `).join('')}
        `;
        document.getElementById('swapCalcContainer').style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Error loading user items:', error);
  }

  modal.classList.add('active');
}

function updateSwapCalculatorDisplay(offered, requested) {
  const calcBox = document.getElementById('swapCalcContainer');
  if (!calcBox) return;

  if (!offered || !requested) {
    calcBox.style.display = 'none';
    return;
  }

  calcBox.style.display = 'block';

  const valOffered = Number(offered.estimatedValue) || 0;
  const valRequested = Number(requested.estimatedValue) || 0;
  const diff = Math.abs(valOffered - valRequested);

  let statusText = 'Balanced Swap';
  let statusBadgeClass = 'badge-user';
  let advice = 'This exchange is very well-balanced! Both swappers receive equivalent wardrobe value.';

  if (diff <= 15) {
    statusText = 'Balanced Swap';
    statusBadgeClass = 'badge-user';
    advice = 'Fair & balanced trade. Garments have matching utility and condition.';
  } else if (diff <= 35) {
    statusText = 'Slight Difference';
    statusBadgeClass = 'badge-admin';
    advice = valOffered > valRequested 
      ? `Your item is valued slightly higher (~$${diff} difference).`
      : `The requested item has slightly higher value (~$${diff} difference). Add a friendly note!`;
  } else {
    statusText = 'Large Difference';
    statusBadgeClass = 'badge';
    advice = `Noticeable value difference (~$${diff} difference). The owner may consider if they are keen on your piece.`;
  }

  document.getElementById('calcOfferedVal').textContent = `$${valOffered}`;
  document.getElementById('calcRequestedVal').textContent = `$${valRequested}`;
  document.getElementById('calcDiff').textContent = `$${diff}`;
  
  const balanceEl = document.getElementById('calcBalanceStatus');
  balanceEl.textContent = statusText;
  balanceEl.className = `badge ${statusBadgeClass}`;

  document.getElementById('calcAdvice').textContent = advice;
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
