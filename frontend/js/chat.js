// Negotiation Chat JavaScript: REST API messaging, swap status confirmation, live polling

let currentSwapId = null;
let currentSwap = null;
let pollInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
  const token = getToken();

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  currentSwapId = urlParams.get('swapId');

  if (!currentSwapId) {
    showChatError('No swap request specified. Please select a swap from your Swap Requests page.');
    return;
  }

  await loadConversation(true);

  // Setup message form
  const messageForm = document.getElementById('messageForm');
  if (messageForm) {
    messageForm.addEventListener('submit', handleSendMessage);
  }

  // Setup Confirm Swap button
  const confirmBtn = document.getElementById('confirmSwapBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', handleConfirmSwap);
  }

  // Poll for new messages every 4 seconds
  pollInterval = setInterval(() => {
    loadConversation(false);
  }, 4000);
});

// Clear polling on page unload
window.addEventListener('beforeunload', () => {
  if (pollInterval) clearInterval(pollInterval);
});

async function loadConversation(isInitial = false) {
  const token = getToken();
  if (!token || !currentSwapId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/chat/${currentSwapId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      if (isInitial) {
        showChatError(data.message || 'Unable to access conversation');
      }
      return;
    }

    currentSwap = data.swap;

    if (isInitial) {
      renderSwapHeader(currentSwap);
    }

    renderMessages(data.messages || []);
  } catch (error) {
    console.error('Error loading conversation:', error);
    if (isInitial) {
      showChatError('Server connection error. Please verify backend is running.');
    }
  }
}

function renderSwapHeader(swap) {
  const currentUser = getUser();
  const isRequester = currentUser && swap.requester && (swap.requester._id === currentUser.id || swap.requester.id === currentUser.id);
  const otherUser = isRequester ? swap.owner : swap.requester;
  const otherUserName = otherUser?.name || 'Community Member';
  const otherUserLoc = otherUser?.location || 'Local Area';

  const offered = swap.offeredItem || {};
  const requested = swap.requestedItem || {};

  document.getElementById('chatWithUser').textContent = otherUserName;
  document.getElementById('chatUserLocation').textContent = otherUserLoc;

  document.getElementById('offeredImg').src = offered.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=200&q=80';
  document.getElementById('offeredTitle').textContent = offered.title || 'Item';
  document.getElementById('offeredMeta').textContent = `${offered.brand || ''} (Size: ${offered.size || ''}) • ~$${offered.estimatedValue || 0}`;

  document.getElementById('requestedImg').src = requested.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=200&q=80';
  document.getElementById('requestedTitle').textContent = requested.title || 'Item';
  document.getElementById('requestedMeta').textContent = `${requested.brand || ''} (Size: ${requested.size || ''}) • ~$${requested.estimatedValue || 0}`;

  const statusBadge = document.getElementById('swapStatusBadge');
  statusBadge.textContent = swap.status;
  if (swap.status === 'Completed') {
    statusBadge.className = 'badge badge-user';
  } else if (swap.status === 'Confirmed') {
    statusBadge.className = 'badge badge-admin';
  } else {
    statusBadge.className = 'badge badge-user';
  }

  // Update Confirm Swap Button text/state
  const confirmBtn = document.getElementById('confirmSwapBtn');
  if (confirmBtn) {
    if (swap.status === 'Completed') {
      confirmBtn.textContent = '★ Swap Completed';
      confirmBtn.disabled = true;
      confirmBtn.className = 'btn btn-outline btn-sm';
    } else if (swap.status === 'Confirmed') {
      confirmBtn.textContent = '★ Finalize & Complete Swap';
      confirmBtn.className = 'btn btn-primary btn-sm';
    } else {
      confirmBtn.textContent = '🤝 Confirm Swap Agreement';
      confirmBtn.className = 'btn btn-primary btn-sm';
    }
  }
}

function renderMessages(messages) {
  const container = document.getElementById('messagesContainer');
  if (!container) return;

  const currentUser = getUser();
  const wasNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;

  if (messages.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">💬</div>
        <p style="font-weight: 600; color: #1e293b;">No messages yet.</p>
        <p style="font-size: 0.88rem;">Coordinate handover date, location, or courier details below!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = messages.map(msg => {
    const isMine = currentUser && msg.sender && (msg.sender._id === currentUser.id || msg.sender === currentUser.id);
    const senderName = msg.sender?.name || (isMine ? 'You' : 'Swapper');
    const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
      <div style="display: flex; justify-content: ${isMine ? 'flex-end' : 'flex-start'}; margin-bottom: 1rem;">
        <div style="max-width: 72%;">
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.2rem; text-align: ${isMine ? 'right' : 'left'};">
            ${isMine ? 'You' : escapeHtml(senderName)} • ${timeStr}
          </div>
          <div style="
            padding: 0.75rem 1rem;
            border-radius: var(--radius-md);
            font-size: 0.95rem;
            line-height: 1.45;
            background-color: ${isMine ? 'var(--primary-color)' : '#ffffff'};
            color: ${isMine ? '#ffffff' : '#1e293b'};
            border: 1px solid ${isMine ? 'transparent' : 'var(--border-color)'};
            box-shadow: var(--shadow-sm);
            word-wrap: break-word;
          ">
            ${escapeHtml(msg.message)}
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (wasNearBottom) {
    container.scrollTop = container.scrollHeight;
  }
}

async function handleSendMessage(e) {
  e.preventDefault();
  const token = getToken();
  const input = document.getElementById('messageInput');
  const message = input.value.trim();

  if (!message || !token || !currentSwapId) return;

  const submitBtn = document.getElementById('sendMessageBtn');
  submitBtn.disabled = true;

  try {
    const response = await fetch(`${API_BASE_URL}/chat/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        swapRequestId: currentSwapId,
        message
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      input.value = '';
      await loadConversation(false);
      const container = document.getElementById('messagesContainer');
      if (container) container.scrollTop = container.scrollHeight;
    } else {
      alert(data.message || 'Failed to send message');
    }
  } catch (error) {
    console.error('Send error:', error);
    alert('Server error sending message');
  } finally {
    submitBtn.disabled = false;
  }
}

async function handleConfirmSwap() {
  if (!currentSwap) return;
  const token = getToken();

  const nextStatus = currentSwap.status === 'Confirmed' ? 'Completed' : 'Confirmed';
  const confirmText = nextStatus === 'Completed'
    ? 'Mark this exchange as Fully Completed? Both garments will be recorded as successfully exchanged in the system.'
    : 'Confirm this swap agreement? This indicates both parties have agreed on exchange details.';

  if (!confirm(confirmText)) return;

  try {
    const res = await fetch(`${API_BASE_URL}/swaps/${currentSwap._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: nextStatus })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      alert(`Swap successfully updated to ${nextStatus}!`);
      loadConversation(true);
    } else {
      alert(data.message || 'Error updating status');
    }
  } catch (error) {
    alert('Server error updating status');
  }
}

function showChatError(message) {
  const container = document.getElementById('chatWrapper');
  if (container) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h2>Conversation Unavailable</h2>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">${escapeHtml(message)}</p>
        <a href="swap-requests.html" class="btn btn-primary">Return to Swap Requests</a>
      </div>
    `;
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
