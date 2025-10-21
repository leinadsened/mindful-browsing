document.addEventListener('DOMContentLoaded', () => {
  const blurToggle = document.getElementById('blurToggle') as HTMLInputElement;
  const confirmationMessage = document.getElementById(
    'confirmation-message'
  ) as HTMLParagraphElement;

  // Function to update confirmation message visibility
  function updateConfirmationVisibility() {
    if (blurToggle.checked) {
      confirmationMessage.classList.remove('hidden');
    } else {
      confirmationMessage.classList.add('hidden');
    }
  }

  // Load the saved state of the toggle
  chrome.storage.sync.get('blurEnabled', (data) => {
    blurToggle.checked = !!data.blurEnabled;
    updateConfirmationVisibility();
  });

  // Save the state of the toggle when it's changed
  blurToggle.addEventListener('change', () => {
    chrome.storage.sync.set({ blurEnabled: blurToggle.checked });
    updateConfirmationVisibility();
  });

  // --- Status Logic ---
  const statusMessage = document.getElementById(
    'status-message'
  ) as HTMLParagraphElement;

  function updateStatus() {
    // Read status from local storage, which is set by the background script
    chrome.storage.local.get(['modelStatus', 'processingStatus'], (data) => {
      const { modelStatus, processingStatus } = data;

      if (modelStatus === 'downloading') {
        statusMessage.textContent = 'Downloading AI model...';
        statusMessage.classList.remove('hidden');
        console.log('Downloading AI model...'); // Add this line
      } else if (modelStatus === 'unavailable') {
        statusMessage.textContent = 'AI features not available on this browser.';
        statusMessage.classList.remove('hidden');
        console.warn('AI features not available on this browser.'); // Add this line
      } else if (processingStatus === 'processing') {
        statusMessage.textContent = 'Analyzing image...';
        statusMessage.classList.remove('hidden');
      } else {
        statusMessage.classList.add('hidden');
        statusMessage.textContent = ''; // Clear text when hidden
      }
    });
  }

  updateStatus();

  // Listen for changes in storage and update the status accordingly
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && (changes.modelStatus || changes.processingStatus)) {
      console.log('Storage changed, updating status:', changes);
      updateStatus();
    }
  });
});