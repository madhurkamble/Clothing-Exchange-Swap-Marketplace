// Spinner helper
function showSpinner() {
  const container = document.querySelector('.spinner-container');
  if (container) container.classList.add('active');
}

function hideSpinner() {
  const container = document.querySelector('.spinner-container');
  if (container) container.classList.remove('active');
}

// Global fetch wrapper to show spinner during any network request
const originalFetch = fetch;
window.fetch = async (...args) => {
  showSpinner();
  try {
    return await originalFetch(...args);
  } finally {
    hideSpinner();
  }
};
// Functions are global; no ES module export needed for vanilla script usage.
// Functions are global; no ES module export needed for vanilla script usage.
