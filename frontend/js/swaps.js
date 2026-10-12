// Swap Requests Management Logic (Incoming, Outgoing, Actions, Value Comparison)

let currentTab = 'incoming';
let incomingSwaps = [];
let outgoingSwaps = [];

document.addEventListener('DOMContentLoaded', async () => {
  const token = getToken();

  // Route protection
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Setup Tab Listeners
  const tabIncoming = document.getElementById('tabIncoming');
  const tabOutgoing = document.getElementById('tabOutgoing');

  if (tabIncoming && tabOutgoing) {
    tabIncoming.addEventListener('click', () => switchTab('incoming'));
    tabOutgoing.addEventListener('click', () => switchTab('outgoing'));
  }

  await loadAllSwaps(token);
});

function switchTab(tab) {
  currentTab = tab;
  const tabIncoming = document.getElementById('tabIncoming');
  const tabOutgoing = document.getElementById('tabOutgoing');

  if (tab === 'incoming') {
    tabIncoming.classList.add('active');
    tabOutgoing.classList.remove('active');
    renderSwaps(incomingSwaps, 'incoming');
  } else {
    tabOutgoing.classList.add('active');
    tabIncoming.classList.remove('active');
    renderSwaps(outgoingSwaps, 'outgoing');
  }
}

async function loadAllSwaps(token) {
  const container = document.getElementById('swapsContainer');
  if (container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <p style="color: var(--text-muted); font-size: 1.1rem;">Loading swap requests...</p>
      </div>
    `;
  }

  try {
    // 1. Fetch Incoming
    const inRes = await fetch(`${API_BASE_URL}/swaps/incoming`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const inData = await inRes.json();
    if (inRes.ok && inData.success) {
      incomingSwaps = inData.data || [];
      const badgeIn = document.getElementById('countIncoming');
      if (badgeIn) badgeIn.textContent = incomingSwaps.length;
    }

    // 2. Fetch Outgoing
    const outRes = await fetch(`${API_BASE_URL}/swaps/outgoing`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const outData = await outRes.json();
    if (outRes.ok && outData.success) {
      outgoingSwaps = outData.data || [];
      const badgeOut = document.getElementById('countOutgoing');
      if (badgeOut) badgeOut.textContent = outgoingSwaps.length;
    }

    // Initial render
    renderSwaps(currentTab === 'incoming' ? incomingSwaps : outgoingSwaps, currentTab);
  } catch (error) {
    console.error('Error fetching swaps:', error);
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3>Failed to load swap inquiries</h3>
          <p>Please check your backend connection at ${API_BASE_URL}</p>
        </div>
      `;
    }
  }
}

function renderSwaps(swaps, type) {
  const container = document.getElementById('swapsContainer');
  if (!container) return;

  if (swaps.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🤝</div>
        <h3>No ${type === 'incoming' ? 'Incoming' : 'Outgoing'} Swap Inquiries</h3>
        <p>${type === 'incoming' 
          ? 'When other fashion swappers request to trade for your wardrobe items, their offers will appear here.' 
          : 'You haven\'t proposed any clothing swaps yet. Explore the marketplace to find pieces you love!'}</p>
        ${type === 'outgoing' ? '<a href="listings.html" class="btn btn-primary" style="margin-top: 1rem;">Browse Clothes to Swap</a>' : ''}
      </div>
    `;
    return;
  }

  container.innerHTML = swaps.map(swap => {
    const isIncoming = type === 'incoming';
    const otherUser = isIncoming ? swap.requester : swap.owner;
    const otherUserName = otherUser?.name || 'Community Swapper';
    const otherUserLoc = otherUser?.location || 'Local Area';

    const offered = swap.offeredItem || {};
    const requested = swap.requestedItem || {};

    const offeredVal = Number(offered.estimatedValue) || 0;
    const requestedVal = Number(requested.estimatedValue) || 0;
    const diff = Math.abs(offeredVal - requestedVal);

    // Value balance categorization
    let balanceTag = `<span class="badge" style="background: #d1fae5; color: #065f46;">⚖️ Balanced (Diff: ~$${diff})</span>`;
    if (diff > 15 && diff <= 35) {
      balanceTag = `<span class="badge" style="background: #fef3c7; color: #92400e;">⚖️ Slight Difference (~$${diff})</span>`;
    } else if (diff > 35) {
      balanceTag = `<span class="badge" style="background: #fee2e2; color: #991b1b;">⚖️ Value Difference (~$${diff})</span>`;
    }

    // Status badge style
    let statusBadge = `<span class="badge" style="background: #fef3c7; color: #92400e;">${swap.status}</span>`;
    if (swap.status === 'Accepted') statusBadge = `<span class="badge" style="background: #d1fae5; color: #065f46;">✓ Accepted</span>`;
    if (swap.status === 'Completed') statusBadge = `<span class="badge" style="background: #e0f2fe; color: #0369a1;">★ Completed</span>`;
    if (swap.status === 'Rejected') statusBadge = `<span class="badge" style="background: #fee2e2; color: #991b1b;">✕ Rejected</span>`;
    if (swap.status === 'Cancelled') statusBadge = `<span class="badge" style="background: #f1f5f9; color: #64748b;">Cancelled</span>`;

    // Local Location matching note
    const isNearby = offered.location && requested.location && 
                     (offered.location.toLowerCase().includes(requested.location.toLowerCase().split(',')[0]) ||
                      requested.location.toLowerCase().includes(offered.location.toLowerCase().split(',')[0]));

    return `
      <div class="card" style="margin-bottom: 1.5rem; border-left: 4px solid ${swap.status === 'Accepted' ? 'var(--primary-color)' : 'var(--accent-color)'};">
        <!-- Swap Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
          <div>
            <span style="font-size: 0.82rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">
              ${isIncoming ? 'Inquiry Received From' : 'Inquiry Sent To'}:
            </span>
            <strong style="color: #0f172a; margin-left: 0.35rem;">${escapeHtml(otherUserName)}</strong>
            <span style="color: var(--text-muted); font-size: 0.85rem;"> (📍 ${escapeHtml(otherUserLoc)})</span>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            ${balanceTag}
            ${statusBadge}
          </div>
        </div>

        <!-- Garments Comparison Box -->
        <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 1rem; align-items: center; background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 1rem;">
          <!-- Offered Item Column -->
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <img src="${offered.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=200&q=80'}" 
                 alt="${escapeHtml(offered.title)}" 
                 style="width: 75px; height: 75px; object-fit: cover; border-radius: var(--radius-sm);">
            <div>
              <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">
                ${isIncoming ? 'They Offer' : 'You Offer'}
              </span>
              <h4 style="font-size: 0.95rem; color: #0f172a; margin: 0.1rem 0;">${escapeHtml(offered.title || 'Garment')}</h4>
              <p style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(offered.brand || '')} • Size: ${escapeHtml(offered.size || '')}</p>
              <strong style="font-size: 0.85rem; color: var(--primary-color);">~$${offeredVal}</strong>
            </div>
          </div>

          <!-- Trade Arrow Icon -->
          <div style="text-align: center; font-size: 1.5rem; color: var(--primary-color);">
            ⇄
          </div>

          <!-- Requested Item Column -->
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <img src="${requested.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=200&q=80'}" 
                 alt="${escapeHtml(requested.title)}" 
                 style="width: 75px; height: 75px; object-fit: cover; border-radius: var(--radius-sm);">
            <div>
              <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">
                ${isIncoming ? 'In Exchange For Your' : 'They Receive'}
              </span>
              <h4 style="font-size: 0.95rem; color: #0f172a; margin: 0.1rem 0;">${escapeHtml(requested.title || 'Garment')}</h4>
              <p style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(requested.brand || '')} • Size: ${escapeHtml(requested.size || '')}</p>
              <strong style="font-size: 0.85rem; color: var(--primary-color);">~$${requestedVal}</strong>
            </div>
          </div>
        </div>

        <!-- Message Box if provided -->
        ${swap.message ? `
          <div style="background: white; border: 1px dashed var(--border-color); border-radius: var(--radius-sm); padding: 0.75rem 1rem; margin-bottom: 1rem;">
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted);">MESSAGE:</span>
            <p style="font-size: 0.88rem; color: #334155; margin-top: 0.2rem;">"${escapeHtml(swap.message)}"</p>
          </div>
        ` : ''}

        <!-- Location Compatibility Note -->
        <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.4rem;">
          ${isNearby 
            ? '📍 <strong style="color: #166534;">Nearby Location Match:</strong> Both items are in similar metropolitan areas. Easy in-person meetup possible.' 
            : '🚚 <strong style="color: #1e293b;">Inter-City Trade:</strong> Exchange can be organized via courier delivery or shipping.'}
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 0.75rem; justify-content: flex-end; flex-wrap: wrap;">
          ${isIncoming && swap.status === 'Pending' ? `
            <button class="btn btn-outline btn-sm" onclick="rejectSwap('${swap._id}')">
              ✕ Reject
            </button>
            <button class="btn btn-primary btn-sm" onclick="acceptSwap('${swap._id}')">
              ✓ Accept Swap
            </button>
          ` : ''}

          ${isIncoming && swap.status === 'Accepted' ? `
            <button class="btn btn-outline btn-sm" onclick="updateSwapStatus('${swap._id}', 'Completed')">
              ★ Mark Completed & Exchanged
            </button>
          ` : ''}

          ${!isIncoming && swap.status === 'Pending' ? `
            <button class="btn btn-danger btn-sm" onclick="cancelSwap('${swap._id}')">
              Cancel Request
            </button>
          ` : ''}

          ${!isIncoming && swap.status === 'Accepted' ? `
            <button class="btn btn-outline btn-sm" onclick="updateSwapStatus('${swap._id}', 'Completed')">
              ★ Mark Completed & Exchanged
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Action Handlers
async function acceptSwap(swapId) {
  if (!confirm('Accept this swap proposal? You will coordinate exchange details with the other member.')) return;
  const token = getToken();

  try {
    const res = await fetch(`${API_BASE_URL}/swaps/${swapId}/accept`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert('Swap request accepted!');
      loadAllSwaps(token);
    } else {
      alert(data.message || 'Error accepting swap');
    }
  } catch (error) {
    alert('Server error connecting to API');
  }
}

async function rejectSwap(swapId) {
  if (!confirm('Are you sure you want to decline this swap offer?')) return;
  const token = getToken();

  try {
    const res = await fetch(`${API_BASE_URL}/swaps/${swapId}/reject`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert('Swap request declined.');
      loadAllSwaps(token);
    } else {
      alert(data.message || 'Error rejecting swap');
    }
  } catch (error) {
    alert('Server error connecting to API');
  }
}

async function cancelSwap(swapId) {
  if (!confirm('Cancel your outgoing swap inquiry?')) return;
  const token = getToken();

  try {
    const res = await fetch(`${API_BASE_URL}/swaps/${swapId}/cancel`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert('Swap inquiry cancelled.');
      loadAllSwaps(token);
    } else {
      alert(data.message || 'Error cancelling swap');
    }
  } catch (error) {
    alert('Server error connecting to API');
  }
}

async function updateSwapStatus(swapId, newStatus) {
  if (!confirm(`Mark this swap as "${newStatus}"? Both garments will be recorded as successfully exchanged in wardrobe records.`)) return;
  const token = getToken();

  try {
    const res = await fetch(`${API_BASE_URL}/swaps/${swapId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert(`Swap status successfully updated to ${newStatus}!`);
      loadAllSwaps(token);
    } else {
      alert(data.message || 'Error updating status');
    }
  } catch (error) {
    alert('Server error connecting to API');
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
