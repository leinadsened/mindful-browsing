(() => {
  /// <reference types="chrome" />

  // Guard to prevent the script from running multiple times on the same page
  if ((window as any).hasRun) {
    return;
  }
  (window as any).hasRun = true;

  // Store processed image IDs to avoid reprocessing
  const processedImageIds = new Set<string>();

  function processSingleImage(img: HTMLImageElement) {
    if (!img.id) {
      img.id = `food-blur-ext-${Math.random().toString(36).substring(2)}`;
    }

    // Avoid reprocessing the same image
    if (processedImageIds.has(img.id)) {
      return;
    }
    processedImageIds.add(img.id);

    // Immediately blur the image
    img.style.filter = 'blur(10px)';

    try {
      // Use currentSrc for better accuracy with srcset, fallback to src
      const imageUrl = img.currentSrc || img.src;
      if (!imageUrl) return; // Skip if no image source

      chrome.runtime.sendMessage({
        type: 'image',
        src: imageUrl,
        imageId: img.id,
      });
    } catch (e) {
      console.error('Could not process image', e);
    }
  }

  function setupObservers() {
    const intersectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          processSingleImage(entry.target as HTMLImageElement);
          intersectionObserver.unobserve(entry.target);
        }
      }
    });

    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node instanceof HTMLImageElement) {
            intersectionObserver.observe(node);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const images = (node as Element).getElementsByTagName('img');
            for (const img of Array.from(images)) {
              intersectionObserver.observe(img);
            }
          }
        }
      }
    });

    // Start observing the entire document for changes
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also observe images that are already on the page
    const initialImages = Array.from(document.getElementsByTagName('img'));
    for (const img of initialImages) {
      intersectionObserver.observe(img);
    }
  }

  chrome.runtime.onMessage.addListener(
    (message: { isSafe: boolean; imageId: string }) => {
      if (message.isSafe) {
        const img = document.getElementById(message.imageId);
        if (img) {
          // Un-blur the image if it's safe
          img.style.filter = '';
        }

      }
    }
  );

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.blurEnabled) {
      console.log(
        'blurEnabled state changed to:',
        changes.blurEnabled.newValue
      );
      if (changes.blurEnabled.newValue) {
        setupObservers();
      } else {
        // Remove blur from all images
        const images = Array.from(document.getElementsByTagName('img'));
        for (const img of images) {
          img.style.filter = '';
        }
        // Clear the set of processed images
        processedImageIds.clear();
        // It's good practice to disconnect observers when not in use
        // but for simplicity, we'll leave them running.
      }
    }
  });

  chrome.storage.sync.get('blurEnabled', (data) => {
    console.log('Initial blurEnabled state:', data.blurEnabled);
    if (data.blurEnabled) {
      setupObservers();
    }
  });
})();
